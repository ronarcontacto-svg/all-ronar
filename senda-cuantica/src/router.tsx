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
const rutaPerfil = createRoute({ getParentRoute: () => zonaPrivada, path: '/perfil', component: Perfil });

const arbol = raiz.addChildren([
  indice,
  rutaEntrar,
  rutaCondiciones,
  zonaPrivada.addChildren([rutaHoy, rutaIntencion, rutaCuaderno, rutaSintonia, rutaPerfil]),
]);

export const router = createRouter({ routeTree: arbol });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
