import ReactDOM from 'react-dom/client'
import { useState, useEffect } from 'react'
import App from './App'
import './index.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function BootScreen({ onReady }: { onReady: () => void }) {
  const [status, setStatus] = useState<'loading' | 'error'>('loading')

  useEffect(() => {
    const ctrl = new AbortController()
    const timeout = setTimeout(() => ctrl.abort(), 6000)
    fetch(`${API_URL}/api-status`, { signal: ctrl.signal })
      .then((res) => {
        clearTimeout(timeout)
        if (res.ok) { onReady() } else { setStatus('error') }
      })
      .catch(() => {
        clearTimeout(timeout)
        setStatus('error')
      })
    return () => { clearTimeout(timeout); ctrl.abort() }
  }, [])

  if (status === 'error') {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Servidor no disponible</h2>
          <p className="text-sm text-gray-500 mb-6">No se pudo conectar con el backend. Verificá que el servidor esté corriendo.</p>
          <button onClick={() => window.location.reload()} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-500 rounded-xl transition-colors">
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-[3px] border-amber-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-gray-500">Conectando con el servidor...</p>
      </div>
    </div>
  )
}

function Root() {
  const [ready, setReady] = useState(false)

  if (!ready) {
    return <BootScreen onReady={() => setReady(true)} />
  }

  return <App />
}

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />)
