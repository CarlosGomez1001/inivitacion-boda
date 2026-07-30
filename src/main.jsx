import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import AdminApp from './admin/AdminApp.jsx'
import './index.css'

function resolverVista() {
  const { pathname, search } = window.location

  if (pathname.startsWith('/admin')) {
    return <AdminApp />
  }

  // Soporta tanto /invitacion/<token> como ?invitado=<token>
  const matchRuta = pathname.match(/^\/invitacion\/([^/]+)/)
  const tokenInvitado = matchRuta
    ? matchRuta[1]
    : new URLSearchParams(search).get('invitado')

  return <App tokenInvitado={tokenInvitado} />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>{resolverVista()}</StrictMode>,
)
