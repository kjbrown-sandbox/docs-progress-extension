import React, { useEffect, useState } from 'react'

export default function Popup() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    // Listen for pushed updates
    const listener = (msg: any) => {
      if (msg && msg.type === 'DOC_WORD_COUNT') setCount(msg.count)
    }
    chrome.runtime.onMessage.addListener(listener)
    // request immediate
    requestCount()
    return () => {
      // @ts-ignore - no easy remove for this small example
    }
  }, [])

  function setCountLocal(n: number) {
    setCount(n)
  }

  function requestCount() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || tabs.length === 0) return
      chrome.tabs.sendMessage(tabs[0].id, { type: 'REQUEST_WORD_COUNT' }, (resp) => {
        if (chrome.runtime.lastError) {
          setCount(null)
          return
        }
        if (resp && typeof resp.count === 'number') setCountLocal(resp.count)
      })
    })
  }

  return (
    <div style={{ width: 320, padding: 12, fontFamily: 'Arial, sans-serif' }}>
      <div style={{ color: '#666', fontSize: 12 }}>Today</div>
      <div style={{ fontSize: 32, fontWeight: 700 }}>{count === null ? '—' : count}</div>
      <div style={{ height: 12, background: '#eee', borderRadius: 6, overflow: 'hidden', marginTop: 8 }}>
        <div style={{ height: '100%', background: 'linear-gradient(90deg,#1a73e8,#4caf50)', width: `${Math.min(100, Math.round(((count || 0) / 2000) * 100))}%` }} />
      </div>
      <div style={{ marginTop: 8 }}>
        <button onClick={requestCount}>Refresh</button>
      </div>
    </div>
  )
}
