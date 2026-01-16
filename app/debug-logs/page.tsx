'use client'

import { useEffect, useState } from 'react'

export default function DebugLogsPage() {
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    const loadLogs = () => {
      const storedLogs = localStorage.getItem('auth_debug_logs')
      if (storedLogs) {
        setLogs(JSON.parse(storedLogs))
      }
    }

    loadLogs()
    const interval = setInterval(loadLogs, 1000)

    return () => clearInterval(interval)
  }, [])

  const clearLogs = () => {
    localStorage.removeItem('auth_debug_logs')
    setLogs([])
  }

  const copyLogs = () => {
    const text = logs.join('\n')
    navigator.clipboard.writeText(text)
    alert('Logs copiés dans le presse-papier!')
  }

  return (
    <div className="min-h-screen p-8 bg-retro-darker">
      <div className="max-w-4xl mx-auto">
        <div className="glass-effect p-6 rounded-lg retro-border mb-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold retro-glow">Debug Logs</h1>
            <div className="flex gap-2">
              <button
                onClick={copyLogs}
                className="px-4 py-2 bg-retro-secondary text-retro-dark font-bold rounded hover:bg-retro-secondary/90"
              >
                Copier les logs
              </button>
              <button
                onClick={clearLogs}
                className="px-4 py-2 bg-red-500 text-white font-bold rounded hover:bg-red-600"
              >
                Effacer
              </button>
            </div>
          </div>
        </div>

        <div className="glass-effect p-6 rounded-lg retro-border">
          <div className="bg-retro-dark p-4 rounded font-mono text-sm overflow-auto max-h-[600px]">
            {logs.length === 0 ? (
              <p className="text-retro-light/60">Aucun log pour le moment...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1 text-retro-light/80">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
