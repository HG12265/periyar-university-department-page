'use client';

import React, { useState } from 'react';
import { useEditDepartment } from './EditDepartmentContext';

export default function BestPracticesManager() {
  const {
    setView,
    bestPracticesContent,
    setBestPracticesContent,
    saveBestPracticesContentDirectly
  } = useEditDepartment();

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Helper to extract YouTube video ID and construct clean embed URL
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('youtube.com/embed/')) return url;
    
    let videoId = '';
    const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/i);
    if (watchMatch && watchMatch[1]) {
      videoId = watchMatch[1];
    }
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  const embedUrl = getYouTubeEmbedUrl(bestPracticesContent.video_url);

  const handleSave = async () => {
    const newErrors = {};
    if (!bestPracticesContent.title?.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!bestPracticesContent.video_url?.trim()) {
      newErrors.video_url = 'Video URL is required';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      await saveBestPracticesContentDirectly(bestPracticesContent);
      alert('Best Practices configured successfully! ⭐');
    } catch (err) {
      console.error(err);
      alert('Failed to save configurations.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      {/* Header Card */}
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 m-0">⭐ Best Practices Manager</h2>
          <p className="text-xs text-slate-400 mt-1 font-bold uppercase tracking-wider">Configure exact YouTube embedded video player and description</p>
        </div>
        <button
          onClick={() => setView('dashboard')}
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all duration-200 text-sm flex items-center gap-2 border-none cursor-pointer"
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor Form Panel */}
        <div className="lg:col-span-5 space-y-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-md font-bold text-slate-700 border-b border-slate-100 pb-3 m-0">⚙️ Edit Configuration</h3>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Section Header Title</label>
              <input
                type="text"
                value={bestPracticesContent.title || ''}
                onChange={(e) => setBestPracticesContent({ ...bestPracticesContent, title: e.target.value })}
                className="w-full p-4 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-[#ffc107] font-semibold text-slate-700 bg-slate-50/50"
                placeholder="E.g., BEST PRACTICES"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">YouTube Video URL</label>
              <input
                type="text"
                value={bestPracticesContent.video_url || ''}
                onChange={(e) => setBestPracticesContent({ ...bestPracticesContent, video_url: e.target.value })}
                className="w-full p-4 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-[#ffc107] font-semibold text-slate-700 bg-slate-50/50"
                placeholder="Paste YouTube watch link or embed link..."
              />
              {errors.video_url && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.video_url}</p>}
              <p className="text-[10px] text-slate-400 mt-2 font-medium">Supports normal links (youtube.com/watch?v=...), short links (youtu.be/...), or iframe embed URLs.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Video Label/Description</label>
              <textarea
                rows={3}
                value={bestPracticesContent.description || ''}
                onChange={(e) => setBestPracticesContent({ ...bestPracticesContent, description: e.target.value })}
                className="w-full p-4 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-[#ffc107] font-semibold text-slate-700 bg-slate-50/50"
                placeholder="Enter description to display under video..."
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-[#ffc107] hover:shadow-lg hover:shadow-amber-500/20 text-white font-extrabold rounded-2xl transition-all duration-200 border-none cursor-pointer text-sm shadow-md"
          >
            {saving ? 'Saving Configurations...' : '💾 Save Configurations'}
          </button>
        </div>

        {/* Live Preview Panel */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-md font-bold text-slate-700 border-b border-slate-100 pb-3 m-0 mb-6">🖥️ Live Public Site Preview</h3>
          
          <div className="flex-1 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-100 min-h-[300px]">
            <div className="w-full max-w-lg flex flex-col items-center space-y-4">
              <h2 className="text-lg font-black text-slate-800 tracking-wider text-center uppercase">
                {bestPracticesContent.title || 'BEST PRACTICES'}
              </h2>

              {embedUrl ? (
                <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-md border border-slate-200 bg-black">
                  <iframe
                    width="100%"
                    height="100%"
                    src={embedUrl}
                    title={bestPracticesContent.title || "YouTube video player"}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <div className="w-full aspect-video rounded-2xl border-2 border-dashed border-slate-200 bg-slate-100/50 flex flex-col items-center justify-center text-slate-400 font-bold p-4 text-center">
                  <span className="text-3xl mb-2">📺</span>
                  <span>Paste a YouTube Video URL to see the live player preview here.</span>
                </div>
              )}

              <p className="text-slate-700 text-sm font-bold text-center mt-2">
                {bestPracticesContent.description || 'Best Practices description label'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
