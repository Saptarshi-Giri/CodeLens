const API = 'http://localhost:8000'

const S = {
  sidebar: {
    width:240, flexShrink:0, background:'var(--bg2)',
    borderRight:'1px solid var(--border)', display:'flex',
    flexDirection:'column', overflow:'hidden',
  },
  section: { padding:'14px 12px', borderBottom:'1px solid var(--border)' },
  filesSection: {
    padding:'14px 12px', flex:1, overflow:'hidden',
    display:'flex', flexDirection:'column',
  },
  label: {
    fontSize:9, fontWeight:600, letterSpacing:'1.2px',
    textTransform:'uppercase', color:'var(--text3)', marginBottom:10,
  },
  hint: { fontSize:12, color:'var(--text3)', lineHeight:1.6 },
  repoItem: (active) => ({
    display:'flex', alignItems:'center', justifyContent:'space-between',
    padding:'7px 8px', borderRadius:7, cursor:'pointer', marginBottom:2,
    background: active ? 'var(--accent-glow)' : 'transparent',
    border: active ? '1px solid rgba(124,109,250,0.2)' : '1px solid transparent',
    transition:'background 0.12s',
  }),
  repoInner: { display:'flex', alignItems:'center', gap:7, minWidth:0 },
  repoName: (active) => ({
    fontSize:11, fontFamily:'var(--mono)', whiteSpace:'nowrap',
    overflow:'hidden', textOverflow:'ellipsis',
    color: active ? 'var(--accent2)' : 'var(--text)',
  }),
  iconBtn: {
    background:'none', border:'none', color:'var(--text3)',
    cursor:'pointer', padding:3, borderRadius:4,
    display:'flex', alignItems:'center', flexShrink:0,
    transition:'color 0.1s',
  },
  btnRow: { display:'flex', alignItems:'center', gap:2 },
  statGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 },
  statBox: {
    background:'var(--bg3)', border:'1px solid var(--border)',
    borderRadius:8, padding:'10px 10px 8px',
  },
  statVal: { fontSize:20, fontWeight:700, color:'var(--accent2)', lineHeight:1, marginBottom:3 },
  statLbl: { fontSize:10, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.8px' },
  downloadBtn: (downloading) => ({
    width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:7,
    padding:'8px 0', borderRadius:8, border:'1px solid var(--border2)',
    background: downloading ? 'var(--accent-glow)' : 'var(--bg3)',
    color: downloading ? 'var(--accent2)' : 'var(--text2)',
    fontSize:12, fontFamily:'var(--font)', fontWeight:500,
    cursor: downloading ? 'not-allowed' : 'pointer',
    transition:'background 0.15s, color 0.15s',
  }),
  fileList: { overflowY:'auto', flex:1 },
  fileRow: {
    display:'flex', alignItems:'center', gap:6,
    padding:'4px 0', borderBottom:'1px solid var(--border)',
  },
  fileName: {
    fontSize:10, fontFamily:'var(--mono)', color:'var(--text2)',
    whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
  },
}

function repoName(url) {
  try { return url.split('/').slice(-2).join('/') } catch { return url }
}

import { useState } from 'react'

export default function Sidebar({ sessions, activeSession, onSwitch, onDelete, sessionData }) {
  const [downloading, setDownloading] = useState(false)

  async function handleDownload(sessionId, repoUrl) {
    setDownloading(true)
    try {
      const res = await fetch(`${API}/api/download/${sessionId}`)
      if (!res.ok) throw new Error('Download failed')
      const blob = await res.blob()
      const name = repoUrl.rstrip?.('/').split('/').pop() || 'repository'
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `${repoUrl.split('/').pop()}.zip`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert('Download failed: ' + e.message)
    }
    setDownloading(false)
  }

  return (
    <aside style={S.sidebar}>
      <div style={S.section}>
        <div style={S.label}>Repositories</div>
        {sessions.length === 0 && (
          <div style={S.hint}>No repos loaded yet.<br/>Paste a GitHub URL above.</div>
        )}
        {sessions.map(s => (
          <div
            key={s.session_id}
            style={S.repoItem(activeSession === s.session_id)}
            onClick={() => onSwitch(s.session_id)}
          >
            <div style={S.repoInner}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77"/>
              </svg>
              <span style={S.repoName(activeSession === s.session_id)}>{repoName(s.repo_url)}</span>
            </div>
            <div style={S.btnRow}>
              {/* download icon */}
              <button
                style={S.iconBtn}
                title="Download as ZIP"
                onClick={e => { e.stopPropagation(); handleDownload(s.session_id, s.repo_url) }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </button>
              {/* delete icon */}
              <button
                style={S.iconBtn}
                title="Remove"
                onClick={e => { e.stopPropagation(); onDelete(s.session_id) }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {sessionData?.status === 'ready' && (
        <>
          <div style={S.section}>
            <div style={S.label}>Stats</div>
            <div style={S.statGrid}>
              <div style={S.statBox}>
                <div style={S.statVal}>{sessionData.file_count}</div>
                <div style={S.statLbl}>files</div>
              </div>
              <div style={S.statBox}>
                <div style={S.statVal}>{sessionData.chunk_count}</div>
                <div style={S.statLbl}>chunks</div>
              </div>
            </div>

            {/* big download button */}
            <button
              style={S.downloadBtn(downloading)}
              disabled={downloading}
              onClick={() => handleDownload(sessionData.session_id, sessionData.repo_url)}
            >
              {downloading ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  Zipping...
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Download ZIP
                </>
              )}
            </button>
          </div>

          <div style={S.filesSection}>
            <div style={S.label}>Indexed files</div>
            <div style={S.fileList}>
              {(sessionData.files || []).map((f, i) => (
                <div key={i} style={S.fileRow}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" style={{flexShrink:0}}>
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                    <polyline points="13 2 13 9 20 9"/>
                  </svg>
                  <span style={S.fileName}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </aside>
  )
}
