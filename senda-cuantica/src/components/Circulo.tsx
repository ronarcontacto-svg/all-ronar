import { useEffect, useState } from 'react';

/**
 * Círculo de respiración a 0.1 Hz: 5 s inhala, 5 s exhala.
 * Con «reducir movimiento» no escala: solo cambia la etiqueta.
 */
export function Circulo({ activo }: { activo: boolean }) {
  const [fase, setFase] = useState<'inhala' | 'exhala'>('inhala');

  useEffect(() => {
    if (!activo) return;
    const id = window.setInterval(() => {
      setFase((f) => (f === 'inhala' ? 'exhala' : 'inhala'));
    }, 5000);
    return () => window.clearInterval(id);
  }, [activo]);

  return (
    <div className="circulo-zona">
      <div className={`circulo ${activo ? fase : 'reposo'}`} aria-hidden="true" />
      <p className="fase" aria-live="polite">
        {activo ? (fase === 'inhala' ? 'Inhala' : 'Exhala') : 'Pausa'}
      </p>
    </div>
  );
}
