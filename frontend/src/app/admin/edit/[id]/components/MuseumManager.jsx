'use client';

import React, { useState } from 'react';
import { useEditDepartment, defaultMuseumContent } from './EditDepartmentContext';

export default function MuseumManager() {
  const {
    setView,
    apiUrl,
    dept,
    museumContent,
    setMuseumContent,
    activeMuseumTab,
    setActiveMuseumTab,
    saveMuseumContentDirectly,
    handleMuseumImageUpload,
    getImageUrl,
    showConfirm
  } = useEditDepartment();

  const [errors, setErrors] = useState({});

  const handleSaveMuseumLocal = async () => {
    const newErrors = {};
    if (!museumContent.importance_list_title?.trim()) {
      newErrors.importance_list_title = 'List Title Accent is required';
    }

    if (museumContent.fossils) {
      museumContent.fossils.forEach((f, idx) => {
        if (!f.name?.trim()) {
          newErrors[`fossil_name_${idx}`] = 'Specimen Name is required';
        }
        if (!f.image?.trim()) {
          newErrors[`fossil_image_${idx}`] = 'Specimen Image is required';
        }
      });
    }

    if (museumContent.minerals) {
      museumContent.minerals.forEach((m, idx) => {
        if (!m.name?.trim()) {
          newErrors[`mineral_name_${idx}`] = 'Specimen Name is required';
        }
        if (!m.image?.trim()) {
          newErrors[`mineral_image_${idx}`] = 'Specimen Image is required';
        }
      });
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert("Please fill all required fields.");
      return;
    }

    setErrors({});
    await saveMuseumContentDirectly(museumContent);
    alert("Museum content saved successfully!");
  };

  const isZoology = dept?.slug === 'zoology';

  React.useEffect(() => {
    if (!museumContent) return;
    if (isZoology) {
      if (activeMuseumTab !== 'events') {
        setActiveMuseumTab('events');
      }
    } else {
      const geologyTabs = ['intro', 'museum', 'importance', 'fossils', 'minerals', 'ores'];
      if (!geologyTabs.includes(activeMuseumTab)) {
        setActiveMuseumTab('intro');
      }
    }
  }, [isZoology, activeMuseumTab, setActiveMuseumTab, museumContent]);

  if (!museumContent) {
    return (
      <div className="p-8 text-center text-slate-500 font-bold bg-white rounded-3xl border border-slate-100 shadow-sm animate-in fade-in duration-300 font-sans">
        Loading museum configurations...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      {/* Header Card */}
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 m-0">
            {isZoology ? 'Zoology Museum Event Manager' : 'Geological Museum Manager'}
          </h2>
          <p className="text-xs text-slate-450 mt-1 font-bold uppercase tracking-wider">
            {isZoology 
              ? 'Configure event gallery and photos for Zoology Museum' 
              : 'Configure exact museum texts, bullet lists, fossils, and minerals'}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSaveMuseumLocal}
            className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-green-700 transition cursor-pointer border-none shadow-md text-xs uppercase tracking-wider"
          >
            💾 Save All Changes
          </button>
          <button
            onClick={async () => {
              const confirmed = await showConfirm({
                title: 'Reset Museum Texts',
                message: 'Are you sure you want to reset all museum texts to default Periyar University page content?',
                itemName: 'Reset Action'
              });
              if (confirmed) {
                setMuseumContent(defaultMuseumContent);
              }
            }}
            className="bg-amber-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-amber-700 transition cursor-pointer border-none shadow-md text-xs uppercase tracking-wider"
          >
            🔄 Reset to Default
          </button>
          <button
            onClick={() => setView('dashboard')}
            className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-2.5 rounded-xl font-bold transition cursor-pointer border-none shadow-sm text-xs uppercase tracking-wider"
          >
            Back
          </button>
        </div>
      </div>

      {/* Structured Section Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Vertical Sidebar Tabs */}
        <div className="lg:col-span-1 space-y-2 pr-1">
          {!isZoology ? (
            <>
              <button
                onClick={() => setActiveMuseumTab('intro')}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 font-bold text-xs uppercase tracking-wider cursor-pointer ${activeMuseumTab === 'intro'
                    ? 'bg-[#990033] text-white border-[#990033] shadow-md'
                    : 'bg-white text-slate-650 border-slate-100 hover:bg-slate-50'
                  }`}
              >
                🌟 Introduction
              </button>
              <button
                onClick={() => setActiveMuseumTab('museum')}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 font-bold text-xs uppercase tracking-wider cursor-pointer ${activeMuseumTab === 'museum'
                    ? 'bg-[#990033] text-white border-[#990033] shadow-md'
                    : 'bg-white text-slate-650 border-slate-100 hover:bg-slate-50'
                  }`}
              >
                🏛️ Geological Museum
              </button>
              <button
                onClick={() => setActiveMuseumTab('importance')}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 font-bold text-xs uppercase tracking-wider cursor-pointer ${activeMuseumTab === 'importance'
                    ? 'bg-[#990033] text-white border-[#990033] shadow-md'
                    : 'bg-white text-slate-650 border-slate-100 hover:bg-slate-50'
                  }`}
              >
                💎 Importance & List
              </button>
              <button
                onClick={() => setActiveMuseumTab('fossils')}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 font-bold text-xs uppercase tracking-wider cursor-pointer ${activeMuseumTab === 'fossils'
                    ? 'bg-[#990033] text-white border-[#990033] shadow-md'
                    : 'bg-white text-slate-650 border-slate-100 hover:bg-slate-50'
                  }`}
              >
                🦕 Fossil Gallery
              </button>
              <button
                onClick={() => setActiveMuseumTab('minerals')}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 font-bold text-xs uppercase tracking-wider cursor-pointer ${activeMuseumTab === 'minerals'
                    ? 'bg-[#990033] text-white border-[#990033] shadow-md'
                    : 'bg-white text-slate-650 border-slate-100 hover:bg-slate-50'
                  }`}
              >
                🔮 Mineral Gallery
              </button>
              <button
                onClick={() => setActiveMuseumTab('ores')}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 font-bold text-xs uppercase tracking-wider cursor-pointer ${activeMuseumTab === 'ores'
                    ? 'bg-[#990033] text-white border-[#990033] shadow-md'
                    : 'bg-white text-slate-650 border-slate-100 hover:bg-slate-50'
                  }`}
              >
                ⛰️ Ore Gallery
              </button>
            </>
          ) : (
            <button
              onClick={() => setActiveMuseumTab('events')}
              className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 font-bold text-xs uppercase tracking-wider cursor-pointer ${activeMuseumTab === 'events'
                  ? 'bg-[#990033] text-white border-[#990033] shadow-md'
                  : 'bg-white text-slate-650 border-slate-100 hover:bg-slate-50'
                }`}
            >
              📸 Event Gallery
            </button>
          )}
        </div>

        {/* Main Content Workspace Panel */}
        <div className="lg:col-span-3 bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">

          {activeMuseumTab === 'intro' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h3 className="text-base font-extrabold text-slate-800 border-b border-slate-100 pb-3 m-0">Introduction Section Texts</h3>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Main Intro Paragraph</label>
                <textarea
                  rows={4}
                  value={museumContent.intro_text || ''}
                  onChange={(e) => setMuseumContent({ ...museumContent, intro_text: e.target.value })}
                  className="w-full p-4 border border-slate-200 rounded-2xl text-slate-800 text-sm font-medium focus:border-[#990033] focus:outline-none bg-slate-50/20 leading-relaxed"
                  placeholder="Enter main intro paragraph..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Introduction Bullet Points (One per line)</label>
                <textarea
                  rows={6}
                  value={(museumContent.intro_bullets || []).join('\n')}
                  onChange={(e) => setMuseumContent({ ...museumContent, intro_bullets: e.target.value.split('\n') })}
                  className="w-full p-4 border border-slate-200 rounded-2xl text-slate-800 text-sm font-medium focus:border-[#990033] focus:outline-none bg-slate-50/20 leading-relaxed"
                  placeholder="Enter bullet points, one per line..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ending Intro Paragraph</label>
                <textarea
                  rows={4}
                  value={museumContent.intro_outro || ''}
                  onChange={(e) => setMuseumContent({ ...museumContent, intro_outro: e.target.value })}
                  className="w-full p-4 border border-slate-200 rounded-2xl text-slate-800 text-sm font-medium focus:border-[#990033] focus:outline-none bg-slate-50/20 leading-relaxed"
                  placeholder="Enter ending intro paragraph..."
                />
              </div>
            </div>
          )}

          {activeMuseumTab === 'museum' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h3 className="text-base font-extrabold text-slate-800 border-b border-slate-100 pb-3 m-0">Geological Museum Details</h3>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Museum Description Paragraph 1</label>
                <textarea
                  rows={5}
                  value={museumContent.museum_text1 || ''}
                  onChange={(e) => setMuseumContent({ ...museumContent, museum_text1: e.target.value })}
                  className="w-full p-4 border border-slate-200 rounded-2xl text-slate-800 text-sm font-medium focus:border-[#990033] focus:outline-none bg-slate-50/20 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Museum Description Paragraph 2</label>
                <textarea
                  rows={4}
                  value={museumContent.museum_text2 || ''}
                  onChange={(e) => setMuseumContent({ ...museumContent, museum_text2: e.target.value })}
                  className="w-full p-4 border border-slate-200 rounded-2xl text-slate-800 text-sm font-medium focus:border-[#990033] focus:outline-none bg-slate-50/20 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">"Geological Collections Can" Bullets (One per line)</label>
                <textarea
                  rows={6}
                  value={(museumContent.collections_can || []).join('\n')}
                  onChange={(e) => setMuseumContent({ ...museumContent, collections_can: e.target.value.split('\n') })}
                  className="w-full p-4 border border-slate-200 rounded-2xl text-slate-800 text-sm font-medium focus:border-[#990033] focus:outline-none bg-slate-50/20 leading-relaxed"
                />
              </div>
            </div>
          )}

          {activeMuseumTab === 'importance' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h3 className="text-base font-extrabold text-slate-800 border-b border-slate-100 pb-3 m-0">Importance & Specimen Lists</h3>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Importance Paragraph 1</label>
                <textarea
                  rows={4}
                  value={museumContent.importance_text1 || ''}
                  onChange={(e) => setMuseumContent({ ...museumContent, importance_text1: e.target.value })}
                  className="w-full p-4 border border-slate-200 rounded-2xl text-slate-800 text-sm font-medium focus:border-[#990033] focus:outline-none bg-slate-50/20 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Importance Paragraph 2</label>
                <textarea
                  rows={4}
                  value={museumContent.importance_text2 || ''}
                  onChange={(e) => setMuseumContent({ ...museumContent, importance_text2: e.target.value })}
                  className="w-full p-4 border border-slate-200 rounded-2xl text-slate-800 text-sm font-medium focus:border-[#990033] focus:outline-none bg-slate-50/20 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">List Title Accent</label>
                <input
                  type="text"
                  value={museumContent.importance_list_title || ''}
                  onChange={(e) => {
                    setMuseumContent({ ...museumContent, importance_list_title: e.target.value });
                    if (errors.importance_list_title) setErrors({ ...errors, importance_list_title: null });
                  }}
                  className={`w-full p-4 border rounded-2xl text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/20 transition-all ${errors.importance_list_title ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 bg-red-50/5' : 'border-slate-200 focus:border-[#990033]'}`}
                />
                {errors.importance_list_title && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-red-650 bg-red-50/50 px-3 py-1.5 rounded-xl border border-red-100/50 w-fit animate-in fade-in slide-in-from-top-1 duration-200">
                    <span className="text-xs">⚠️</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">{errors.importance_list_title}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Specimens Description Paragraph 3</label>
                <textarea
                  rows={4}
                  value={museumContent.importance_text3 || ''}
                  onChange={(e) => setMuseumContent({ ...museumContent, importance_text3: e.target.value })}
                  className="w-full p-4 border border-slate-200 rounded-2xl text-slate-800 text-sm font-medium focus:border-[#990033] focus:outline-none bg-slate-50/20 leading-relaxed"
                />
              </div>
            </div>
          )}

          {activeMuseumTab === 'fossils' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-base font-extrabold text-slate-800 m-0">Fossil Specimens Showcase ({(museumContent.fossils || []).length})</h3>
                <button
                  onClick={() => {
                    const current = museumContent.fossils || [];
                    setMuseumContent({
                      ...museumContent,
                      fossils: [...current, { name: 'New Fossil Specimen', image: '' }]
                    });
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white border-none py-1.5 px-3 rounded-lg font-bold text-xs uppercase tracking-wide cursor-pointer"
                >
                  + Add Fossil
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(museumContent.fossils || []).map((item, idx) => (
                  <div key={idx} className="p-5 border border-slate-100 rounded-3xl bg-slate-50/50 relative group flex flex-col gap-4">
                    <button
                      onClick={() => {
                        const current = [...(museumContent.fossils || [])];
                        current.splice(idx, 1);
                        setMuseumContent({ ...museumContent, fossils: current });
                      }}
                      className="absolute top-3 right-3 text-red-500 hover:text-red-700 border-none bg-transparent font-bold cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                    >
                      🗑️ Delete
                    </button>

                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Specimen Name</label>
                      <input
                        type="text"
                        value={item.name || ''}
                        onChange={(e) => {
                          const current = [...(museumContent.fossils || [])];
                          current[idx].name = e.target.value;
                          setMuseumContent({ ...museumContent, fossils: current });
                          if (errors[`fossil_name_${idx}`]) setErrors({ ...errors, [`fossil_name_${idx}`]: null });
                        }}
                        className={`w-full p-2.5 border rounded-xl text-slate-800 font-bold text-xs focus:outline-none bg-white transition-all ${errors[`fossil_name_${idx}`] ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 bg-red-50/5' : 'border-slate-200 focus:border-[#990033]'}`}
                      />
                      {errors[`fossil_name_${idx}`] && (
                        <div className="flex items-center gap-1 mt-1 text-red-650 bg-red-50/50 px-2 py-1 rounded-lg border border-red-100/50 w-fit animate-in fade-in slide-in-from-top-1 duration-200">
                          <span className="text-[10px]">⚠️</span>
                          <span className="text-[9px] font-bold uppercase tracking-wider">{errors[`fossil_name_${idx}`]}</span>
                        </div>
                      )}
                    </div>

                    {/* Drag and Drop Zone Container */}
                    <div className="space-y-2">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Specimen Image</label>
                      <div className="flex gap-4 items-center">
                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-white flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={getImageUrl(item.image, false)} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div
                          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-[#990033]', 'bg-rose-50/30'); }}
                          onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-[#990033]', 'bg-rose-50/30'); }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.remove('border-[#990033]', 'bg-rose-50/30');
                            handleMuseumImageUpload(e.dataTransfer.files[0], 'fossils', idx);
                            if (errors[`fossil_image_${idx}`]) setErrors({ ...errors, [`fossil_image_${idx}`]: null });
                          }}
                          className={`flex-1 border-2 border-dashed transition-all duration-200 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer text-center relative group min-h-[80px] ${errors[`fossil_image_${idx}`] ? 'border-red-400 bg-red-50/5 hover:border-red-500' : 'border-slate-200 hover:border-[#990033] hover:bg-slate-50'}`}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => {
                              handleMuseumImageUpload(e.target.files[0], 'fossils', idx);
                              if (errors[`fossil_image_${idx}`]) setErrors({ ...errors, [`fossil_image_${idx}`]: null });
                            }}
                          />
                          <span className="text-xl">📁</span>
                          <span className="text-[10px] font-bold text-slate-500 mt-1 block">
                            Drag & drop image or click to upload
                          </span>
                        </div>
                      </div>
                      {errors[`fossil_image_${idx}`] && (
                        <div className="flex items-center gap-1 mt-1 text-red-650 bg-red-50/50 px-2 py-1 rounded-lg border border-red-100/50 w-fit animate-in fade-in slide-in-from-top-1 duration-200">
                          <span className="text-[10px]">⚠️</span>
                          <span className="text-[9px] font-bold uppercase tracking-wider">{errors[`fossil_image_${idx}`]}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeMuseumTab === 'minerals' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-base font-extrabold text-slate-800 m-0">Mineral Specimens Showcase ({(museumContent.minerals || []).length})</h3>
                <button
                  onClick={() => {
                    const current = museumContent.minerals || [];
                    setMuseumContent({
                      ...museumContent,
                      minerals: [...current, { name: 'New Mineral Specimen', image: '' }]
                    });
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white border-none py-1.5 px-3 rounded-lg font-bold text-xs uppercase tracking-wide cursor-pointer"
                >
                  + Add Mineral
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(museumContent.minerals || []).map((item, idx) => (
                  <div key={idx} className="p-5 border border-slate-100 rounded-3xl bg-slate-50/50 relative group flex flex-col gap-4">
                    <button
                      onClick={() => {
                        const current = [...(museumContent.minerals || [])];
                        current.splice(idx, 1);
                        setMuseumContent({ ...museumContent, minerals: current });
                      }}
                      className="absolute top-3 right-3 text-red-500 hover:text-red-700 border-none bg-transparent font-bold cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                    >
                      🗑️ Delete
                    </button>

                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Specimen Name</label>
                      <input
                        type="text"
                        value={item.name || ''}
                        onChange={(e) => {
                          const current = [...(museumContent.minerals || [])];
                          current[idx].name = e.target.value;
                          setMuseumContent({ ...museumContent, minerals: current });
                          if (errors[`mineral_name_${idx}`]) setErrors({ ...errors, [`mineral_name_${idx}`]: null });
                        }}
                        className={`w-full p-2.5 border rounded-xl text-slate-800 font-bold text-xs focus:outline-none bg-white transition-all ${errors[`mineral_name_${idx}`] ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 bg-red-50/5' : 'border-slate-200 focus:border-[#990033]'}`}
                      />
                      {errors[`mineral_name_${idx}`] && (
                        <div className="flex items-center gap-1 mt-1 text-red-650 bg-red-50/50 px-2 py-1 rounded-lg border border-red-100/50 w-fit animate-in fade-in slide-in-from-top-1 duration-200">
                          <span className="text-[10px]">⚠️</span>
                          <span className="text-[9px] font-bold uppercase tracking-wider">{errors[`mineral_name_${idx}`]}</span>
                        </div>
                      )}
                    </div>

                    {/* Drag and Drop Zone Container */}
                    <div className="space-y-2">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Specimen Image</label>
                      <div className="flex gap-4 items-center">
                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-white flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={getImageUrl(item.image, true)} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div
                          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-[#990033]', 'bg-rose-50/30'); }}
                          onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-[#990033]', 'bg-rose-50/30'); }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.remove('border-[#990033]', 'bg-rose-50/30');
                            handleMuseumImageUpload(e.dataTransfer.files[0], 'minerals', idx);
                            if (errors[`mineral_image_${idx}`]) setErrors({ ...errors, [`mineral_image_${idx}`]: null });
                          }}
                          className={`flex-1 border-2 border-dashed transition-all duration-200 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer text-center relative group min-h-[80px] ${errors[`mineral_image_${idx}`] ? 'border-red-400 bg-red-50/5 hover:border-red-500' : 'border-slate-200 hover:border-[#990033] hover:bg-slate-50'}`}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => {
                              handleMuseumImageUpload(e.target.files[0], 'minerals', idx);
                              if (errors[`mineral_image_${idx}`]) setErrors({ ...errors, [`mineral_image_${idx}`]: null });
                            }}
                          />
                          <span className="text-xl">📁</span>
                          <span className="text-[10px] font-bold text-slate-500 mt-1 block">
                            Drag & drop image or click to upload
                          </span>
                        </div>
                      </div>
                      {errors[`mineral_image_${idx}`] && (
                        <div className="flex items-center gap-1 mt-1 text-red-650 bg-red-50/50 px-2 py-1 rounded-lg border border-red-100/50 w-fit animate-in fade-in slide-in-from-top-1 duration-200">
                          <span className="text-[10px]">⚠️</span>
                          <span className="text-[9px] font-bold uppercase tracking-wider">{errors[`mineral_image_${idx}`]}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeMuseumTab === 'ores' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-base font-extrabold text-slate-800 m-0">Ore Specimens Showcase ({(museumContent.ores || []).length})</h3>
                <button
                  onClick={() => {
                    const current = museumContent.ores || [];
                    setMuseumContent({
                      ...museumContent,
                      ores: [...current, { name: 'New Ore Specimen', image: '' }]
                    });
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white border-none py-1.5 px-3 rounded-lg font-bold text-xs uppercase tracking-wide cursor-pointer"
                >
                  + Add Ore
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(museumContent.ores || []).map((item, idx) => (
                  <div key={idx} className="p-5 border border-slate-100 rounded-3xl bg-slate-50/50 relative group flex flex-col gap-4">
                    <button
                      onClick={() => {
                        const current = [...(museumContent.ores || [])];
                        current.splice(idx, 1);
                        setMuseumContent({ ...museumContent, ores: current });
                      }}
                      className="absolute top-3 right-3 text-red-500 hover:text-red-700 border-none bg-transparent font-bold cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                    >
                      🗑️ Delete
                    </button>

                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Specimen Name</label>
                      <input
                        type="text"
                        value={item.name || ''}
                        onChange={(e) => {
                          const current = [...(museumContent.ores || [])];
                          current[idx].name = e.target.value;
                          setMuseumContent({ ...museumContent, ores: current });
                        }}
                        className="w-full p-2.5 border border-slate-200 rounded-xl text-slate-800 font-bold text-xs focus:outline-none bg-white focus:border-[#990033]"
                      />
                    </div>

                    {/* Drag and Drop Zone Container */}
                    <div className="space-y-2">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Specimen Image</label>
                      <div className="flex gap-4 items-center">
                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-white flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={getImageUrl(item.image, 'ores')} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div
                          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-[#990033]', 'bg-rose-50/30'); }}
                          onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-[#990033]', 'bg-rose-50/30'); }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.remove('border-[#990033]', 'bg-rose-50/30');
                            handleMuseumImageUpload(e.dataTransfer.files[0], 'ores', idx);
                          }}
                          className="flex-1 border-2 border-dashed border-slate-200 hover:border-[#990033] hover:bg-slate-50 transition-all duration-200 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer text-center relative group min-h-[80px]"
                        >
                          <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => handleMuseumImageUpload(e.target.files[0], 'ores', idx)}
                          />
                          <span className="text-xl">📁</span>
                          <span className="text-[10px] font-bold text-slate-500 mt-1 block">
                            Drag & drop image or click to upload
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeMuseumTab === 'events' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-base font-extrabold text-slate-800 m-0">Museum Events Gallery ({(museumContent.events || []).length})</h3>
                <button
                  onClick={() => {
                    const current = museumContent.events || [];
                    setMuseumContent({
                      ...museumContent,
                      events: [...current, { title: 'New Museum Event', images: [] }]
                    });
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white border-none py-1.5 px-3 rounded-lg font-bold text-xs uppercase tracking-wide cursor-pointer"
                >
                  + Add Event
                </button>
              </div>

              <div className="space-y-8">
                {(museumContent.events || []).length === 0 ? (
                  <div className="p-8 text-center text-slate-400 font-bold text-sm bg-slate-50/55 rounded-3xl border border-dashed border-slate-200">
                    No museum events added yet. Click "+ Add Event" to begin.
                  </div>
                ) : (
                  (museumContent.events || []).map((evt, evtIdx) => (
                    <div key={evtIdx} className="p-6 border border-slate-100 rounded-3xl bg-slate-50/50 relative group flex flex-col gap-6">
                      <button
                        onClick={async () => {
                          const confirmed = await showConfirm({
                            title: 'Delete Museum Event',
                            message: 'Are you sure you want to delete this event from the gallery?',
                            itemName: evt.title || `Event #${evtIdx + 1}`
                          });
                          if (confirmed) {
                            const current = [...(museumContent.events || [])];
                            current.splice(evtIdx, 1);
                            setMuseumContent({ ...museumContent, events: current });
                          }
                        }}
                        className="absolute top-4 right-4 text-red-555 hover:text-red-700 border-none bg-transparent font-bold cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                      >
                        🗑️ Delete Event
                      </button>

                      <div className="max-w-md">
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 font-bold">Event Title</label>
                        <input
                          type="text"
                          value={evt.title || ''}
                          onChange={(e) => {
                            const current = [...(museumContent.events || [])];
                            current[evtIdx].title = e.target.value;
                            setMuseumContent({ ...museumContent, events: current });
                          }}
                          className="w-full p-3 border border-slate-200 rounded-xl text-slate-800 font-bold text-xs focus:outline-none bg-white focus:border-[#990033]"
                          placeholder="e.g., Museum Visit by School Children"
                        />
                      </div>

                      {/* Multiple Images Upload Box */}
                      <div className="space-y-4">
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest font-bold">Event Photos</label>
                        <div className="flex flex-wrap gap-4 items-start">
                          <div
                            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-[#990033]', 'bg-rose-50/30'); }}
                            onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-[#990033]', 'bg-rose-50/30'); }}
                            onDrop={async (e) => {
                              e.preventDefault();
                              e.currentTarget.classList.remove('border-[#990033]', 'bg-rose-50/30');
                              const files = Array.from(e.dataTransfer.files);
                              if (files.length === 0) return;
                              const uploadedUrls = [];
                              for (const file of files) {
                                const formData = new FormData();
                                formData.append('file', file);
                                try {
                                  const uploadRes = await fetch(`${apiUrl}/admin/upload`, {
                                    method: 'POST',
                                    body: formData
                                  });
                                  if (uploadRes.ok) {
                                    const uploadData = await uploadRes.json();
                                    uploadedUrls.push(uploadData.url);
                                  }
                                } catch (err) { console.error(err); }
                              }
                              const current = [...(museumContent.events || [])];
                              current[evtIdx].images = [...(current[evtIdx].images || []), ...uploadedUrls];
                              setMuseumContent({ ...museumContent, events: current });
                            }}
                            className="w-full sm:w-64 border-2 border-dashed border-slate-200 hover:border-[#990033] hover:bg-slate-50 transition-all duration-200 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer text-center relative min-h-[110px]"
                          >
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              onChange={async (e) => {
                                const files = Array.from(e.target.files);
                                if (files.length === 0) return;
                                const uploadedUrls = [];
                                for (const file of files) {
                                  const formData = new FormData();
                                  formData.append('file', file);
                                  try {
                                    const uploadRes = await fetch(`${apiUrl}/admin/upload`, {
                                      method: 'POST',
                                      body: formData
                                    });
                                    if (uploadRes.ok) {
                                      const uploadData = await uploadRes.json();
                                      uploadedUrls.push(uploadData.url);
                                    }
                                  } catch (err) { console.error(err); }
                                }
                                const current = [...(museumContent.events || [])];
                                current[evtIdx].images = [...(current[evtIdx].images || []), ...uploadedUrls];
                                setMuseumContent({ ...museumContent, events: current });
                              }}
                            />
                            <span className="text-2xl">📸</span>
                            <span className="text-[10px] font-bold text-slate-500 mt-2 block">
                              Drag & drop images or click to upload
                            </span>
                          </div>

                          {/* Event Images List */}
                          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 min-w-[280px]">
                            {(evt.images || []).map((imgUrl, imgIdx) => (
                              <div key={imgIdx} className="relative aspect-video rounded-xl border border-slate-200 bg-white overflow-hidden group shadow-sm">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={getImageUrl(imgUrl, 'events')} alt="" className="w-full h-full object-cover" />
                                <button
                                  onClick={() => {
                                    const current = [...(museumContent.events || [])];
                                    current[evtIdx].images = current[evtIdx].images.filter((_, idx) => idx !== imgIdx);
                                    setMuseumContent({ ...museumContent, events: current });
                                  }}
                                  className="absolute top-1.5 right-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-[9px] w-5 h-5 rounded-full flex items-center justify-center border-none cursor-pointer shadow-md opacity-90 transition-opacity"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}


        </div>

      </div>

      {/* Save Bottom Panel */}
      <div className="flex gap-4 p-5 bg-white border border-slate-100 rounded-3xl shadow-sm justify-end font-sans">
        <button
          onClick={async () => {
            await saveMuseumContentDirectly(museumContent);
            alert("Museum content saved successfully!");
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold transition cursor-pointer border-none shadow-md text-sm font-sans"
        >
          💾 Save All Changes
        </button>
        <button
          onClick={async () => {
            const confirmed = await showConfirm({
              title: 'Reset Museum Texts',
              message: 'Are you sure you want to reset all museum texts to default Periyar University page content?',
              itemName: 'Reset Action'
            });
            if (confirmed) {
              setMuseumContent(defaultMuseumContent);
            }
          }}
          className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-bold transition cursor-pointer border-none shadow-sm text-sm font-sans"
        >
          🔄 Reset to Default
        </button>
        <button
          onClick={() => setView('dashboard')}
          className="bg-slate-100 hover:bg-slate-200 text-slate-655 border border-slate-200 px-6 py-3 rounded-xl font-bold transition cursor-pointer text-sm shadow-sm font-sans"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
