import { createRoot } from 'react-dom/client'
import 'leaflet/dist/leaflet.css'
import './index.css'
import App from './App.jsx'

// Note: React StrictMode removed because react-leaflet v5 has incompatibility
// with Strict Mode's double-invocation behavior in development.
createRoot(document.getElementById('root')).render(
  <App />
)
