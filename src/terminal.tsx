import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './reset.css'

createRoot(document.getElementById('terminal-root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
