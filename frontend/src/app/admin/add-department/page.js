'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminSidebar from '@/components/AdminSidebar';

import { ToastProvider } from '@/components/ToastContext';

export default function AddDepartmentWrapper() {
  return (
    <ToastProvider>
      <AddDepartment />
    </ToastProvider>
  );
}

function AddDepartment() {
  const [formData, setFormData] = useState({ name: '', slug: '', title: '' });
  const [errors, setErrors] = useState({});
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const bannerInputRef = useRef(null);
  const router = useRouter();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';

  // Slugify helper
  const slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  const handleNameChange = (e) => {
    const nameVal = e.target.value;
    const slugVal = slugify(nameVal);
    const titleVal = nameVal ? `DEPARTMENT OF ${nameVal.toUpperCase()}` : '';
    setFormData({ ...formData, name: nameVal, slug: slugVal, title: titleVal });
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const handleRemoveBanner = () => {
    setBannerFile(null);
    setBannerPreview(null);
    if (bannerInputRef.current) bannerInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name?.trim()) {
      newErrors.name = 'Department Name is required';
    }
    if (!formData.slug?.trim()) {
      newErrors.slug = 'Slug (URL Route) is required';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert('Please fill in Department Name and Slug');
      return;
    }
    setErrors({});

    setSubmitting(true);
    try {
      // Step 1: Upload banner image if provided
      let bannerUrl = null;
      if (bannerFile) {
        setUploading(true);
        const uploadData = new FormData();
        uploadData.append('file', bannerFile);
        uploadData.append('folder', 'banner');
        const uploadRes = await fetch(`${apiUrl}/admin/upload`, {
          method: 'POST',
          body: uploadData
        });
        if (uploadRes.ok) {
          const uploadJson = await uploadRes.json();
          bannerUrl = uploadJson.url;
        } else {
          alert('Banner image upload failed. Please try again.');
          setSubmitting(false);
          setUploading(false);
          return;
        }
        setUploading(false);
      }

      // Step 2: Create department
      const queryParams = new URLSearchParams({
        name: formData.name.trim(),
        slug: formData.slug.toLowerCase().trim(),
        title: formData.title.trim() || `DEPARTMENT OF ${formData.name.toUpperCase().trim()}`,
        ...(bannerUrl ? { banner_image: bannerUrl } : {})
      }).toString();

      const res = await fetch(`${apiUrl}/admin/departments?${queryParams}`, {
        method: 'POST'
      });

      if (res.ok) {
        router.push('/admin');
      } else {
        alert('Failed to add department. Slug might be already taken.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to backend');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 font-sans">
      <AdminSidebar />

      <main className="flex-1 p-4 md:p-8 bg-[#f8fafc]">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/admin"
              className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm transition-colors no-underline font-bold"
            >
              ←
            </Link>
            <div>
              <h1 className="text-2xl font-extrabold text-[#000033] tracking-tight m-0">Add New Department</h1>
              <p className="text-slate-400 text-xs mt-0.5 m-0">Register a new department school into the university portal.</p>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-md">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Department Name */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Department Name</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science"
                  className={`w-full p-3.5 border rounded-xl focus:ring-2 focus:outline-none transition-all text-sm font-semibold bg-slate-50/50 ${errors.name ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500 bg-red-50/5' : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'}`}
                  value={formData.name ?? ''}
                  onChange={(e) => {
                    handleNameChange(e);
                    if (errors.name) setErrors({ ...errors, name: null });
                  }}
                  required
                />
                {errors.name && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-red-655 bg-red-50/50 px-3 py-1.5 rounded-xl border border-red-100/50 w-fit animate-in fade-in slide-in-from-top-1 duration-200">
                    <span className="text-xs">⚠️</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">{errors.name}</span>
                  </div>
                )}
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  Enter the display name. The URL slug and header title will auto-generate dynamically!
                </p>
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Slug (URL Route)</label>
                <input
                  type="text"
                  placeholder="e.g. computer-science"
                  className={`w-full p-3.5 border rounded-xl focus:ring-2 focus:outline-none font-mono text-sm font-bold bg-slate-50/50 ${errors.slug ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500 text-red-700 bg-red-50/5' : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500 text-blue-600'}`}
                  value={formData.slug ?? ''}
                  onChange={(e) => {
                    setFormData({ ...formData, slug: slugify(e.target.value) });
                    if (errors.slug) setErrors({ ...errors, slug: null });
                  }}
                  required
                />
                {errors.slug && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-red-655 bg-red-50/50 px-3 py-1.5 rounded-xl border border-red-100/50 w-fit animate-in fade-in slide-in-from-top-1 duration-200">
                    <span className="text-xs">⚠️</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">{errors.slug}</span>
                  </div>
                )}
                {formData.slug && (
                  <div className="mt-2.5 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50 text-[11px] text-blue-700 font-semibold flex items-center gap-2">
                    <span className="text-sm">🔗</span>
                    <span>Public Route Preview: <strong className="font-bold underline">/dept/{formData.slug}</strong></span>
                  </div>
                )}
              </div>

              {/* Page Title */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Page Header Title (Official Name)</label>
                <input
                  type="text"
                  placeholder="e.g. DEPARTMENT OF COMPUTER SCIENCE"
                  className="w-full p-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none text-sm font-semibold bg-slate-50/50"
                  value={formData.title ?? ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  This serves as the official banner title. Leave it as is to use the auto-generated UPPERCASE version.
                </p>
              </div>

              {/* Banner Image Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                  Department Banner Image
                  <span className="ml-2 text-[10px] font-normal text-slate-400 normal-case tracking-normal">
                    (Optional — shown as the page header background)
                  </span>
                </label>

                {bannerPreview ? (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 shadow-sm mb-3 group">
                    <img
                      src={bannerPreview}
                      alt="Banner preview"
                      className="w-full h-44 object-cover"
                    />
                    {/* Live title overlay preview */}
                    <div className="absolute inset-0 bg-black/15 flex items-center justify-center">
                      <span className="bg-white/90 text-[#000033] text-sm font-extrabold px-6 py-2 rounded-xl shadow tracking-widest uppercase">
                        {formData.title || 'DEPARTMENT OF ...'}
                      </span>
                    </div>
                    {/* Remove banner button */}
                    <button
                      type="button"
                      onClick={handleRemoveBanner}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-bold border-none cursor-pointer shadow-lg transition opacity-0 group-hover:opacity-100 flex items-center justify-center"
                    >
                      ✕
                    </button>
                    <div className="absolute bottom-2 left-2 bg-green-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                      ✓ Banner ready
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => bannerInputRef.current?.click()}
                    className="w-full h-36 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all mb-3"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl">🖼️</div>
                    <p className="text-xs font-bold text-slate-400 m-0">Click to upload banner image</p>
                    <p className="text-[10px] text-slate-300 m-0">PNG, JPG, WEBP — wide/landscape ratio recommended</p>
                  </div>
                )}

                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBannerChange}
                  className="hidden"
                />

                {!bannerPreview && (
                  <button
                    type="button"
                    onClick={() => bannerInputRef.current?.click()}
                    className="w-full py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer bg-white"
                  >
                    📁 Choose Banner Image
                  </button>
                )}
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full py-4 bg-[#000033] hover:bg-[#0b0b47] text-[#ffc107] font-extrabold rounded-2xl shadow-lg shadow-blue-900/5 hover:shadow-xl hover:translate-y-[-1px] active:translate-y-[0px] transition-all cursor-pointer text-sm tracking-wide ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {submitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-[#ffc107] border-t-transparent rounded-full"></div>
                      <span>{uploading ? 'Uploading Banner...' : 'Creating Department Portal...'}</span>
                    </div>
                  ) : (
                    '🚀 Register Department Portal'
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
