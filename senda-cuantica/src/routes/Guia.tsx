import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useSesion } from '../lib/sesion';
import { useTitulo } from '../lib/titulo';

type Mensaje = { rol: 'tu' | 'guia'; texto: string };

// Reconocimiento de voz del navegador (sin coste ni clave). Donde no existe, el micrófono no aparece.
type ReconocimientoLike = {
  lang: string;
  interimResults: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function reconocimiento(): ReconocimientoLike | null {
  const w = window as unknown as { SpeechRecognition?: new () => ReconocimientoLike; webkitSpeechRecognition?: new () => ReconocimientoLike };
  const Clase = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return Clase ? new Clase() : null;
}

export function Guia() {
  const { sesion } = useSesion();
  useTitulo('Guía');
  const [consentido, setConsentido] = useState(false);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [escuchando, setEscuchando] = useState(false);
  const [hablar, setHablar] = useState(false);
  const hayVoz = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const reconoc = useRef<ReconocimientoLike | null>(null);

  useEffect(() => {
    return () => {
      reconoc.current?.stop();
      if (hayVoz) window.speechSynthesis.cancel();
    };
  }, [hayVoz]);

  function dictar() {
    if (escuchando) {
      reconoc.current?.stop();
      return;
    }
    const r = reconocimiento();
    if (!r) return;
    r.lang = 'es-ES';
    r.interimResults = false;
    r.onresult = (e) => {
      const dicho = e.results[0][0].transcript;
      setTexto((t) => (t ? `${t} ${dicho}` : dicho));
    };
    r.onerror = () => setEscuchando(false);
    r.onend = () => setEscuchando(false);
    reconoc.current = r;
    setEscuchando(true);
    r.start();
  }

  function leer(t: string) {
    if (!hayVoz || !hablar) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(t);
    u.lang = 'es-ES';
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const token = sesion?.access_token;
    const mensaje = texto.trim();
    if (!token || !mensaje || enviando) return;
    setError(null);
    setEnviando(true);
    const historial = mensajes;
    setMensajes([...historial, { rol: 'tu', texto: mensaje }]);
    setTexto('');
    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mensaje, historial }),
      });
      const datos = (await res.json()) as { texto?: string; error?: string };
      if (!res.ok || !datos.texto) throw new Error(datos.error ?? 'Sin respuesta.');
      setMensajes((m) => [...m, { rol: 'guia', texto: datos.texto as string }]);
      leer(datos.texto);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo consultar a la guía.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="pantalla">
      <header className="cabecera">
        <p className="eyebrow">Acompañamiento</p>
        <h1 className="titulo">Guía</h1>
        <p className="tenue">
          Una guía de práctica que lee tus registros recientes y te devuelve preguntas y una práctica pequeña. No es
          terapia ni sustituye a un profesional.
        </p>
      </header>

      {!consentido ? (
        <section className="tarjeta hero formulario">
          <p className="eyebrow">Antes de empezar</p>
          <h2 className="subtitulo">Tus registros viajan a Google</h2>
          <p className="tenue">
            Para responder, la guía envía a Google (modelo Gemini) tus registros de los últimos días y el mensaje que
            escribas. No se usan para entrenar modelos según la configuración de tu cuenta de Google Cloud, y puedes
            dejar de usar la guía cuando quieras.
          </p>
          <label className="casilla">
            <input type="checkbox" onChange={(e) => setConsentido(e.target.checked)} />
            <span>Acepto que mis registros recientes se envíen a Google para generar las respuestas de la guía.</span>
          </label>
        </section>
      ) : (
        <>
          <section className="tarjeta conversacion" aria-live="polite">
            {mensajes.length === 0 && (
              <p className="tenue">Cuéntame qué situación quieres mirar, o pregunta por tus últimos registros.</p>
            )}
            {mensajes.map((m, i) => (
              <div key={i} className={`burbuja ${m.rol}`}>
                <p className="eyebrow">{m.rol === 'tu' ? 'Tú' : 'Guía'}</p>
                <p>{m.texto}</p>
              </div>
            ))}
            {enviando && <p className="tenue" role="status">La guía está pensando…</p>}
          </section>

          {error && <p className="error" role="alert">{error}</p>}

          <form className="tarjeta formulario" onSubmit={enviar}>
            <label className="etiqueta" htmlFor="mensaje-guia">Tu mensaje</label>
            <textarea
              id="mensaje-guia"
              className="campo area"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              maxLength={2000}
            />
            <div className="acciones">
              {reconocimiento() && (
                <button type="button" className="btn btn-sec" onClick={dictar} aria-pressed={escuchando}>
                  {escuchando ? 'Parar' : 'Dictar'}
                </button>
              )}
              {hayVoz && (
                <button type="button" className="btn btn-sec" aria-pressed={hablar} onClick={() => setHablar(!hablar)}>
                  {hablar ? 'Voz activada' : 'Leer respuestas'}
                </button>
              )}
              <button type="submit" className="btn btn-primario" disabled={enviando || !texto.trim()}>
                Enviar
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
