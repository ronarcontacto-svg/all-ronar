// Guía con IA (Gemini). Función serverless de Vercel.
// La clave GEMINI_API_KEY vive solo en el entorno del servidor; nunca llega al navegador.
// Verifica la sesión de Supabase y lee solo los registros del propio usuario (RLS).

const MODELO = 'gemini-2.5-flash';
const MAX_MENSAJE = 2000;

const INSTRUCCIONES = `Eres la guía de práctica de Senda Cuántica, una herramienta personal de autoobservación.
Hablas en español, tuteando, con tono sereno y sobrio. Nunca prometes resultados ni presentas
ideas del marco (PNL, coherencia, sintonía) como hechos científicos.
Tu función: ayudar a la persona a observar sus registros, hacer preguntas que afinen la mirada
y sugerir una práctica pequeña para la próxima vez. Respuestas breves (4 a 8 frases).
No eres terapeuta ni médico. Si detectas angustia intensa, pensamientos de hacerse daño o una
situación de riesgo, responde con calma y recomienda hablar con un profesional de inmediato o con
los servicios de emergencia de su país.
Usa solo los registros que se te dan; si faltan datos, dilo y pregunta.`;

async function supabase(path, token) {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  return fetch(`${url}${path}`, {
    headers: { apikey: key, Authorization: `Bearer ${token}` },
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido.' });

  const token = (req.headers.authorization || '').replace(/^Bearer /, '');
  const gemini = process.env.GEMINI_API_KEY;
  if (!token || !gemini || !process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
    return res.status(500).json({ error: 'La guía no está configurada todavía.' });
  }

  // Comprueba que la sesión es válida antes de tocar nada.
  const quien = await supabase('/auth/v1/user', token);
  if (!quien.ok) return res.status(401).json({ error: 'Tu sesión ha caducado. Entra de nuevo.' });

  const { mensaje = '', historial = [] } = req.body || {};
  const texto = String(mensaje).trim().slice(0, MAX_MENSAJE);
  if (!texto) return res.status(400).json({ error: 'Escribe un mensaje.' });

  // Registros recientes del propio usuario, con su token (RLS limita lo que puede leer).
  const [obs, ints, sint] = await Promise.all([
    supabase('/rest/v1/observaciones?select=creada_en,disparador,emocion,intensidad,juicio,elijo&order=creada_en.desc&limit=10', token).then((r) => r.json()),
    supabase('/rest/v1/intenciones_diarias?select=fecha,eleccion,modo_real,variante_cumplida&order=fecha.desc&limit=7', token).then((r) => r.json()),
    supabase('/rest/v1/sintonias?select=creada_en,lectura_entrada,lectura_salida&order=creada_en.desc&limit=10', token).then((r) => r.json()),
  ]);

  const contenido = [
    ...historial.slice(-8).map((m) => ({
      role: m.rol === 'guia' ? 'model' : 'user',
      parts: [{ text: String(m.texto || '').slice(0, MAX_MENSAJE) }],
    })),
    {
      role: 'user',
      parts: [
        {
          text: `Registros recientes (JSON):\n${JSON.stringify({ observaciones: obs, intenciones: ints, sintonias: sint })}\n\nMensaje:\n${texto}`,
        },
      ],
    },
  ];

  const respuesta = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent?key=${gemini}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: INSTRUCCIONES }] },
        contents: contenido,
        generationConfig: { temperature: 0.7, maxOutputTokens: 600 },
      }),
    },
  );

  if (!respuesta.ok) return res.status(502).json({ error: 'La guía no responde ahora. Inténtalo más tarde.' });
  const datos = await respuesta.json();
  const respuestaTexto = datos?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('').trim() ?? '';
  if (!respuestaTexto) return res.status(502).json({ error: 'La guía no devolvió respuesta. Inténtalo de nuevo.' });

  return res.status(200).json({ texto: respuestaTexto });
}
