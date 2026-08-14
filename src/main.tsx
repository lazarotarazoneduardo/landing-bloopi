import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/inter'
import '@fontsource-variable/fraunces'
import './index.css'
import App from './App.tsx'
import { CronologiaPage } from './pages/Cronologia.tsx'
import { SeguridadInfantilPage } from './pages/SeguridadInfantil.tsx'
import { ComoSeHizoPage } from './pages/ComoSeHizo.tsx'

// Micro-routing sin dependencias: la landing es SPA y Vercel/Vite
// reescriben todo a index.html (vercel.json · appType 'spa').
const path = window.location.pathname.replace(/\/+$/, '')
const isCronologia = path === '/cronologia' || path === '/cronology'
// Requisito de Google Play (categoría Social): esta URL va pegada en la
// ficha de la tienda, así que NO se renombra ni se redirige — debe
// responder siempre y ser pública en todo el mundo.
const isSeguridadInfantil = path === '/seguridad-infantil'
// El «making of»: hermana de /cronologia. La canónica es /como-se-hizo; el
// resto son alias por si alguien la teclea a mano. La variante con acento
// llega percent-encoded (/c%C3%B3mo-...), así que se compara decodificada.
let decoded = path
try { decoded = decodeURIComponent(path) } catch { /* URL malformada: se queda cruda */ }
const isComoSeHizo = [
  '/como-se-hizo',
  '/cómo-se-hizo',
  '/como-se-construyo',
  '/cómo-se-construyó',
  '/making-of',
].includes(decoded)

function Route() {
  if (isSeguridadInfantil) return <SeguridadInfantilPage />
  if (isCronologia)        return <CronologiaPage />
  if (isComoSeHizo)        return <ComoSeHizoPage />
  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Route />
  </StrictMode>,
)
