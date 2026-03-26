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
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import {
  fetchProjects,
  createProject as sbCreate,
  updateProject as sbUpdate,
  deleteProject as sbDelete,
  checkSupabaseConnection,
} from './utils/supabaseService'

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

  const [dbStatus, setDbStatus]   = useState('idle')
  const [dbMessage, setDbMessage] = useState('')

  // ── Manual Refresh Function ──────────────────────────────────────────────
  const refreshData = useCallback(async (silent = false) => {
    if (!SUPABASE_ENABLED) return
    if (!silent) setDbStatus('loading')
    
    try {
      const data = await fetchProjects()
      setProjects(data)
      setLocalProjects(data)
      setDbStatus('synced')
      setDbMessage(`Đã cập nhật ${data.length} dự án từ Cloud lúc ${new Date().toLocaleTimeString()}`)
    } catch (err) {
      setDbStatus('error')
      setDbMessage('Lỗi tải dữ liệu: ' + err.message)
    }
  }, [setLocalProjects])

  useEffect(() => {
    const init = async () => {
      if (!SUPABASE_ENABLED) {
        setDbStatus('offline')
        return
      }
      setDbStatus('loading')
      const ok = await checkSupabaseConnection()
      if (ok) {
        await refreshData(true)
      } else {
        setDbStatus('error')
        setDbMessage('Không thể kết nối Supabase')
      }
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCloseTutorial = () => {
    setShowTutorial(false)
    localStorage.setItem('kennyquiz_tutorial_seen', 'true')
  }

  const addProject = useCallback(async (project) => {
    setDbStatus('loading')
    let savedProject = null
    if (SUPABASE_ENABLED && dbStatus !== 'offline' && dbStatus !== 'error') {
      try {
        savedProject = await sbCreate(project)
      } catch (err) {
        setDbStatus('error')
      }
    }
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
    if (savedProject) setDbStatus('synced')
  }, [dbStatus, setLocalProjects])

  const updateProject = useCallback(async (updatedProject) => {
    setDbStatus('loading')
    let saved = null
    if (SUPABASE_ENABLED && dbStatus !== 'offline' && dbStatus !== 'error') {
      try {
        saved = await sbUpdate(updatedProject)
      } catch (err) {
        setDbStatus('error')
      }
    }
    const final = saved || { ...updatedProject, updated_at: new Date().toISOString() }
    setProjects(prev => prev.map(p => p.id === final.id ? final : p))
    setLocalProjects(prev => prev.map(p => p.id === final.id ? final : p))
    if (saved) setDbStatus('synced')
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
  }, [dbStatus, setLocalProjects])

  const navigateTo = (view, project = null) => {
    setCurrentProject(project)
    setCurrentView(view)
  }

  const SyncBadge = () => {
    const map = {
      loading: { icon: <ArrowPathIcon className="w-4 h-4 animate-spin" />, color: 'text-blue-500 bg-blue-50', text: 'Đang tải...' },
      synced:  { icon: <CheckCircleIcon  className="w-4 h-4" />,              color: 'text-green-600 bg-green-50', text: 'Cloud ☁️' },
      offline: { icon: <ExclamationTriangleIcon className="w-4 h-4" />,       color: 'text-amber-500 bg-amber-50', text: 'Offline' },
      error:   { icon: <ExclamationTriangleIcon className="w-4 h-4" />,       color: 'text-red-500 bg-red-50',    text: 'Lỗi' },
      idle:    null,
    }
    const cfg = map[dbStatus]
    if (!cfg) return null
    return (
      <button
        onClick={() => refreshData()}
        className={`flex items-center gap-1.5 text-xs font-black uppercase px-3 py-1.5 rounded-xl ${cfg.color} hover:scale-105 active:scale-95 transition-all shadow-sm border border-current outline-none`}
        title={dbMessage || 'Nhấn để làm mới dữ liệu'}
      >
        {cfg.icon}
        <span className="hidden sm:inline">{cfg.text}</span>
      </button>
    )
  }

  return (
    <div className="min-h-screen bg-mesh bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {showTutorial && <Tutorial onClose={handleCloseTutorial} />}
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <header className="flex justify-between items-center mb-10">
          <button onClick={() => navigateTo('home')} className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-black text-gradient leading-none">KennyQuiz</h1>
              <p className="text-xs text-gray-400 font-medium">AI-powered learning</p>
            </div>
          </button>
          <div className="flex items-center gap-2 sm:gap-4">
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
          <CreateProject onBack={() => navigateTo('home')} onSave={addProject} />
        )}

        {currentView === 'study' && currentProject && (
          <StudyMode project={currentProject} onBack={() => navigateTo('home')} onUpdateProject={updateProject} />
        )}

        {currentView === 'edit' && currentProject && (
          <EditCards project={currentProject} onBack={() => navigateTo('home')} onSave={updateProject} />
        )}
      </div>
      <footer className="text-center py-8 text-[10px] font-black uppercase text-slate-300 tracking-[0.2em]">
        KennyQuiz • SMART AI LEARNING 🤖
      </footer>
    </div>
  )
}

export default App
