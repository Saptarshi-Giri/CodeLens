import { useState, useRef, useEffect } from 'react'

const SUGGESTIONS = [
  'What does this codebase do?',
  'Find any potential bugs',
  'How is authentication handled?',
  'Explain the main data flow',
  'What are the API endpoints?',
]

function formatText(text) {
  const lines = text.split('\n')
  const result = []
  let codeLines = []
  let inCode = false
  let lang = ''

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.startsWith('```')) {
      if (!inCode) {
        inCode = true
        lang = line.slice(3).trim()
        codeLines = []
      } else {
        result.push(
          <pre key={i} style={{
            background:'var(--bg3)', border:'1px solid var(--border)',
            borderRadius:8, padding:'12px 14px', margin:'10px 0',
            overflowX:'auto', position:'relative',
          }}>
            {lang && <span style={{
              display:'block', fontSize:9, fontFamily:'var(--mono)',
              color:'var(--text3)', textTransform:'uppercase',
              letterSpacing:1, marginBottom:8,
            }}>{lang}</span>}
            <code style={{ fontFamily:'var(--mono)', fontSize:12, color:'var(--text)', lineHeight:1.7 }}>
              {codeLines.join('\n')}
            </code>
          </pre>
        )
        inCode = false
        codeLines = []
        lang = ''
      }
    } else if (inCode) {
      codeLines.push(line)
    } else {
      const parts = line.split(/(`[^`]+`|\*\*[^*]+\*\*)/g)
      const formatted = parts.map((p, j) => {
        if (p.startsWith('`') && p.endsWith('`'))
          return <code key={j} style={{
            fontFamily:'var(--mono)', fontSize:12, background:'var(--bg3)',
            color:'var(--accent2)', padding:'1px 5px', borderRadius:4,
            border:'1px solid var(--border)',
          }}>{p.slice(1,-1)}</code>
        if (p.startsWith('**') && p.endsWith('**'))
          return <strong key={j}>{p.slice(2,-2)}</strong>
        return p
      })
      if (line.trim()) result.push(
        <p key={i} style={{ color:'var(--text)', fontSize:14, lineHeight:1.7, marginBottom:8 }}>
          {formatted}
        </p>
      )
    }
  }
  return result
}

export default function ChatPanel({ messages, loading, onSend, hasSession }) {
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  function handleSend() {
    if (!input.trim() || !hasSession || loading) return
    onSend(input.trim())
    setInput('')
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <main style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', background:'var(--bg)' }}>

      {/* messages area */}
      <div style={{ flex:1, overflowY:'auto', padding:'24px 0' }}>

        {messages.length === 0 && (
          <div style={{
            display:'flex', flexDirection:'column', alignItems:'center',
            justifyContent:'center', minHeight:'60vh', gap:12,
            textAlign:'center', padding:'40px 24px',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <div style={{ fontSize:18, fontWeight:600, color:'var(--text)' }}>Load a repository to start</div>
            <div style={{ fontSize:13, color:'var(--text2)', maxWidth:360, lineHeight:1.6 }}>
              Paste a GitHub URL in the top bar, then ask anything about the code
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center', marginTop:12, maxWidth:560 }}>
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => hasSession && onSend(s)} disabled={!hasSession} style={{
                  background:'var(--bg3)', border:'1px solid var(--border2)',
                  color:'var(--text2)', padding:'7px 14px', borderRadius:20,
                  fontSize:12, fontFamily:'var(--font)', cursor: hasSession ? 'pointer' : 'not-allowed',
                  opacity: hasSession ? 1 : 0.4,
                }}>{s}</button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{
            display:'flex', gap:14, padding:'10px 28px',
            maxWidth:860, margin:'0 auto', width:'100%',
            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
          }}>
            {/* avatar */}
            <div style={{
              width:28, height:28, borderRadius:8, display:'flex',
              alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2,
              background: msg.role === 'assistant' ? 'var(--accent-glow)' : 'var(--bg3)',
              border: `1px solid ${msg.role === 'assistant' ? 'rgba(124,109,250,0.2)' : 'var(--border)'}`,
              color: msg.role === 'assistant' ? 'var(--accent2)' : 'var(--text2)',
            }}>
              {msg.role === 'user' ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 18 18" fill="none">
                  <rect x="1" y="1" width="7" height="7" rx="1.5" fill="currentColor"/>
                  <rect x="10" y="1" width="7" height="7" rx="1.5" fill="currentColor" opacity=".6"/>
                  <rect x="1" y="10" width="7" height="7" rx="1.5" fill="currentColor" opacity=".6"/>
                  <rect x="10" y="10" width="7" height="7" rx="1.5" fill="currentColor" opacity=".35"/>
                </svg>
              )}
            </div>

            {/* bubble */}
            <div style={{
              flex:1, minWidth:0,
              ...(msg.role === 'user' ? {
                background:'var(--bg3)', border:'1px solid var(--border)',
                borderRadius:'12px 2px 12px 12px', padding:'10px 14px',
              } : {}),
            }}>
              {msg.error
                ? <p style={{ color:'var(--red)', fontSize:14 }}>{msg.text}</p>
                : formatText(msg.text)
              }
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display:'flex', gap:14, padding:'10px 28px', maxWidth:860, margin:'0 auto', width:'100%' }}>
            <div style={{
              width:28, height:28, borderRadius:8, display:'flex', alignItems:'center',
              justifyContent:'center', background:'var(--accent-glow)',
              border:'1px solid rgba(124,109,250,0.2)', color:'var(--accent2)',
            }}>
              <svg width="13" height="13" viewBox="0 0 18 18" fill="none">
                <rect x="1" y="1" width="7" height="7" rx="1.5" fill="currentColor"/>
                <rect x="10" y="1" width="7" height="7" rx="1.5" fill="currentColor" opacity=".6"/>
                <rect x="1" y="10" width="7" height="7" rx="1.5" fill="currentColor" opacity=".6"/>
                <rect x="10" y="10" width="7" height="7" rx="1.5" fill="currentColor" opacity=".35"/>
              </svg>
            </div>
            <div style={{ display:'flex', gap:5, paddingTop:10 }}>
              {[0,1,2].map(n => (
                <span key={n} style={{
                  width:6, height:6, borderRadius:'50%', background:'var(--accent)',
                  display:'inline-block',
                  animation:`dot 1.2s ${n*0.2}s infinite`,
                }}/>
              ))}
            </div>
          </div>
        )}

        <style>{`
          @keyframes dot {
            0%,80%,100%{transform:scale(0.6);opacity:0.3}
            40%{transform:scale(1);opacity:1}
          }
        `}</style>

        <div ref={bottomRef}/>
      </div>

      {/* input area */}
      <div style={{ borderTop:'1px solid var(--border)', padding:'14px 20px 16px', background:'var(--bg2)' }}>
        {hasSession && messages.length > 0 && (
          <div style={{ display:'flex', gap:6, marginBottom:10, flexWrap:'wrap' }}>
            {SUGGESTIONS.slice(0,3).map((s,i) => (
              <button key={i} onClick={() => onSend(s)} disabled={loading} style={{
                background:'var(--bg3)', border:'1px solid var(--border2)',
                color:'var(--text2)', padding:'4px 10px', borderRadius:20,
                fontSize:11, fontFamily:'var(--font)', cursor:'pointer',
                opacity: loading ? 0.4 : 1,
              }}>{s}</button>
            ))}
          </div>
        )}

        <div style={{ display:'flex', gap:10, alignItems:'flex-end' }}>
          <textarea
            style={{
              flex:1, background:'var(--bg3)', border:'1px solid var(--border2)',
              borderRadius:'var(--radius)', color:'var(--text)', fontFamily:'var(--font)',
              fontSize:14, padding:'10px 14px', outline:'none', resize:'none',
              lineHeight:1.5, maxHeight:120, overflowY:'auto',
              opacity: (!hasSession || loading) ? 0.4 : 1,
            }}
            placeholder={hasSession ? 'Ask about the codebase...' : 'Load a repository first'}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={!hasSession || loading}
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || !hasSession || loading}
            style={{
              width:40, height:40, borderRadius:10, background:'var(--accent)',
              border:'none', color:'#fff', cursor: (!input.trim() || !hasSession || loading) ? 'not-allowed' : 'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
              opacity: (!input.trim() || !hasSession || loading) ? 0.3 : 1,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
        <div style={{ fontSize:10, color:'var(--text3)', marginTop:6, textAlign:'right' }}>
          Enter to send · Shift+Enter for new line
        </div>
      </div>
    </main>
  )
}
