import { useState, useRef, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import ChatPanel from './components/ChatPanel'
import LoaderModal from './components/LoaderModal'
import TopBar from './components/TopBar'

const API = 'http://localhost:8000'

const STATUS_LABEL = {
  queued:    'Queued...',
  cloning:   'Cloning repository...',
  chunking:  'Parsing & chunking files...',
  embedding: 'Generating embeddings...',
  ready:     'Ready',
  error:     'Error',
}

export default function App() {
  const [sessions, setSessions]           = useState([])
  const [activeSession, setActiveSession] = useState(null)
  const [sessionData, setSessionData]     = useState(null)
  const [messages, setMessages]           = useState([])
  const [loading, setLoading]             = useState(false)
  const [showLoader, setShowLoader]       = useState(false)
  const [loaderStatus, setLoaderStatus]   = useState('queued')
  const [dark, setDark]                   = useState(true)
  const pollRef = useRef(null)

  useEffect(() => {
    document.documentElement.classList.toggle('light', !dark)
  }, [dark])

  async function loadRepo(repoUrl) {
    setShowLoader(true)
    setLoaderStatus('queued')

    const res = await fetch(`${API}/api/load`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repo_url: repoUrl }),
    })
    const { session_id } = await res.json()

    pollRef.current = setInterval(async () => {
      const s    = await fetch(`${API}/api/status/${session_id}`)
      const data = await s.json()
      setLoaderStatus(data.status)

      if (data.status === 'ready') {
        clearInterval(pollRef.current)
        setShowLoader(false)
        const newSession = { session_id, repo_url: repoUrl, ...data }
        setSessions(prev => [newSession, ...prev])
        setActiveSession(session_id)
        setSessionData(newSession)
        setMessages([{
          role: 'assistant',
          text: `Repository loaded. Found **${data.file_count} files** and **${data.chunk_count} chunks**. Ask me anything about the code.`,
        }])
      } else if (data.status === 'error') {
        clearInterval(pollRef.current)
        setShowLoader(false)
        alert('Error loading repo: ' + data.error)
      }
    }, 1500)
  }

  async function switchSession(sid) {
    setActiveSession(sid)
    const res  = await fetch(`${API}/api/status/${sid}`)
    const data = await res.json()
    setSessionData(data)
    setMessages([{
      role: 'assistant',
      text: `Switched repo. **${data.file_count} files**, **${data.chunk_count} chunks** indexed.`,
    }])
  }

  async function sendQuestion(question) {
    if (!activeSession || loading) return
    setMessages(prev => [...prev, { role: 'user', text: question }])
    setLoading(true)
    try {
      const res  = await fetch(`${API}/api/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: activeSession, question }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', text: data.answer }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Error contacting the server.', error: true }])
    }
    setLoading(false)
  }

  async function deleteSession(sid) {
    await fetch(`${API}/api/session/${sid}`, { method: 'DELETE' })
    setSessions(prev => prev.filter(s => s.session_id !== sid))
    if (activeSession === sid) {
      setActiveSession(null)
      setSessionData(null)
      setMessages([])
    }
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden' }}>
      <TopBar onLoad={loadRepo} dark={dark} onToggleDark={() => setDark(d => !d)} />
      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
        <Sidebar
          sessions={sessions}
          activeSession={activeSession}
          onSwitch={switchSession}
          onDelete={deleteSession}
          sessionData={sessionData}
        />
        <ChatPanel
          messages={messages}
          loading={loading}
          onSend={sendQuestion}
          hasSession={!!activeSession}
        />
      </div>
      {showLoader && <LoaderModal status={loaderStatus} statusLabel={STATUS_LABEL} />}
    </div>
  )
}
