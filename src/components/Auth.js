import React, { useState } from 'react'
import { SparklesIcon, LockClosedIcon, UserIcon, ArrowRightIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import { signIn, signUp } from '../utils/supabaseService'

const Auth = ({ onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError]       = useState('')

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          setError('Mật khẩu nhập lại không khớp!')
          setLoading(false)
          return
        }
        if (password.length < 6) {
          setError('Mật khẩu phải có ít nhất 6 ký tự!')
          setLoading(false)
          return
        }
        const user = await signUp(username, password)
        onAuthSuccess(user)
      } else {
        const user = await signIn(username, password)
        onAuthSuccess(user)
      }
    } catch (err) {
      setError(err.message)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-center text-white">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <SparklesIcon className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black mb-1 tracking-tight">KennyQuiz</h2>
          <p className="text-blue-100/80 font-medium text-sm">
            {isSignUp ? 'Tạo tài khoản của bạn' : 'Chào mừng trở lại!'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleAuth} className="p-8 space-y-5">
          {/* Username */}
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest pl-1">
              Tên đăng nhập
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-blue-500 transition-colors">
                <UserIcon className="w-5 h-5" />
              </div>
              <input
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white transition-all outline-none font-bold text-slate-800 placeholder-slate-200"
                placeholder="Nhập tên đăng nhập..."
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest pl-1">
              Mật khẩu
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-blue-500 transition-colors">
                <LockClosedIcon className="w-5 h-5" />
              </div>
              <input
                type="password"
                required
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white transition-all outline-none font-bold text-slate-800 placeholder-slate-200"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Confirm Password (Đăng ký) */}
          {isSignUp && (
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest pl-1">
                Xác nhận mật khẩu
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-blue-500 transition-colors">
                  <ShieldCheckIcon className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white transition-all outline-none font-bold text-slate-800 placeholder-slate-200"
                  placeholder="Nhập lại mật khẩu..."
                />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold text-center">
              🚨 {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-slate-800 active:scale-[0.98] transition-all shadow-xl flex items-center justify-center gap-2 text-sm uppercase tracking-widest mt-2"
          >
            {loading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : (
              <>
                {isSignUp ? 'Tạo tài khoản' : 'Đăng nhập'}
                <ArrowRightIcon className="w-5 h-5" />
              </>
            )}
          </button>

          {/* Toggle */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setError('') }}
              className="text-xs font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest"
            >
              {isSignUp ? '← Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Auth
