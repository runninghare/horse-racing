import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import App from './App.tsx'
import './tailwind.css'
import SpinningWheel from './SpinningWheel.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SpinningWheel />
  </StrictMode>,
)
