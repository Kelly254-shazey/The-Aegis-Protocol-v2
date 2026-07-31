import React from 'react'
import ReactDOM from 'react-router-dom' // We use React DOM from react-dom/client but create-electron-vite sets up main.tsx

import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
