import React, { useState } from 'react'
import { supabase } from '../utils/supabaseClient'
import { SparklesIcon, LockClosedIcon, UserIcon, ArrowRightIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'

const Auth = ({ onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [username, setUsername]   = useState('')
  const [password, setPassword]   = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError]         = useState('')

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Biến username thành email ảo để dùng Supabase Auth
    const email = `${username.trim().toLowerCase()}@kennyquiz.local`

    if (isSignUp) {
      if (password !== confirmPassword) {
        setError('Mật khẩu nhập lại không khớp!')
        setLoading(false)
        return
      }
      const { error: signUpErr } = await supabase.auth.signUp({ email, password })
      if (signUpErr) setError(signUpErr.message)
      else onAuthSuccess()
    } else {
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password })
      if (signInErr) setError('Tên đăng nhập hoặc mật khẩu không chính xác!')
      else onAuthSuccess()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-center text-white">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <SparklesIcon className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black mb-1 tracking-tight">KennyQuiz</h2>
          <p className="text-blue-100/80 font-medium">Lưu giữ kiến thức vĩnh cửu</p>
        </div>

        <form onSubmit={handleAuth} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-black uppercase text-slate-400 mb-2 block tracking-widest pl-1">Tên đăng nhập</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <UserIcon className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 focus:bg-white transition-all outline-none font-bold text-slate-800"
                  placeholder="kenny_smart"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-black uppercase text-slate-400 mb-2 block tracking-widest pl-1">Mật khẩu</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <LockClosedIcon className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 focus:bg-white transition-all outline-none font-bold text-slate-800"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {isSignUp && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="text-xs font-black uppercase text-slate-400 mb-2 block tracking-widest pl-1">Xác nhận mật khẩu</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <ShieldCheckIcon className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 focus:bg-white transition-all outline-none font-bold text-slate-800"
                    placeholder="Nhập lại mật khẩu"
                  />
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-black text-center flex items-center gap-2 justify-center">
              <span className="text-lg">🚨</span> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-slate-800 active:scale-[0.98] transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2"
          >
            {loading ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : null}
            {isSignUp ? 'TẠO TÀI KHOẢN' : 'ĐĂNG NHẬP'}
            <ArrowRightIcon className="w-5 h-5" />
          </button>

          <div className="pt-4 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest"
            >
              {isSignUp ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký ngay'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const ArrowPathIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
)

export default Auth
