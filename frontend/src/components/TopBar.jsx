import { useState } from 'react'

const S = {
  bar: {
    display:'flex', alignItems:'center', gap:20, padding:'0 20px',
    height:56, background:'var(--bg2)', borderBottom:'1px solid var(--border)',
    flexShrink:0,
  },
  brand: { display:'flex', alignItems:'center', gap:10, flexShrink:0 },
  brandName: { fontSize:16, fontWeight:700, color:'var(--text)', letterSpacing:'-0.3px' },
  brandTag: {
    fontSize:10, fontFamily:'var(--mono)', color:'var(--accent)',
    background:'var(--accent-glow)', padding:'2px 7px', borderRadius:4,
    border:'1px solid rgba(124,109,250,0.2)', letterSpacing:'0.5px',
  },
  form: (focused) => ({
    display:'flex', alignItems:'center', flex:1, maxWidth:560,
    background:'var(--bg3)', border:`1px solid ${focused ? 'var(--accent)' : 'var(--border)'}`,
    borderRadius:'var(--radius)', padding:'0 4px 0 12px', gap:8,
    boxShadow: focused ? '0 0 0 3px var(--accent-glow)' : 'none',
    transition:'border-color 0.15s, box-shadow 0.15s',
  }),
  input: {
    flex:1, background:'none', border:'none', outline:'none',
    color:'var(--text)', fontFamily:'var(--mono)', fontSize:12, padding:'8px 0',
  },
  btn: (disabled) => ({
    background: disabled ? 'rgba(124,109,250,0.3)' : 'var(--accent)',
    color:'#fff', border:'none', borderRadius:7, padding:'5px 14px',
    fontFamily:'var(--font)', fontSize:12, fontWeight:600,
    cursor: disabled ? 'not-allowed' : 'pointer', whiteSpace:'nowrap',
  }),
  right: { display:'flex', alignItems:'center', gap:8, marginLeft:'auto', flexShrink:0 },
  badge: (accent) => ({
    fontSize:11, fontFamily:'var(--mono)', padding:'3px 9px', borderRadius:5,
    color: accent ? 'var(--accent2)' : 'var(--text2)',
    background: accent ? 'var(--accent-glow)' : 'var(--bg3)',
    border: `1px solid ${accent ? 'rgba(124,109,250,0.25)' : 'var(--border)'}`,
  }),
  themeBtn: {
    width:34, height:34, borderRadius:8, border:'1px solid var(--border2)',
    background:'var(--bg3)', cursor:'pointer', display:'flex',
    alignItems:'center', justifyContent:'center', color:'var(--text2)',
    transition:'background 0.15s, border-color 0.15s',
    flexShrink:0,
  },
}

export default function TopBar({ onLoad, dark, onToggleDark }) {
  const [url, setUrl]         = useState('')
  const [focused, setFocused] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (!url.trim()) return
    onLoad(url.trim())
    setUrl('')
  }

  return (
    <header style={S.bar}>
      <div style={S.brand}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <rect x="1" y="1" width="7" height="7" rx="1.5" fill="var(--accent)"/>
          <rect x="10" y="1" width="7" height="7" rx="1.5" fill="var(--accent)" opacity=".5"/>
          <rect x="1" y="10" width="7" height="7" rx="1.5" fill="var(--accent)" opacity=".5"/>
          <rect x="10" y="10" width="7" height="7" rx="1.5" fill="var(--accent)" opacity=".3"/>
        </svg>
        <span style={S.brandName}>CodeLens</span>
        <span style={S.brandTag}>AI Debugger</span>
      </div>

      <form style={S.form(focused)} onSubmit={handleSubmit}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2">
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
        </svg>
        <input
          type="text"
          placeholder="https://github.com/user/repository"
          value={url}
          onChange={e => setUrl(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={S.input}
          spellCheck={false}
        />
        <button type="submit" disabled={!url.trim()} style={S.btn(!url.trim())}>
          Load repo
        </button>
      </form>

      <div style={S.right}>
        <span style={S.badge(false)}>llama-3.3-70b</span>
        <span style={S.badge(true)}>Groq</span>

        {/* theme toggle */}
        <button style={S.themeBtn} onClick={onToggleDark} title={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
          {dark ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>
      </div>
    </header>
  )
}
