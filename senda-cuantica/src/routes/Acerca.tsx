import { useTitulo } from '../lib/titulo';

// Un único lugar para lo que hay que saber de la práctica. El resto de pantallas no repite avisos.
export function Acerca() {
  useTitulo('Acerca de la práctica');
  return (
    <div className="pantalla">
      <header className="cabecera">
        <p className="eyebrow">Para leer con calma</p>
        <h1 className="titulo">Acerca de la práctica</h1>
      </header>

      <section className="tarjeta">
        <p className="eyebrow">El marco</p>
        <h2 className="subtitulo">Dos formas de actuar</h2>
        <p>
          Según el marco que sigue esta práctica, se puede actuar desde el esfuerzo por forzar un resultado, o desde
          una elección tranquila. Aquí no se busca tener razón, sino observar cuál de las dos aparece en cada día.
        </p>
        <p className="tenue">Es una manera de practicar y mirar, no una afirmación sobre cómo funciona la realidad.</p>
      </section>

      <section className="tarjeta">
        <p className="eyebrow">Lo que no es</p>
        <h2 className="subtitulo">No es terapia</h2>
        <p>
          Senda Cuántica no sustituye a un médico, a un psicólogo ni a otro profesional. No promete resultados. Si
          algo te pesa mucho, habla con alguien de confianza o con un profesional.
        </p>
      </section>

      <section className="tarjeta">
        <p className="eyebrow">Tus registros</p>
        <h2 className="subtitulo">Son tuyos</h2>
        <p>
          Solo tú los ves. Puedes descargarlos en cualquier momento y borrarlos desde tu perfil. Las condiciones de uso
          están en la sección Condiciones.
        </p>
      </section>
    </div>
  );
}
