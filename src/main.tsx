import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/inter'
import '@fontsource-variable/fraunces'
import './index.css'
import App from './App.tsx'
import { CronologiaPage } from './pages/Cronologia.tsx'

// Micro-routing sin dependencias: la landing es SPA y Vercel/Vite
// reescriben todo a index.html (vercel.json · appType 'spa').
const path = window.location.pathname.replace(/\/+$/, '')
const isCronologia = path === '/cronologia' || path === '/cronology'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isCronologia ? <CronologiaPage /> : <App />}
  </StrictMode>,
)
