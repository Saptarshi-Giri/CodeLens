const STEPS = ['queued', 'cloning', 'chunking', 'embedding']

export default function LoaderModal({ status, statusLabel }) {
  const currentStep = STEPS.indexOf(status)

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(10,10,15,0.85)',
      display:'flex', alignItems:'center', justifyContent:'center', zIndex:100,
    }}>
      <div style={{
        background:'var(--bg2)', border:'1px solid var(--border2)',
        borderRadius:'var(--radius-lg)', padding:'28px 32px', width:360,
      }}>
        {/* header */}
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24 }}>
          <svg width="28" height="28" viewBox="0 0 18 18" fill="none" style={{ animation:'pulse 2s ease-in-out infinite' }}>
            <rect x="1" y="1" width="7" height="7" rx="1.5" fill="var(--accent)"/>
            <rect x="10" y="1" width="7" height="7" rx="1.5" fill="var(--accent)" opacity=".6"/>
            <rect x="1" y="10" width="7" height="7" rx="1.5" fill="var(--accent)" opacity=".6"/>
            <rect x="10" y="10" width="7" height="7" rx="1.5" fill="var(--accent)" opacity=".35"/>
          </svg>
          <div>
            <div style={{ fontSize:15, fontWeight:600, color:'var(--text)', marginBottom:3 }}>
              Loading Repository
            </div>
            <div style={{ fontSize:12, color:'var(--accent2)', fontFamily:'var(--mono)' }}>
              {statusLabel[status] || status}
            </div>
          </div>
        </div>

        {/* steps */}
        <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:20 }}>
          {STEPS.map((step, i) => {
            const done   = i < currentStep
            const active = i === currentStep
            return (
              <div key={step} style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{
                  width:20, height:20, borderRadius:'50%', display:'flex',
                  alignItems:'center', justifyContent:'center', flexShrink:0,
                  background: done ? 'rgba(74,222,128,0.15)' : active ? 'var(--accent-glow)' : 'var(--bg3)',
                  border: `1px solid ${done ? 'rgba(74,222,128,0.4)' : active ? 'rgba(124,109,250,0.4)' : 'var(--border2)'}`,
                  color: done ? 'var(--green)' : 'transparent',
                }}>
                  {done && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                  {active && (
                    <span style={{
                      width:7, height:7, borderRadius:'50%', background:'var(--accent)',
                      display:'block', animation:'dotpulse 1s ease-in-out infinite',
                    }}/>
                  )}
                </div>
                <span style={{
                  fontSize:12,
                  color: done ? 'var(--text)' : active ? 'var(--accent2)' : 'var(--text3)',
                  fontWeight: active ? 500 : 400,
                }}>
                  {statusLabel[step]?.replace('...','') || step}
                </span>
              </div>
            )
          })}
        </div>

        {/* progress bar */}
        <div style={{ height:3, background:'var(--bg3)', borderRadius:2, overflow:'hidden' }}>
          <div style={{
            height:'100%', background:'var(--accent)', borderRadius:2,
            width:`${(currentStep / (STEPS.length - 1)) * 100}%`,
            transition:'width 0.6s ease',
          }}/>
        </div>

        <style>{`
          @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
          @keyframes dotpulse { 0%,100%{transform:scale(0.7);opacity:0.5} 50%{transform:scale(1);opacity:1} }
        `}</style>
      </div>
    </div>
  )
}
