import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

export default function InstallBanner() {
  const [prompt, setPrompt] = useState(null)
  const [visible, setVisible] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    // Verifica se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true)
      return
    }

    // Já dispensou o banner antes?
    if (localStorage.getItem('direction_pwa_dismissed')) return

    const handler = (e) => {
      e.preventDefault()
      setPrompt(e)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setVisible(false)
  }

  const handleDismiss = () => {
    setVisible(false)
    localStorage.setItem('direction_pwa_dismissed', '1')
  }

  if (!visible || installed) return null

  return (
    <div style={{
      position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
      zIndex: 90, width: 'calc(100% - 40px)', maxWidth: 420,
      background: '#0D0D35',
      border: '1px solid rgba(0,212,255,0.3)',
      borderRadius: 16, padding: '16px 18px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', gap: 14,
      animation: 'slideUpBanner .3s ease',
    }}>
      <style>{`
        @keyframes slideUpBanner {
          from { transform: translateX(-50%) translateY(20px); opacity: 0; }
          to   { transform: translateX(-50%) translateY(0);    opacity: 1; }
        }
      `}</style>

      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: 'linear-gradient(135deg, #0066FF, #00D4FF)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Download size={20} color="#fff" />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
          Instalar no celular
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
          Acesse a Direction como um app nativo
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button onClick={handleInstall} style={{
          padding: '8px 16px', borderRadius: 8,
          background: 'linear-gradient(135deg, #00D4FF, #0066FF)',
          border: 'none', color: '#fff', fontWeight: 700,
          fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)',
        }}>
          Instalar
        </button>
        <button onClick={handleDismiss} style={{
          padding: '8px', borderRadius: 8,
          background: 'rgba(255,255,255,0.08)', border: 'none',
          color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
        }}>
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
