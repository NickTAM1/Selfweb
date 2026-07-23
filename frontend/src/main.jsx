import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import TelemetryLoader from './components/TelemetryLoader.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TelemetryLoader>
      <App />
    </TelemetryLoader>
  </StrictMode>,
)
