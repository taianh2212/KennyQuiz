import React, { useState, useEffect, useCallback } from 'react'
import Home from './components/Home'
import CreateProject from './components/CreateProject'
import StudyMode from './components/StudyMode'
import EditCards from './components/EditCards'
import Tutorial from './components/Tutorial'
import { useLocalStorage } from './hooks/useLocalStorage'
import {
  SparklesIcon,
  QuestionMarkCircleIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import {
  fetchProjects,
  createProject as sbCreate,
  updateProject as sbUpdate,
  deleteProject as sbDelete,
  checkSupabaseConnection,
} from './utils/supabaseService'

// ─── Supabase bật khi có ANON_KEY ───────────────────────────────────────────
const SUPABASE_ENABLED = !!(
  process.env.REACT_APP_SUPABASE_ANON_KEY &&
  process.env.REACT_APP_SUPABASE_ANON_KEY !== 'YOUR_ANON_KEY_HERE'
)

function App() {
  const [currentView, setCurrentView]   = useState('home')
  const [localProjects, setLocalProjects] = useLocalStorage('kennyquiz_projects', [])
  const [projects, setProjects]         = useState(localProjects)
  const [currentProject, setCurrentProject] = useState(null)
  const [showTutorial, setShowTutorial] = useState(() => !localStorage.getItem('kennyquiz_tutorial_seen'))

  // Supabase sync state
  const [dbStatus, setDbStatus]   = useState('idle') // 'idle' | 'loading' | 'synced' | 'offline' | 'error'
  const [dbMessage, setDbMessage] = useState('')

  // ── Lifecycle: kết nối + load từ Supabase ────────────────────────────────
  useEffect(() => {
    if (!SUPABASE_ENABLED) {
      setDbStatus('offline')
      setDbMessage('Chưa có API key Supabase trong .env')
      return
    }

    const init = async () => {
      setDbStatus('loading')
      try {
        const ok = await checkSupabaseConnection()
        if (!ok) {
          setDbStatus('error')
          setDbMessage('Lỗi kết nối database (kiểm tra SQL Schema)')
          return
        }

        const data = await fetchProjects()
        
        // Logic: Ưu tiên dữ liệu từ Cloud, nếu Cloud trống thì vẫn giữ dữ liệu máy
        if (data.length > 0) {
          setProjects(data)
          setLocalProjects(data)
          setDbStatus('synced')
          setDbMessage(`Đã tải ${data.length} dự án từ Cloud`)
        } else {
          setDbStatus('synced')
          setDbMessage('Cloud trống - Sẵn sàng lưu dự án mới')
        }
      } catch (err) {
        console.error('Supabase Init Error:', err)
        setDbStatus('error')
        setDbMessage('Lỗi: ' + err.message)
      }
    }

    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCloseTutorial = () => {
    setShowTutorial(false)
    localStorage.setItem('kennyquiz_tutorial_seen', 'true')
  }

  // ── CRUD helpers ─────────────────────────────────────────────────────────
  const addProject = useCallback(async (project) => {
    setDbStatus('loading')
    let savedProject = null

    if (SUPABASE_ENABLED && dbStatus !== 'offline' && dbStatus !== 'error') {
      try {
        savedProject = await sbCreate(project)
        console.log('Saved to Supabase:', savedProject)
      } catch (err) {
        console.error('Save to Supabase failed:', err)
        setDbStatus('error')
        setDbMessage('Lỗi lưu Cloud: ' + err.message)
      }
    }

    // Luôn lưu local để đề phòng
    const finalProject = savedProject || {
      ...project,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    setProjects(prev => [finalProject, ...prev])
    setLocalProjects(prev => [finalProject, ...prev])
    setCurrentProject(finalProject)
    setCurrentView('home')

    if (savedProject) {
      setDbStatus('synced')
      setDbMessage('Đã lưu lên Cloud thành công!')
    }
  }, [dbStatus, setLocalProjects])

  const updateProject = useCallback(async (updatedProject) => {
    setDbStatus('loading')
    let saved = null

    if (SUPABASE_ENABLED && dbStatus !== 'offline' && dbStatus !== 'error') {
      try {
        saved = await sbUpdate(updatedProject)
      } catch (err) {
        console.error('Update failed:', err)
        setDbStatus('error')
      }
    }

    const final = saved || { ...updatedProject, updated_at: new Date().toISOString() }
    setProjects(prev => prev.map(p => p.id === final.id ? final : p))
    setLocalProjects(prev => prev.map(p => p.id === final.id ? final : p))
    setCurrentProject(final)
    
    if (saved) {
      setDbStatus('synced')
      setDbMessage('Đã cập nhật Cloud')
    }
  }, [dbStatus, setLocalProjects])

  const deleteProject = useCallback(async (projectId) => {
    if (SUPABASE_ENABLED && dbStatus !== 'offline' && dbStatus !== 'error') {
      setDbStatus('loading')
      try {
        await sbDelete(projectId)
        setDbStatus('synced')
      } catch (err) {
        setDbStatus('error')
      }
    }

    setProjects(prev => prev.filter(p => p.id !== projectId))
    setLocalProjects(prev => prev.filter(p => p.id !== projectId))
    if (currentProject?.id === projectId) {
      setCurrentProject(null)
      setCurrentView('home')
    }
  }, [dbStatus, currentProject, setLocalProjects])

  const navigateTo = (view, project = null) => {
    setCurrentProject(project)
    setCurrentView(view)
  }

  // ── Sync status badge ─────────────────────────────────────────────────────
  const SyncBadge = () => {
    const map = {
      loading: { icon: <CloudArrowUpIcon className="w-4 h-4 animate-pulse" />, color: 'text-blue-500 bg-blue-50', text: 'Đang lưu...' },
      synced:  { icon: <CheckCircleIcon  className="w-4 h-4" />,              color: 'text-green-600 bg-green-50', text: 'Cloud ☁️' },
      offline: { icon: <ExclamationTriangleIcon className="w-4 h-4" />,       color: 'text-amber-500 bg-amber-50', text: 'Offline' },
      error:   { icon: <ExclamationTriangleIcon className="w-4 h-4" />,       color: 'text-red-500 bg-red-50',    text: 'Lỗi DB' },
      idle:    null,
    }
    const cfg = map[dbStatus]
    if (!cfg) return null
    return (
      <div
        className={`flex items-center gap-1.5 text-xs font-black uppercase px-3 py-1.5 rounded-xl ${cfg.color} cursor-pointer hover:scale-105 transition-all shadow-sm border border-current opacity-90`}
        title={dbMessage}
        onClick={() => alert(dbMessage)}
      >
        {cfg.icon}
        <span className="hidden sm:inline">{cfg.text}</span>
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-mesh bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {showTutorial && <Tutorial onClose={handleCloseTutorial} />}

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <header className="flex justify-between items-center mb-10">
          <button onClick={() => navigateTo('home')} className="flex items-center gap-3 group">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 group-hover:-translate-y-0.5 transition-all">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-black text-gradient leading-none">KennyQuiz</h1>
              <p className="text-xs text-gray-400 font-medium whitespace-nowrap">AI-powered learning</p>
            </div>
          </button>

          <div className="flex items-center gap-2 sm:gap-4">
            {currentView !== 'home' && (
              <div className="hidden md:flex items-center gap-2 text-xs font-black text-slate-300 uppercase letter tracking-widest">
                <button onClick={() => navigateTo('home')} className="hover:text-blue-500 transition-colors">TRANG CHỦ</button>
                <span>/</span>
                <span className="text-slate-800">
                  {currentView === 'create' ? 'TẠO DỰ ÁN' : currentView === 'study' ? 'HỌC TẬP' : 'SỬA THẺ'}
                </span>
              </div>
            )}
            <SyncBadge />
            <button
              onClick={() => setShowTutorial(true)}
              className="p-2.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
            >
              <QuestionMarkCircleIcon className="w-6 h-6" />
            </button>
          </div>
        </header>

        {currentView === 'home' && (
          <Home
            projects={projects}
            onSelectProject={(p) => navigateTo('study', p)}
            onEditProject={(p) => navigateTo('edit', p)}
            onDeleteProject={deleteProject}
            onCreateNew={() => navigateTo('create')}
          />
        )}

        {currentView === 'create' && (
          <CreateProject
            onBack={() => navigateTo('home')}
            onSave={addProject}
          />
        )}

        {currentView === 'study' && currentProject && (
          <StudyMode
            project={currentProject}
            onBack={() => navigateTo('home')}
            onUpdateProject={updateProject}
          />
        )}

        {currentView === 'edit' && currentProject && (
          <EditCards
            project={currentProject}
            onBack={() => navigateTo('home')}
            onSave={updateProject}
          />
        )}
      </div>

      <footer className="text-center py-8 text-[10px] font-black uppercase text-slate-300 tracking-[0.2em] pointer-events-none">
        KennyQuiz • SMART AI LEARNING 🤖
      </footer>
    </div>
  )
}

export default App
