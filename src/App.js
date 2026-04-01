import React, { useState, useEffect, useCallback } from 'react'
import Home from './components/Home'
import CreateProject from './components/CreateProject'
import StudyMode from './components/StudyMode'
import EditCards from './components/EditCards'
import Tutorial from './components/Tutorial'
import Auth from './components/Auth'
import { supabase } from './utils/supabaseClient'
import {
  SparklesIcon,
  QuestionMarkCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline'
import {
  fetchProjects,
  createProject as sbCreate,
  updateProject as sbUpdate,
  deleteProject as sbDelete,
  checkSupabaseConnection,
} from './utils/supabaseService'

function App() {
  const [session, setSession] = useState(null)
  const [currentView, setCurrentView] = useState('home')
  const [projects, setProjects] = useState([])
  const [currentProject, setCurrentProject] = useState(null)
  const [showTutorial, setShowTutorial] = useState(() => !localStorage.getItem('kennyquiz_tutorial_seen'))
  const [dbStatus, setDbStatus] = useState('idle')

  // ── Auth Watcher ─────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) refreshData()
      else setProjects([])
    })
    return () => subscription.unsubscribe()
  }, [])

  const refreshData = useCallback(async () => {
    if (!session) return
    setDbStatus('loading')
    try {
      const data = await fetchProjects()
      setProjects(data)
      setDbStatus('synced')
    } catch (err) {
      setDbStatus('error')
    }
  }, [session])

  useEffect(() => {
    if (session) refreshData()
  }, [session, refreshData])

  const handleLogout = async () => {
    if (window.confirm("Đăng xuất khỏi hệ thống?")) {
      await supabase.auth.signOut()
      setCurrentView('home')
    }
  }

  const navigateTo = (view, project = null) => {
    setCurrentProject(project)
    setCurrentView(view)
  }

  if (!session) {
    return <Auth onAuthSuccess={() => {}} />
  }

  return (
    <div className="min-h-screen bg-mesh bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {showTutorial && <Tutorial onClose={() => setShowTutorial(false)} />}
      
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <header className="flex justify-between items-center mb-10">
          <button onClick={() => navigateTo('home')} className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-black text-gradient leading-none">KennyQuiz</h1>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">
                {session.user.email.split('@')[0]}
              </p>
            </div>
          </button>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => refreshData()}
              className={`p-2.5 rounded-xl transition-all ${dbStatus === 'loading' ? 'text-blue-500 animate-spin' : 'text-slate-400 hover:text-blue-500'}`}
            >
              <ArrowPathIcon className="w-6 h-6" />
            </button>
            <button onClick={handleLogout} className="p-2.5 text-slate-400 hover:text-red-500 rounded-xl transition-all">
              <ArrowRightOnRectangleIcon className="w-6 h-6" />
            </button>
          </div>
        </header>

        {currentView === 'home' && (
          <Home
            projects={projects}
            onSelectProject={(p) => navigateTo('study', p)}
            onEditProject={(p) => navigateTo('edit', p)}
            onDeleteProject={sbDelete}
            onCreateNew={() => navigateTo('create')}
          />
        )}

        {currentView === 'create' && <CreateProject onBack={() => navigateTo('home')} onSave={sbCreate} />}
        {currentView === 'study' && currentProject && <StudyMode project={currentProject} onBack={() => navigateTo('home')} />}
        {currentView === 'edit' && currentProject && <EditCards project={currentProject} onBack={() => navigateTo('home')} onSave={sbUpdate} />}
      </div>
    </div>
  )
}

export default App
