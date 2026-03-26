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
      setDbMessage('Chưa có API key Supabase — dùng localStorage')
      return
    }

    const init = async () => {
      setDbStatus('loading')
      const ok = await checkSupabaseConnection()
      if (!ok) {
        setDbStatus('offline')
        setDbMessage('Không kết nối được Supabase — dùng localStorage')
        return
      }

      try {
        const data = await fetchProjects()
        setProjects(data)
        setLocalProjects(data) // sync cache
        setDbStatus('synced')
        setDbMessage(`Đã đồng bộ ${data.length} dự án`)
      } catch (err) {
        setDbStatus('error')
        setDbMessage('Lỗi tải dữ liệu: ' + err.message)
        // fallback to localStorage
        setProjects(localProjects)
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
    if (SUPABASE_ENABLED && dbStatus !== 'offline') {
      setDbStatus('loading')
      try {
        const saved = await sbCreate(project)
        setProjects(prev => [saved, ...prev])
        setLocalProjects(prev => [saved, ...prev])
        setCurrentProject(saved)
        setCurrentView('home')
        setDbStatus('synced')
        setDbMessage('Đã lưu lên cloud ☁️')
        return
      } catch (err) {
        setDbStatus('error')
        setDbMessage('Lỗi lưu Supabase, dùng localStorage: ' + err.message)
      }
    }

    // Fallback: localStorage
    const newProject = {
      ...project,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setProjects(prev => [newProject, ...prev])
    setLocalProjects(prev => [newProject, ...prev])
    setCurrentProject(newProject)
    setCurrentView('home')
  }, [dbStatus, setLocalProjects])

  const updateProject = useCallback(async (updatedProject) => {
    if (SUPABASE_ENABLED && dbStatus !== 'offline') {
      setDbStatus('loading')
      try {
        const saved = await sbUpdate(updatedProject)
        setProjects(prev => prev.map(p => p.id === saved.id ? saved : p))
        setLocalProjects(prev => prev.map(p => p.id === saved.id ? saved : p))
        setCurrentProject(saved)
        setDbStatus('synced')
        setDbMessage('Đã cập nhật ☁️')
        return
      } catch (err) {
        setDbStatus('error')
        setDbMessage('Lỗi cập nhật: ' + err.message)
      }
    }

    // Fallback
    const updated = { ...updatedProject, updated_at: new Date().toISOString() }
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p))
    setLocalProjects(prev => prev.map(p => p.id === updated.id ? updated : p))
    setCurrentProject(updated)
  }, [dbStatus, setLocalProjects])

  const deleteProject = useCallback(async (projectId) => {
    if (SUPABASE_ENABLED && dbStatus !== 'offline') {
      setDbStatus('loading')
      try {
        await sbDelete(projectId)
        setDbStatus('synced')
        setDbMessage('Đã xoá ☁️')
      } catch (err) {
        setDbStatus('error')
        setDbMessage('Lỗi xoá: ' + err.message)
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
      loading: { icon: <CloudArrowUpIcon className="w-4 h-4 animate-pulse" />, color: 'text-blue-500 bg-blue-50', text: 'Đang đồng bộ...' },
      synced:  { icon: <CheckCircleIcon  className="w-4 h-4" />,              color: 'text-green-600 bg-green-50', text: 'Cloud ☁️' },
      offline: { icon: <ExclamationTriangleIcon className="w-4 h-4" />,       color: 'text-amber-500 bg-amber-50', text: 'Offline' },
      error:   { icon: <ExclamationTriangleIcon className="w-4 h-4" />,       color: 'text-red-500 bg-red-50',    text: 'Lỗi DB' },
      idle:    null,
    }
    const cfg = map[dbStatus]
    if (!cfg) return null
    return (
      <div
        className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color} cursor-default`}
        title={dbMessage}
      >
        {cfg.icon}
        <span>{cfg.text}</span>
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-mesh bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {showTutorial && <Tutorial onClose={handleCloseTutorial} />}

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <button
            onClick={() => navigateTo('home')}
            className="flex items-center gap-3 group"
          >
            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 group-hover:-translate-y-0.5 transition-all">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-black text-gradient leading-none">KennyQuiz</h1>
              <p className="text-xs text-gray-400 font-medium">AI-powered learning</p>
            </div>
          </button>

          <div className="flex items-center gap-3">
            {/* Breadcrumb */}
            {currentView !== 'home' && (
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                <button onClick={() => navigateTo('home')} className="hover:text-blue-600 transition-colors">
                  Trang chính
                </button>
                <span>/</span>
                <span className="text-gray-700 font-medium">
                  {currentView === 'create' && 'Tạo dự án'}
                  {currentView === 'study'  && 'Học tập'}
                  {currentView === 'edit'   && 'Chỉnh sửa'}
                </span>
              </div>
            )}

            {/* Sync status */}
            <SyncBadge />

            {/* Help */}
            <button
              id="btn-show-tutorial"
              onClick={() => setShowTutorial(true)}
              className="p-2.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
              title="Hướng dẫn"
            >
              <QuestionMarkCircleIcon className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Views */}
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

      <footer className="text-center py-8 text-xs text-gray-400">
        <p>KennyQuiz • Học thông minh hơn với AI 🤖</p>
      </footer>
    </div>
  )
}

export default App
