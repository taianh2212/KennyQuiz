import React from 'react'
import {
  PlusIcon,
  PlayIcon,
  PencilIcon,
  TrashIcon,
  BookOpenIcon,
  SparklesIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

const Home = ({ projects, onSelectProject, onEditProject, onDeleteProject, onCreateNew }) => {
  const totalCards = projects.reduce((acc, p) => acc + (p.cards?.length || 0), 0)
  const aiGeneratedCount = projects.filter(p => p.isAiGenerated).length

  return (
    <div className="space-y-8 pb-10">
      {/* Stats Section - Mobile Scrollable */}
      <section className="flex overflow-x-auto pb-4 gap-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 sm:overflow-visible no-scrollbar">
        <div className="flex-shrink-0 w-[80%] sm:w-full p-6 bg-white rounded-3xl border border-blue-50 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <BookOpenIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800">{projects.length}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Dự án</div>
          </div>
        </div>
        
        <div className="flex-shrink-0 w-[80%] sm:w-full p-6 bg-white rounded-3xl border border-indigo-50 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
            <ChartBarIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800">{totalCards}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Thẻ câu hỏi</div>
          </div>
        </div>

        <div className="flex-shrink-0 w-[80%] sm:w-full p-6 bg-white rounded-3xl border border-purple-50 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
            <SparklesIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800">{aiGeneratedCount}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI Powered</div>
          </div>
        </div>
      </section>

      {/* Projects Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800">Dự án của tôi</h2>
          <p className="text-slate-400 text-sm mt-1">{projects.length > 0 ? `${projects.length} dự án đang học` : 'Chưa có dự án nào'}</p>
        </div>
        <button 
          onClick={onCreateNew}
          className="btn-primary w-full sm:w-auto py-4 sm:py-3 shadow-blue-500/30"
        >
          <PlusIcon className="w-6 h-6 sm:w-5 sm:h-5" />
          <span className="text-lg sm:text-base font-bold">Tạo dự án mới</span>
        </button>
      </div>

      {/* Project List */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {projects.length > 0 ? (
          projects.map((project) => (
            <div 
              key={project.id} 
              className="group p-5 sm:p-6 bg-white rounded-[2rem] border-2 border-slate-50 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/5 transition-all flex flex-col sm:flex-row items-start sm:items-center gap-6"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[1.25rem] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <BookOpenIcon className="w-7 h-7 sm:w-8 sm:h-8 text-blue-500" />
              </div>
              
              <div className="flex-1 min-w-0 w-full">
                <h3 className="text-xl sm:text-2xl font-black text-slate-800 truncate mb-1">
                  {project.name}
                </h3>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 uppercase tracking-tighter">
                    {project.cards?.length || 0} thẻ
                  </span>
                  <span className="text-xs font-bold text-slate-300 uppercase letter tracking-tighter">
                    {new Date(project.created_at || project.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>

              {/* Action Buttons - Mobile friendly grid */}
              <div className="grid grid-cols-3 sm:flex items-center gap-3 w-full sm:w-auto pt-2 sm:pt-0">
                <button 
                  onClick={() => onSelectProject(project)}
                  className="p-4 sm:p-3 bg-green-50 text-green-600 rounded-2xl hover:bg-green-100 transition-all flex items-center justify-center"
                  title="Học tập"
                >
                  <PlayIcon className="w-6 h-6 sm:w-5 sm:h-5" />
                </button>
                <button 
                  onClick={() => onEditProject(project)}
                  className="p-4 sm:p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition-all flex items-center justify-center"
                  title="Chỉnh sửa"
                >
                  <PencilIcon className="w-6 h-6 sm:w-5 sm:h-5" />
                </button>
                <button 
                  onClick={() => {
                    if (window.confirm('Bạn có chắc chắn muốn xoá dự án này?')) {
                      onDeleteProject(project.id)
                    }
                  }}
                  className="p-4 sm:p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-all flex items-center justify-center"
                  title="Xoá"
                >
                  <TrashIcon className="w-6 h-6 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="card-glass text-center py-16 flex flex-col items-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <PlusIcon className="w-12 h-12 text-slate-200" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">Bắt đầu học thôi!</h3>
            <p className="text-slate-400 max-w-sm mx-auto mb-10 text-lg">
              Nhập bất kỳ tài liệu, bài học nào — AI sẽ tự động tạo thẻ câu hỏi thông minh cho bạn.
            </p>
            <button 
              onClick={onCreateNew}
              className="btn-primary"
            >
              <PlusIcon className="w-6 h-6" /> Tạo dự án đầu tiên
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
