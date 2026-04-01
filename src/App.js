import React, { useState, useEffect, useCallback } from 'react'
import Home from './components/Home'
import CreateProject from './components/CreateProject'
import StudyMode from './components/StudyMode'
import EditCards from './components/EditCards'
import Tutorial from './components/Tutorial'
import Auth from './components/Auth'
import {
  SparklesIcon,
  QuestionMarkCircleIcon,
  ArrowPathIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline'
import {
  fetchProjects,
  createProject as sbCreate,
  updateProject as sbUpdate,
  deleteProject as sbDelete,
  getCurrentUser,
  signOut,
} from './utils/supabaseService'

function App() {
  const [user, setUser]             = useState(getCurrentUser())
  const [currentView, setCurrentView] = useState('home')
  const [projects, setProjects]     = useState([])
  const [currentProject, setCurrentProject] = useState(null)
  const [showTutorial, setShowTutorial] = useState(() => !localStorage.getItem('kennyquiz_tutorial_seen'))
  const [dbStatus, setDbStatus]     = useState('idle') // 'idle' | 'loading' | 'synced'

  // ── Load projects khi đăng nhập ──────────────────────────────────────────
  const refreshData = useCallback(async () => {
    const currentUser = getCurrentUser()
    if (!currentUser) return
    setDbStatus('loading')
    try {
      const data = await fetchProjects()
      setProjects(data)
      setDbStatus('synced')
    } catch (err) {
      console.error(err)
      setDbStatus('idle')
    }
  }, [])

  useEffect(() => {
    if (user) refreshData()
  }, [user, refreshData])

  // ── Auth Handlers ────────────────────────────────────────────────────────
  const handleAuthSuccess = (loggedInUser) => {
    setUser(loggedInUser)
  }

  const handleLogout = () => {
    if (window.confirm('Đăng xuất khỏi hệ thống?')) {
      signOut()
      setUser(null)
      setProjects([])
      setCurrentView('home')
    }
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────
  const addProject = async (project) => {
    const saved = await sbCreate(project)
    setProjects(prev => [saved, ...prev])
    setCurrentView('home')
  }

  const updateProject = async (updated) => {
    const saved = await sbUpdate(updated)
    setProjects(prev => prev.map(p => p.id === saved.id ? saved : p))
  }

  const deleteProject = async (id) => {
    await sbDelete(id)
    setProjects(prev => prev.filter(p => p.id !== id))
  }

  const navigateTo = (view, project = null) => {
    setCurrentProject(project)
    setCurrentView(view)
  }

  // ── Nếu chưa đăng nhập ───────────────────────────────────────────────────
  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />
  }

  // ── App chính ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {showTutorial && <Tutorial onClose={() => { setShowTutorial(false); localStorage.setItem('kennyquiz_tutorial_seen', 'true') }} />}

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <header className="flex justify-between items-center mb-10">
          <button onClick={() => navigateTo('home')} className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-black text-gradient leading-none">KennyQuiz</h1>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">
                👤 {user.username}
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={refreshData}
              title="Làm mới dữ liệu"
              className={`p-2.5 rounded-xl transition-all ${dbStatus === 'loading' ? 'text-blue-400' : 'text-slate-300 hover:text-blue-500 hover:bg-blue-50'}`}
            >
              <ArrowPathIcon className={`w-5 h-5 ${dbStatus === 'loading' ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowTutorial(true)}
              className="p-2.5 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
            >
              <QuestionMarkCircleIcon className="w-5 h-5" />
            </button>
            <button
              onClick={handleLogout}
              title="Đăng xuất"
              className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
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
          <StudyMode project={currentProject} onBack={() => navigateTo('home')} />
        )}

        {currentView === 'edit' && currentProject && (
          <EditCards project={currentProject} onBack={() => navigateTo('home')} onSave={updateProject} />
        )}
      </div>

      <footer className="text-center py-8 text-[10px] font-black uppercase text-slate-200 tracking-[0.2em]">
        KennyQuiz • Smart AI Learning 🤖
      </footer>
    </div>
  )
}

export default App
