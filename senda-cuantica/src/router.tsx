import { Navigate, Outlet, createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { LayoutProtegido } from './components/Shell';
import { useSesion } from './lib/sesion';
import { Entrar } from './routes/Entrar';
import { Condiciones } from './routes/Condiciones';
import { Hoy } from './routes/Hoy';
import { Intencion } from './routes/Intencion';
import { Cuaderno } from './routes/Cuaderno';
import { Sintonia } from './routes/Sintonia';
import { Perfil } from './routes/Perfil';
import { RuedaVida } from './routes/Rueda';
import { Reencuadre } from './routes/Reencuadre';
import { Niveles } from './routes/Niveles';
import { Metamodelo } from './routes/Metamodelo';
import { Posiciones } from './routes/Posiciones';
import { Herramientas } from './routes/Herramientas';
import { Guia } from './routes/Guia';
import { Acerca } from './routes/Acerca';

const raiz = createRootRoute({ component: () => <Outlet /> });

function RaizRedirigida() {
  const { cargando, sesion, consentido } = useSesion();
  if (cargando) return null;
  if (!sesion) return <Navigate to="/entrar" />;
  return <Navigate to={consentido ? '/hoy' : '/condiciones'} />;
}

const indice = createRoute({ getParentRoute: () => raiz, path: '/', component: RaizRedirigida });

const rutaEntrar = createRoute({ getParentRoute: () => raiz, path: '/entrar', component: Entrar });
const rutaCondiciones = createRoute({
  getParentRoute: () => raiz,
  path: '/condiciones',
  component: Condiciones,
});

const zonaPrivada = createRoute({
  getParentRoute: () => raiz,
  id: 'privada',
  component: LayoutProtegido,
});

const rutaHoy = createRoute({ getParentRoute: () => zonaPrivada, path: '/hoy', component: Hoy });
const rutaIntencion = createRoute({
  getParentRoute: () => zonaPrivada,
  path: '/intencion',
  component: Intencion,
});
const rutaCuaderno = createRoute({
  getParentRoute: () => zonaPrivada,
  path: '/cuaderno',
  component: Cuaderno,
});
const rutaSintonia = createRoute({
  getParentRoute: () => zonaPrivada,
  path: '/sintonia',
  component: Sintonia,
});
const rutaRueda = createRoute({ getParentRoute: () => zonaPrivada, path: '/rueda', component: RuedaVida });
const rutaReencuadre = createRoute({
  getParentRoute: () => zonaPrivada,
  path: '/reencuadre',
  component: Reencuadre,
});
const rutaNiveles = createRoute({ getParentRoute: () => zonaPrivada, path: '/niveles', component: Niveles });
const rutaMetamodelo = createRoute({
  getParentRoute: () => zonaPrivada,
  path: '/metamodelo',
  component: Metamodelo,
});
const rutaPosiciones = createRoute({
  getParentRoute: () => zonaPrivada,
  path: '/posiciones',
  component: Posiciones,
});
const rutaGuia = createRoute({ getParentRoute: () => zonaPrivada, path: '/guia', component: Guia });
const rutaAcerca = createRoute({ getParentRoute: () => zonaPrivada, path: '/acerca', component: Acerca });
const rutaHerramientas = createRoute({
  getParentRoute: () => zonaPrivada,
  path: '/herramientas',
  component: Herramientas,
});
const rutaPerfil = createRoute({ getParentRoute: () => zonaPrivada, path: '/perfil', component: Perfil });

const arbol = raiz.addChildren([
  indice,
  rutaEntrar,
  rutaCondiciones,
  zonaPrivada.addChildren([
    rutaHoy,
    rutaIntencion,
    rutaCuaderno,
    rutaSintonia,
    rutaRueda,
    rutaReencuadre,
    rutaNiveles,
    rutaMetamodelo,
    rutaPosiciones,
    rutaGuia,
    rutaAcerca,
    rutaHerramientas,
    rutaPerfil,
  ]),
]);

export const router = createRouter({ routeTree: arbol });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
