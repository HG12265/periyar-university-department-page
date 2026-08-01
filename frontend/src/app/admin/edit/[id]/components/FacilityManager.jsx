'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useEditDepartment } from './EditDepartmentContext';
import ActivitiesTableBuilder from './builders/ActivitiesTableBuilder';

const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => <p>Loading Editor...</p>
});
import 'react-quill-new/dist/quill.snow.css';

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['link', 'image'],
    ['clean']
  ],
};

export default function FacilityManager() {
  const {
    id,
    dept,
    apiUrl,
    setView,
    fetchDeptDetails,
    activeSection,
    setActiveSection,
    setOriginalRawContent,
    originalRawContent,
    setActiveBuilderTab,
    setShowTemplateBuilder,
    parseHtmlTableToData,
    setActivityCustomTableData,
    activityCustomTableData,
    setActivityTableTitle,
    setIsActivitiesTableInserted,
    isActivitiesTableInserted,
    handleFinishActivitiesTable,
    showConfirm,
    setTableMode,
    activeCategory,
    handleSaveSection,
    activityGalleryEvents,
    setActivityGalleryEvents,
    fetchActivityGallery
  } = useEditDepartment();

  // Active sub-tab inside Facilities Manager ('cards', 'table', 'pdf', 'editor', or 'gallery')
  const [activeSubTab, setActiveSubTab] = useState('cards');

  const hasSyncedTabRef = React.useRef(false);

  useEffect(() => {
    if (hasSyncedTabRef.current) return;

    if (activeSection && activeSection.category === 'facilities') {
      if (activeSection.content) {
        if (activeSection.content.includes('<table')) {
          if (activeSubTab !== 'table') setActiveSubTab('table');
        } else if (activeSection.content.includes('.pdf') || activeSection.content.includes('href=')) {
          if (activeSubTab !== 'pdf') setActiveSubTab('pdf');
        } else if (activeSection.content === '[SPECIALIZED_FACILITIES]') {
          if (activeSubTab !== 'cards') setActiveSubTab('cards');
        } else if (activeSection.content === '[SPECIALIZED_FACILITIES_GALLERY]') {
          if (activeSubTab !== 'gallery') setActiveSubTab('gallery');
        } else {
          if (activeSubTab !== 'editor') setActiveSubTab('editor');
        }
      }
      hasSyncedTabRef.current = true;
    } else if (dept?.sections) {
      const sect = dept.sections.find(s => s.category === 'facilities');
      if (sect && sect.content) {
        if (sect.content.includes('<table')) {
          if (activeSubTab !== 'table') setActiveSubTab('table');
        } else if (sect.content.includes('.pdf') || sect.content.includes('href=')) {
          if (activeSubTab !== 'pdf') setActiveSubTab('pdf');
        } else if (sect.content === '[SPECIALIZED_FACILITIES]') {
          if (activeSubTab !== 'cards') setActiveSubTab('cards');
        } else if (sect.content === '[SPECIALIZED_FACILITIES_GALLERY]') {
          if (activeSubTab !== 'gallery') setActiveSubTab('gallery');
        } else {
          if (activeSubTab !== 'editor') setActiveSubTab('editor');
        }
      }
      hasSyncedTabRef.current = true;
    }
  }, [activeSection, dept, activeSubTab]);

  // Existing Facility Cards State
  const [form, setForm] = useState({
    title: '',
    image_url: '',
    link_url: '',
    order: 0
  });
  const [editingId, setEditingId] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [saving, setSaving] = useState(false);

  // Local state for PDF Link Button
  const [pdfLinkText, setPdfLinkText] = useState('');
  const [localPdfFile, setLocalPdfFile] = useState(null);
  const [existingPdfUrl, setExistingPdfUrl] = useState('');
  const [uploadingPdf, setUploadingPdf] = useState(false);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      setErrors({});
    }
  }, [activeSubTab, errors]);

  useEffect(() => {
    if (activeSubTab === 'gallery') {
      fetchActivityGallery();
    }
  }, [activeSubTab]);

  // Event Gallery Local States
  const [galleryView, setGalleryView] = useState('list'); // 'list' or 'editor'
  const [editingEventIndex, setEditingEventIndex] = useState(null);
  const [galleryEventForm, setGalleryEventForm] = useState({ title: '', category: 'Facilities', images: [] });

  const handleAddNewEventLocal = () => {
    setGalleryEventForm({
      title: '',
      category: 'Facilities',
      images: []
    });
    setEditingEventIndex(null);
    setGalleryView('editor');
  };

  const handleEditEventLocal = (evt, originalIndex) => {
    setGalleryEventForm({
      title: evt.title || '',
      category: 'Facilities',
      images: evt.images || []
    });
    setEditingEventIndex(originalIndex);
    setGalleryView('editor');
  };

  const handleDeleteEventLocal = async (originalIndex) => {
    const evt = activityGalleryEvents[originalIndex];
    const confirmed = await showConfirm({
      title: 'Delete Facility Gallery Item',
      message: 'Are you sure you want to delete this event gallery item from Facilities?',
      itemName: evt.title || `Gallery Item #${originalIndex + 1}`
    });
    if (!confirmed) return;

    const updatedEvents = activityGalleryEvents.filter((_, i) => i !== originalIndex);
    setSaving(true);
    try {
      const res = await fetch(`${apiUrl}/admin/activity-gallery/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: updatedEvents })
      });
      if (res.ok) {
        setActivityGalleryEvents(updatedEvents);
        alert('✓ Gallery item deleted successfully!');
      } else {
        alert('Failed to delete gallery item.');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting gallery item.');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadGalleryImages = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingFile(true);
    const uploadedUrls = [];
    for (const file of files) {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'gallery');
      try {
        const uploadRes = await fetch(`${apiUrl}/admin/activity-gallery/upload`, {
          method: 'POST',
          body: fd
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          uploadedUrls.push(uploadData.url);
        }
      } catch (err) {
        console.error('Error uploading gallery image:', err);
      }
    }
    setGalleryEventForm(prev => ({
      ...prev,
      images: [...(prev.images || []), ...uploadedUrls]
    }));
    setUploadingFile(false);
  };

  const handleRemoveUploadedImage = (imgIdx) => {
    setGalleryEventForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== imgIdx)
    }));
  };

  const handleSaveEventLocal = async () => {
    if (!galleryEventForm.title?.trim()) {
      alert('Please enter a title / heading.');
      return;
    }
    if (!galleryEventForm.images || galleryEventForm.images.length === 0) {
      alert('Please upload at least one photo.');
      return;
    }

    setSaving(true);
    let updatedEvents = [...activityGalleryEvents];
    const savedData = { ...galleryEventForm, title: galleryEventForm.title.trim(), category: 'Facilities' };

    if (editingEventIndex !== null) {
      updatedEvents[editingEventIndex] = savedData;
    } else {
      updatedEvents.push(savedData);
    }

    try {
      const res = await fetch(`${apiUrl}/admin/activity-gallery/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: updatedEvents })
      });
      if (res.ok) {
        setActivityGalleryEvents(updatedEvents);
        setGalleryView('list');
        setEditingEventIndex(null);
        setGalleryEventForm({ title: '', category: 'Facilities', images: [] });
        alert('✓ Event gallery item saved successfully!');
      } else {
        alert('Failed to save gallery item.');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving gallery item.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSpecializedGallerySection = async () => {
    try {
      setSaving(true);
      const res = await fetch(`${apiUrl}/admin/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dept_id: parseInt(id),
          title: 'Specialized Facilities Event Gallery',
          category: 'facilities',
          content: '[SPECIALIZED_FACILITIES_GALLERY]',
          order: 100
        })
      });
      if (res.ok) {
        alert('✓ Specialized Event Gallery Section added successfully! You can now reorder it under Content Sections list.');
        await fetchDeptDetails();
      } else {
        alert('Failed to add specialized section.');
      }
    } catch (err) {
      console.error(err);
      alert('Error adding specialized section.');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitCardLocal = (e) => {
    if (e) e.preventDefault();
    const newErrors = {};
    if (!form.title?.trim()) {
      newErrors.title = 'Facility Title is required';
    }
    if (!form.image_url?.trim()) {
      newErrors.image_url = 'Facility Photograph is required';
    }
    if (!form.link_url?.trim()) {
      newErrors.link_url = 'Redirection Link URL is required';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    handleSubmitCard(e);
  };

  const handleUploadFacilitiesPdfLocal = () => {
    const newErrors = {};
    if (!pdfLinkText?.trim()) {
      newErrors.pdfLinkText = 'Button Label Text is required';
    }
    if (!localPdfFile && !existingPdfUrl) {
      newErrors.localPdfFile = 'Please select a PDF file';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    handleUploadFacilitiesPdf();
  };

  // Sync active context variables when switching to the Table Builder tab
  useEffect(() => {
    if (activeSubTab === 'table') {
      setActiveBuilderTab('table');
      setShowTemplateBuilder(true);

      const isAlreadyTargeted = activeSection && activeSection.category === 'facilities';

      if (isAlreadyTargeted) {
        if (!activeSection.id) {
          // If it's a new section, initialize the states cleanly
          if (activityCustomTableData.headers.length === 0) {
            setActivityCustomTableData({
              headers: ['S.No', 'Date', 'Activity Title', 'Description', 'Details'],
              rows: []
            });
            setActivityTableTitle('');
            setIsActivitiesTableInserted(false);
            setTableMode('custom');
          }
        } else {
          // If it's an existing section and has a table, auto-parse it
          if (activeSection.content && activeSection.content.includes('<table') && activityCustomTableData.headers.length === 0) {
            const parsed = parseHtmlTableToData(activeSection.content);
            if (parsed) {
              setActivityCustomTableData(parsed);
              setActivityTableTitle(parsed.title || '');
              setIsActivitiesTableInserted(true);
              setShowTemplateBuilder(true);
              if (parsed.headers && parsed.headers[0]?.startsWith('Column 1')) {
                setTableMode('standard');
              } else {
                setTableMode('custom');
              }
            }
          }
        }
      } else {
        // Fallback: Find the corresponding section for facilities (or mock one if it doesn't exist)
        const sect = dept.sections?.find(s => s.category === 'facilities');
        if (sect) {
          setActiveSection(sect);
          setOriginalRawContent(sect.content);
          if (sect.content && sect.content.includes('<table')) {
            const parsed = parseHtmlTableToData(sect.content);
            if (parsed) {
              setActivityCustomTableData(parsed);
              setActivityTableTitle(parsed.title || '');
              setIsActivitiesTableInserted(true);
              setShowTemplateBuilder(true);
              if (parsed.headers && parsed.headers[0]?.startsWith('Column 1')) {
                setTableMode('standard');
              } else {
                setTableMode('custom');
              }
            }
          } else {
            setActivityCustomTableData({
              headers: ['S.No', 'Date', 'Activity Title', 'Description', 'Details'],
              rows: []
            });
            setActivityTableTitle('');
            setIsActivitiesTableInserted(false);
            setTableMode('custom');
          }
        } else {
          setActiveSection({ section_title: 'Facilities List', content: '', category: 'facilities' });
          setOriginalRawContent('');
          setActivityCustomTableData({
            headers: ['S.No', 'Date', 'Activity Title', 'Description', 'Details'],
            rows: []
          });
          setActivityTableTitle('');
          setIsActivitiesTableInserted(false);
          setTableMode('custom');
        }
      }
    }
  }, [activeSubTab, dept, activeSection]);

  // Sync and parse active section when switching to PDF Button tab
  useEffect(() => {
    if (activeSubTab === 'pdf') {
      const isAlreadyTargeted = activeSection && activeSection.category === 'facilities';

      let sect = null;
      if (isAlreadyTargeted) {
        sect = activeSection;
      } else {
        sect = dept.sections?.find(s => s.category === 'facilities');
        if (sect) {
          if (activeSection !== sect) setActiveSection(sect);
          if (originalRawContent !== sect.content) setOriginalRawContent(sect.content);
        } else {
          const newSect = { section_title: 'Facilities List', content: '', category: 'facilities' };
          if (activeSection?.section_title !== newSect.section_title || activeSection?.content !== newSect.content) {
            setActiveSection(newSect);
          }
          if (originalRawContent !== '') setOriginalRawContent('');
        }
      }

      if (sect) {
        // Parse existing PDF URL and button label text from section content
        if (sect.content) {
          const match = sect.content.match(/href="([^"]+\.pdf)"/i);
          const matchUrl = match ? match[1] : '';
          setExistingPdfUrl(matchUrl);

          const textMatch = sect.content.match(/<\/svg>\s*([^<]+)\s*<\/a>/i);
          const matchText = textMatch ? textMatch[1].trim() : '';
          setPdfLinkText(matchText);
        } else {
          setExistingPdfUrl('');
          setPdfLinkText('');
        }
      } else {
        setExistingPdfUrl('');
        setPdfLinkText('');
      }
    }
  }, [activeSubTab, dept, activeSection, originalRawContent, setActiveSection, setOriginalRawContent]);

  // Helper to format image URLs
  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const base = apiUrl.replace('/api', '');
    return url.startsWith('/api/') ? `${base}${url}` : `${base}/api/uploads/facilities/${url.replace(/^\/+/, '')}`;
  };

  // Image Upload handler
  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingFile(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'facilities');

    try {
      const res = await fetch(`${apiUrl}/admin/upload?folder=facilities`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setForm(prev => ({ ...prev, image_url: data.url }));
      } else {
        const errData = await res.json();
        alert('Image upload failed: ' + (errData.detail || 'Please try again.'));
      }
    } catch (err) {
      console.error('Image upload error:', err);
      alert('Error uploading image file.');
    } finally {
      setUploadingFile(false);
      e.target.value = '';
    }
  };

  // Submit Facility Card
  const handleSubmitCard = async (e) => {
    if (e) e.preventDefault();

    if (!form.title?.trim() || !form.image_url?.trim() || !form.link_url?.trim()) {
      alert("Please fill in all the required input fields before submitting.");
      return;
    }

    setSaving(true);
    try {
      let res;
      if (editingId) {
        // Update Facility
        res = await fetch(`${apiUrl}/admin/facilities/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: form.title.trim(),
            image_url: form.image_url,
            link_url: form.link_url.trim(),
            order: form.order
          })
        });
      } else {
        // Add Facility
        const nextOrder = dept.facilities && dept.facilities.length > 0
          ? Math.max(...dept.facilities.map(f => f.order_index || 0)) + 1
          : 0;

        res = await fetch(`${apiUrl}/admin/facilities`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dept_id: parseInt(id),
            title: form.title.trim(),
            image_url: form.image_url,
            link_url: form.link_url.trim(),
            order: nextOrder
          })
        });
      }

      if (res.ok) {
        setForm({ title: '', image_url: '', link_url: '', order: 0 });
        setEditingId(null);
        await fetchDeptDetails();
      } else {
        alert('Failed to save facility.');
      }
    } catch (err) {
      console.error('Error saving facility:', err);
      alert('An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  // Edit facility button clicked
  const handleEditCard = (facility) => {
    setEditingId(facility.id);
    setForm({
      title: facility.title,
      image_url: facility.image_url || '',
      link_url: facility.link_url || '',
      order: facility.order_index || 0
    });
  };

  // Delete facility handler
  const handleDeleteCard = async (facilityId) => {
    const card = dept.facilities?.find(f => f.id === facilityId);
    const confirmed = await showConfirm({
      title: 'Delete Facility Card',
      message: 'Are you sure you want to delete this facility card?',
      itemName: card?.title || ''
    });
    if (!confirmed) return;

    try {
      const res = await fetch(`${apiUrl}/admin/remove-facility/${facilityId}`, {
        method: 'POST'
      });

      if (res.ok) {
        if (editingId === facilityId) {
          setForm({ title: '', image_url: '', link_url: '', order: 0 });
          setEditingId(null);
        }
        await fetchDeptDetails();
      } else {
        alert('Failed to delete facility card.');
      }
    } catch (err) {
      console.error('Error deleting facility:', err);
      alert('Error deleting facility.');
    }
  };

  // Swap / Move handler for cards
  const handleMoveCard = async (idx, direction) => {
    const list = [...(dept.facilities || [])];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;

    if (targetIdx < 0 || targetIdx >= list.length) return;

    const currentItem = list[idx];
    const swapItem = list[targetIdx];

    const currentOrder = currentItem.order_index || 0;
    const swapOrder = swapItem.order_index || 0;

    const newCurrentOrder = currentOrder === swapOrder ? swapOrder - 1 : swapOrder;
    const newSwapOrder = currentOrder;

    try {
      setSaving(true);
      const update1 = await fetch(`${apiUrl}/admin/facilities/${currentItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: newCurrentOrder })
      });

      const update2 = await fetch(`${apiUrl}/admin/facilities/${swapItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: newSwapOrder })
      });

      if (update1.ok && update2.ok) {
        await fetchDeptDetails();
      } else {
        alert('Failed to reorder facilities.');
      }
    } catch (err) {
      console.error('Error moving facility card:', err);
      alert('Error changing display order.');
    } finally {
      setSaving(false);
    }
  };

  // PDF Link Creator Handler
  const handleUploadFacilitiesPdf = async () => {
    if (!pdfLinkText.trim() || !localPdfFile) {
      alert("Please enter the link text and select a PDF file.");
      return;
    }

    setUploadingPdf(true);
    const formData = new FormData();
    formData.append('file', localPdfFile);
    formData.append('folder', 'activities');

    try {
      const res = await fetch(`${apiUrl}/admin/upload?folder=facilities`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        const base = apiUrl.replace('/api', '');
        const fullUrl = `${base}${data.url}`;

        // Construct beautiful university button HTML
        const linkBtnHtml = `
<div style="margin-bottom: 8px; display: flex; align-items: center; justify-content: flex-start;">
  <a href="${fullUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 6px; background-color: #990033; color: white; padding: 6px 12px; border-radius: 8px; font-weight: bold; text-decoration: none; font-family: 'CMU Sans Serif Demi borderless', sans-serif; font-size: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: all 0.2s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 12px rgba(0,0,0,0.15)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px rgba(0,0,0,0.1)';">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
    ${pdfLinkText.trim().toUpperCase()}
  </a>
</div>
        `.trim();

        // Clear previous PDF button if exists, keeping table/other content intact
        let cleanContent = activeSection.content || '';
        cleanContent = cleanContent.replace(/<div[^>]*>[\s\S]*?<svg[\s\S]*?<\/svg>[\s\S]*?<\/div>/i, '');
        const finalContent = linkBtnHtml + "\n" + cleanContent.trim();

        // Save immediately
        const method = activeSection.id ? 'PUT' : 'POST';
        const endpoint = activeSection.id ? `${apiUrl}/admin/sections/${activeSection.id}` : `${apiUrl}/admin/sections`;

        const saveRes = await fetch(endpoint, {
          method: method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dept_id: parseInt(id),
            title: activeSection.section_title || 'Facilities List',
            category: 'facilities',
            content: finalContent
          })
        });

        if (saveRes.ok) {
          setExistingPdfUrl(fullUrl);
          setLocalPdfFile(null);
          alert('✓ Facilities PDF successfully uploaded and button linked!');
          await fetchDeptDetails();
        } else {
          alert('Failed to save PDF button to department section.');
        }
      } else {
        const errData = await res.json();
        alert('Failed to upload PDF file: ' + (errData.detail || 'Upload failed'));
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading or saving file.');
    } finally {
      setUploadingPdf(false);
    }
  };

  // PDF Link Remover Handler
  const handleRemoveFacilitiesPdf = async () => {
    const confirmed = await showConfirm({
      title: 'Remove PDF Link Button',
      message: 'Are you sure you want to remove this PDF Link Button?',
      itemName: 'PDF Button Link'
    });
    if (!confirmed) return;

    let cleanContent = activeSection.content || '';
    cleanContent = cleanContent.replace(/<div[^>]*>[\s\S]*?<svg[\s\S]*?<\/svg>[\s\S]*?<\/div>/i, '');

    const method = activeSection.id ? 'PUT' : 'POST';
    const endpoint = activeSection.id ? `${apiUrl}/admin/sections/${activeSection.id}` : `${apiUrl}/admin/sections`;

    try {
      const saveRes = await fetch(endpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dept_id: parseInt(id),
          title: activeSection.section_title || 'Facilities List',
          category: 'facilities',
          content: cleanContent.trim()
        })
      });

      if (saveRes.ok) {
        setExistingPdfUrl('');
        setLocalPdfFile(null);
        setPdfLinkText('');
        alert('✓ PDF link button removed successfully!');
        await fetchDeptDetails();
      } else {
        alert('Failed to remove PDF link button from database.');
      }
    } catch (err) {
      console.error(err);
      alert('Error removing PDF link.');
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
      {/* Header Panel */}
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 m-0">🏢 Facilities & Equipments Manager</h2>
          <p className="text-xs text-slate-400 mt-1 font-bold uppercase tracking-wider">
            Manage facility grid cards, visual spreadsheet tables, and custom PDF button links.
          </p>
        </div>
        <button
          onClick={() => {
            setView('dashboard');
          }}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2.5 rounded-xl font-bold transition cursor-pointer border-none shadow-sm flex items-center gap-1.5"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Tab Switcher Headers */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl max-w-4xl shadow-inner gap-1 flex-wrap">
        <button
          onClick={() => setActiveSubTab('cards')}
          className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-sm border-none cursor-pointer transition-all duration-300 ${activeSubTab === 'cards'
              ? 'bg-white text-indigo-600 shadow-md scale-[1.02]'
              : 'text-slate-500 hover:text-slate-700 hover:bg-white/40'
            }`}
        >
          🖼️ Facility Grid Cards
        </button>
        <button
          onClick={() => setActiveSubTab('table')}
          className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-sm border-none cursor-pointer transition-all duration-300 ${activeSubTab === 'table'
              ? 'bg-white text-indigo-600 shadow-md scale-[1.02]'
              : 'text-slate-500 hover:text-slate-700 hover:bg-white/40'
            }`}
        >
          📊 Dynamic Table Builder
        </button>
        <button
          onClick={() => setActiveSubTab('pdf')}
          className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-sm border-none cursor-pointer transition-all duration-300 ${activeSubTab === 'pdf'
              ? 'bg-white text-indigo-600 shadow-md scale-[1.02]'
              : 'text-slate-500 hover:text-slate-700 hover:bg-white/40'
            }`}
        >
          📁 Text Input / Upload PDF File
        </button>
        <button
          onClick={() => setActiveSubTab('editor')}
          className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-sm border-none cursor-pointer transition-all duration-300 ${activeSubTab === 'editor'
              ? 'bg-white text-indigo-600 shadow-md scale-[1.02]'
              : 'text-slate-500 hover:text-slate-700 hover:bg-white/40'
            }`}
        >
          📝 Standard Rich Text Editor
        </button>
        <button
          onClick={() => setActiveSubTab('gallery')}
          className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-sm border-none cursor-pointer transition-all duration-300 ${activeSubTab === 'gallery'
              ? 'bg-white text-indigo-600 shadow-md scale-[1.02]'
              : 'text-slate-500 hover:text-slate-700 hover:bg-white/40'
            }`}
        >
          🖼️ Event Gallery
        </button>
      </div>

      {/* ───────────────── SUB-TAB 1: FACILITY CARDS GRID ───────────────── */}
      {activeSubTab === 'cards' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start animate-in fade-in duration-300">
          {/* Left Form Panel */}
          <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-5 sticky top-6">
            <h3 className="text-base font-black text-slate-800 m-0 border-b border-slate-100 pb-3 flex items-center gap-2">
              {editingId ? '✏️ Edit Department Facility' : '➕ Add New Facility'}
            </h3>

            {/* Facility Title */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                Facility Title *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Computer Science Laboratory I"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none font-sans text-sm transition-all ${errors.title ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 bg-red-50/5' : 'border-slate-200 focus:border-indigo-500 bg-white'}`}
              />
              {errors.title && (
                <div className="flex items-center gap-1.5 mt-1.5 text-red-655 bg-red-50/50 px-3 py-1.5 rounded-xl border border-red-100/50 w-fit animate-in fade-in slide-in-from-top-1 duration-200">
                  <span className="text-xs">⚠️</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider">{errors.title}</span>
                </div>
              )}
              <p className="text-[10px] text-slate-400 mt-1.5 font-medium leading-normal">
                This text will display in bold **above** the facility image on the university page.
              </p>
            </div>

            {/* Facility Click Redirection Link */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                Redirection Link URL (Optional)
              </label>
              <input
                type="text"
                value={form.link_url}
                onChange={(e) => setForm(prev => ({ ...prev, link_url: e.target.value }))}
                placeholder="e.g. https://www.periyaruniversity.ac.in/cs-lab-info.html"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none font-sans text-sm transition-all ${errors.link_url ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 bg-red-50/5' : 'border-slate-200 focus:border-indigo-500 bg-white'}`}
              />
              {errors.link_url && (
                <div className="flex items-center gap-1.5 mt-1.5 text-red-655 bg-red-50/50 px-3 py-1.5 rounded-xl border border-red-100/50 w-fit animate-in fade-in slide-in-from-top-1 duration-200">
                  <span className="text-xs">⚠️</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider">{errors.link_url}</span>
                </div>
              )}
              <p className="text-[10px] text-slate-400 mt-1.5 font-medium leading-normal">
                If added, clicking the facility card or image will open this URL in a new tab.
              </p>
            </div>

            {/* Facility Photo Upload */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                Facility Photograph
              </label>
              <div className={`relative border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition group ${errors.image_url ? 'border-red-400 bg-red-50/5 hover:border-red-500' : 'border-slate-200 hover:border-indigo-400 bg-slate-50/50'}`}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadImage}
                  disabled={uploadingFile}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {form.image_url ? (
                  <div className="space-y-2">
                    <img
                      src={getImageUrl(form.image_url)}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded-xl mx-auto border border-slate-100 shadow-sm"
                    />
                    <p className="text-xs text-indigo-600 font-bold group-hover:underline">Click to change picture</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-1.5 py-4">
                    <span className="text-4xl">{uploadingFile ? '⏳' : '🏢'}</span>
                    <span className="font-extrabold text-sm text-slate-600">
                      {uploadingFile ? 'Uploading photo...' : 'Click to Upload Image'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">JPEG, PNG, WebP — Max size 10MB</span>
                  </div>
                )}
              </div>
              {errors.image_url && (
                <div className="flex items-center gap-1.5 mt-1.5 text-red-655 bg-red-50/50 px-3 py-1.5 rounded-xl border border-red-100/50 w-fit animate-in fade-in slide-in-from-top-1 duration-200">
                  <span className="text-xs">⚠️</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider">{errors.image_url}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSubmitCardLocal}
                disabled={saving || uploadingFile}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white py-3.5 rounded-xl font-bold transition cursor-pointer border-none shadow-md"
              >
                {saving ? 'Saving...' : editingId ? 'Update Facility' : 'Add Facility'}
              </button>
              {editingId && (
                <button
                  onClick={() => {
                    setEditingId(null);
                    setForm({ title: '', image_url: '', link_url: '', order: 0 });
                  }}
                  className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition cursor-pointer border-none"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Right List Panel */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-base font-black text-slate-700 m-0 flex items-center justify-between pb-1">
              <span>List of Department Facilities</span>
              <span className="text-xs font-extrabold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                {(dept.facilities || []).length} Total
              </span>
            </h3>

            {(!dept.facilities || dept.facilities.length === 0) ? (
              <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-sm">
                <span className="text-5xl block mb-4">🏢</span>
                <p className="text-slate-400 font-black text-base m-0">No facilities listed yet.</p>
                <p className="text-slate-400 text-xs mt-1.5 max-w-[280px] mx-auto leading-relaxed">
                  Add laboratories, computer hubs, or departmental assets using the left editor panel.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {dept.facilities.map((fac, idx) => {
                  const previewSrc = fac.image_url ? getImageUrl(fac.image_url) : '';

                  return (
                    <div
                      key={fac.id || idx}
                      className={`bg-white rounded-2xl border p-4 flex items-center gap-4 transition-all duration-200 ${editingId === fac.id
                          ? 'border-indigo-400 ring-4 ring-indigo-50 shadow-md'
                          : 'border-slate-100 hover:border-slate-200 hover:shadow-md'
                        }`}
                    >
                      {/* Thumbnail */}
                      <div className="w-24 h-18 rounded-xl overflow-hidden bg-slate-50 border border-slate-150 flex-shrink-0 flex items-center justify-center relative">
                        {previewSrc ? (
                          <img
                            src={previewSrc}
                            alt={fac.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-3xl text-slate-300">🏢</span>
                        )}
                      </div>

                      {/* Meta Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-bold text-slate-800 leading-snug m-0 line-clamp-2">
                          {fac.title}
                        </p>
                        {fac.link_url && (
                          <a
                            href={fac.link_url.startsWith('http') ? fac.link_url : `https://${fac.link_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-indigo-600 hover:underline font-extrabold flex items-center gap-1 mt-1.5 break-all"
                          >
                            🔗 {fac.link_url}
                          </a>
                        )}
                      </div>

                      {/* Action Controls */}
                      <div className="flex gap-2 flex-shrink-0 ml-auto">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handleMoveCard(idx, 'up')}
                            disabled={idx === 0 || saving}
                            className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60 disabled:opacity-30 rounded-lg cursor-pointer text-xs"
                            title="Move Up"
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => handleMoveCard(idx, 'down')}
                            disabled={idx === dept.facilities.length - 1 || saving}
                            className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60 disabled:opacity-30 rounded-lg cursor-pointer text-xs"
                            title="Move Down"
                          >
                            ▼
                          </button>
                        </div>

                        <button
                          onClick={() => handleEditCard(fac)}
                          disabled={saving}
                          className="bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white px-3.5 rounded-xl font-bold transition border-none cursor-pointer text-xs shadow-sm flex items-center justify-center self-stretch"
                          title="Edit Facility Card"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteCard(fac.id)}
                          disabled={saving}
                          className="bg-red-50 hover:bg-red-600 text-red-600 hover:text-white px-3.5 rounded-xl font-bold transition border-none cursor-pointer text-xs shadow-sm flex items-center justify-center self-stretch"
                          title="Delete Card"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ───────────────── SUB-TAB 2: EXISTING PROJECT TABLE BUILDER ───────────────── */}
      {activeSubTab === 'table' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Existing Table HTML Parser Banner */}
          {originalRawContent && originalRawContent.includes('<table') && !isActivitiesTableInserted && (
            <div className="p-5 bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-2xl border border-amber-250/30 flex justify-between items-center flex-wrap gap-4 shadow-sm animate-in slide-in-from-top-4 duration-300">
              <div className="flex items-center gap-3">
                <span className="text-2xl filter drop-shadow">📊</span>
                <div>
                  <span className="text-sm font-bold text-amber-900 block">Existing Table Detected in this Section!</span>
                  <span className="text-xs text-amber-700/90 block mt-0.5">Would you like to import this table back into the interactive Visual Spreadsheet Editor?</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const parsed = parseHtmlTableToData(originalRawContent);
                  if (parsed) {
                    setActivityCustomTableData(parsed);
                    setActivityTableTitle(parsed.title || '');
                    setIsActivitiesTableInserted(true);
                    setShowTemplateBuilder(true);
                    setActiveBuilderTab('table');
                    if (parsed.headers && parsed.headers[0]?.startsWith('Column 1')) {
                      setTableMode('standard');
                    } else {
                      setTableMode('custom');
                    }
                    alert("✓ Successfully loaded the table back into the visual Spreadsheet Editor!");
                  } else {
                    alert("Could not parse table structure. You can set it up from scratch.");
                  }
                }}
                className="px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold border-none cursor-pointer shadow-md transition"
              >
                ✏️ Edit Table in Spreadsheet
              </button>
            </div>
          )}

          {/* Table Spreadsheet Row View */}
          {isActivitiesTableInserted ? (
            <div className="bg-white rounded-3xl border border-slate-150 p-6 md:p-8 space-y-6 shadow-sm">
              <div className="flex justify-between items-center pb-3 border-b border-gray-150 flex-wrap gap-4">
                <div>
                  <h3 className="text-base font-black text-slate-800 m-0">📝 Interactive Spreadsheet Editor</h3>
                  <p className="text-[11px] text-slate-400 mt-1">Directly fill out dynamic cell contents, add/delete rows, and publish to the public site.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActivityCustomTableData(prev => ({
                        ...prev,
                        rows: [...prev.rows, Array(prev.headers.length).fill('')]
                      }));
                    }}
                    className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold border-none cursor-pointer shadow-sm transition flex items-center gap-1.5"
                  >
                    ➕ Add New Row
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsActivitiesTableInserted(false);
                    }}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border-none cursor-pointer shadow-sm transition"
                  >
                    Modify Columns
                  </button>
                  <button
                    type="button"
                    onClick={handleFinishActivitiesTable}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold border-none cursor-pointer shadow-sm transition flex items-center gap-1.5"
                  >
                    💾 Save & Publish Table
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto border border-gray-200 rounded-xl bg-gray-50 p-2">
                <ActivitiesTableBuilder spreadsheetViewOnly={true} />
              </div>
            </div>
          ) : (
            /* Columns setup view */
            <div className="bg-white rounded-3xl border border-slate-150 p-6 md:p-8 shadow-sm">
              <ActivitiesTableBuilder spreadsheetViewOnly={false} />
            </div>
          )}
        </div>
      )}

      {/* ───────────────── SUB-TAB 3: EXISTING PDF LINK BUILDER ───────────────── */}
      {activeSubTab === 'pdf' && (
        <div className="bg-white rounded-3xl border border-slate-150 p-6 md:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
          <div className="bg-gradient-to-r from-teal-50 to-emerald-50/50 p-6 rounded-2xl border-2 border-teal-100 shadow-sm space-y-4">
            <div>
              <span className="text-sm font-black text-teal-900 block flex items-center gap-2">
                📁 Text Input / Upload PDF File
              </span>
              <p className="text-xs text-teal-700/80 mt-1">
                Provide a custom download button text label (e.g., &quot;LABORATORY SYLLABUS & DIRECTORY&quot;) and select a PDF file. This automatically registers and links a beautiful interactive download button into the Facilities section!
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-teal-800 uppercase mb-1.5 tracking-wider">
                  Button Label Text
                </label>
                <input
                  type="text"
                  placeholder="e.g. INFRASTRUCTURE & FACILITIES DETAILS"
                  value={pdfLinkText}
                  onChange={(e) => setPdfLinkText(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none font-sans text-sm font-extrabold uppercase animate-none transition-all ${errors.pdfLinkText ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 bg-red-50/5' : 'border-slate-200 focus:border-teal-400 bg-white'}`}
                />
                {errors.pdfLinkText && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-red-655 bg-red-50/50 px-3 py-1.5 rounded-xl border border-red-100/50 w-fit animate-in fade-in slide-in-from-top-1 duration-200">
                    <span className="text-xs">⚠️</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">{errors.pdfLinkText}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-4 items-end flex-wrap pt-2">
                <div className="flex-1 min-w-[240px]">
                  <label className="block text-xs font-bold text-teal-800 uppercase mb-1.5 tracking-wider">
                    Select PDF File
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setLocalPdfFile(e.target.files[0])}
                    className={`p-2 border rounded-xl bg-white w-full cursor-pointer text-xs transition-all ${errors.localPdfFile ? 'border-red-400 focus:border-red-500 bg-red-50/5' : 'border-slate-200'}`}
                  />
                  {errors.localPdfFile && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-red-655 bg-red-50/50 px-3 py-1.5 rounded-xl border border-red-100/50 w-fit animate-in fade-in slide-in-from-top-1 duration-200">
                      <span className="text-xs">⚠️</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider">{errors.localPdfFile}</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleUploadFacilitiesPdfLocal}
                  disabled={uploadingPdf}
                  className="px-6 py-3.5 bg-[#990033] hover:bg-[#80002a] disabled:bg-slate-300 text-white rounded-xl text-xs font-extrabold border-none cursor-pointer shadow-md transition whitespace-nowrap"
                >
                  {uploadingPdf ? 'Uploading...' : 'Upload & Link PDF'}
                </button>
              </div>
            </div>

            {/* Display Active Linked PDF */}
            {existingPdfUrl && (
              <div className="flex items-center gap-2 bg-green-50 text-green-800 p-4 rounded-xl border border-green-150 text-xs font-bold mt-4 shadow-inner">
                <span>✓ Active Facilities PDF Linked:</span>
                <a
                  href={existingPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-green-950 break-all"
                >
                  {existingPdfUrl.split('/').pop()}
                </a>
                <button
                  type="button"
                  onClick={handleRemoveFacilitiesPdf}
                  className="ml-auto text-red-650 hover:text-red-800 font-extrabold border-none bg-transparent cursor-pointer"
                >
                  Remove Link
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ───────────────── SUB-TAB 4: STANDARD RICH TEXT EDITOR ───────────────── */}
      {activeSubTab === 'editor' && (
        <div className="bg-white rounded-3xl border border-slate-150 p-6 md:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
          <div className="flex justify-between items-center pb-3 border-b border-gray-150 flex-wrap gap-4">
            <div>
              <h3 className="text-base font-black text-slate-800 m-0">📝 Standard Rich Text Editor</h3>
              <p className="text-[11px] text-slate-400 mt-1">Directly write, style, and format facilities description paragraphs, objectives, or list details.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveSection}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold border-none cursor-pointer shadow-md transition whitespace-nowrap"
              >
                {activeSection?.id ? '💾 Save Changes & Finish' : '➕ Create Section & Finish'}
              </button>
            </div>
          </div>

          <div className="flex-1 mb-6">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
              Section Title (e.g., FACILITIES INFO, VISION, etc.) *
            </label>
            <input
              type="text"
              value={activeSection?.section_title ?? ''}
              onChange={(e) => setActiveSection(prev => ({ ...(prev || {}), section_title: e.target.value }))}
              className="w-full px-4 py-3 border border-slate-200 focus:border-indigo-500 bg-white rounded-xl focus:outline-none font-sans text-sm transition-all font-bold text-lg"
              placeholder="Enter Title..."
            />
          </div>

          <div className="min-h-[400px]">
            <style dangerouslySetInnerHTML={{
              __html: `
              .ql-editor table {
                width: 100% !important;
                border-collapse: collapse !important;
                margin: 20px 0 !important;
              }
              .ql-editor table th {
                background-color: #f8f9fa !important;
                color: #333 !important;
                font-weight: bold !important;
                border: 1px solid #dee2e6 !important;
                padding: 12px 10px !important;
                font-size: 13px !important;
                text-transform: uppercase !important;
              }
              .ql-editor table td {
                border: 1px solid #dee2e6 !important;
                padding: 10px !important;
                font-size: 13px !important;
                color: #444 !important;
                vertical-align: top !important;
              }
            ` }} />
            <ReactQuill
              theme="snow"
              modules={modules}
              value={activeSection?.content ?? ''}
              onChange={(val) => setActiveSection({ ...activeSection, content: val })}
              className="h-[350px] font-sans"
            />
          </div>

          <div className="flex gap-4 pt-8 justify-end">
            <button
              onClick={handleSaveSection}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition cursor-pointer border-none shadow-md font-sans text-xs uppercase tracking-wider"
            >
              {activeSection?.id ? 'Save Changes & Finish' : 'Create Section & Finish'}
            </button>
            <button
              onClick={() => {
                setView('category');
              }}
              className="bg-white hover:bg-gray-100 text-slate-600 border border-slate-200 px-6 py-3 rounded-xl font-bold transition cursor-pointer font-sans text-xs uppercase tracking-wider shadow-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ───────────────── SUB-TAB 5: FACILITIES EVENT GALLERY ───────────────── */}
      {activeSubTab === 'gallery' && (
        <div className="space-y-6 animate-in fade-in duration-300 font-sans">
          {/* Header & Section Creator Info Card */}
          <div className="bg-gradient-to-r from-indigo-50/60 to-purple-50/50 p-6 rounded-3xl border border-indigo-100 shadow-sm flex flex-wrap justify-between items-center gap-4">
            <div className="max-w-2xl">
              <span className="text-sm font-black text-indigo-950 block flex items-center gap-2">
                🖼️ Facilities Event Gallery & Media Photos
              </span>
              <p className="text-xs text-indigo-850 mt-1.5 leading-relaxed">
                Add and manage named visual photo albums for academic laboratories, workshop inaugurals, or departmental facility assets.
                These will render as clean, modern image grids under your Facilities tab!
              </p>
            </div>

            {/* Self-service Enable Layout Ordering Section */}
            {!dept.sections?.some(s => s.category === 'facilities' && s.content === '[SPECIALIZED_FACILITIES_GALLERY]') ? (
              <button
                type="button"
                onClick={handleAddSpecializedGallerySection}
                disabled={saving}
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold border-none cursor-pointer transition shadow-md hover:scale-[1.02]"
              >
                ➕ Enable Drag & Drop Ordering
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-white/80 border border-emerald-100 px-4 py-2.5 rounded-xl text-[11px] font-extrabold text-emerald-700 shadow-inner">
                <span>✓ Reorderable Section Enabled</span>
              </div>
            )}
          </div>

          {galleryView === 'list' ? (
            /* LIST VIEW */
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-black text-slate-700 m-0">Event Photo Albums</h3>
                <button
                  onClick={handleAddNewEventLocal}
                  className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-green-700 transition cursor-pointer border-none shadow-md flex items-center gap-1.5 text-xs"
                >
                  ➕ Add New Event Gallery
                </button>
              </div>

              {activityGalleryEvents.filter(evt => evt.category === 'Facilities').length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 p-8 shadow-sm">
                  <span className="text-5xl block mb-3">🖼️</span>
                  <p className="text-slate-400 font-black text-base m-0">No facility event galleries created yet.</p>
                  <p className="text-slate-450 text-xs mt-1.5 max-w-[340px] mx-auto leading-relaxed">
                    Click &quot;Add New Event Gallery&quot; to upload photographs of lab setups, equipment training sessions, or infrastructure openings.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activityGalleryEvents
                    .map((evt, idx) => ({ evt, originalIndex: idx }))
                    .filter(item => item.evt.category === 'Facilities')
                    .map(({ evt, originalIndex }, idx) => (
                      <div key={originalIndex} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition duration-300 flex flex-col justify-between">
                        {/* Cover Image Header */}
                        <div className="relative h-44 bg-slate-50 border-b border-slate-100 overflow-hidden flex items-center justify-center">
                          {evt.images && evt.images.length > 0 ? (
                            <img
                              src={evt.images[0].startsWith('http') ? evt.images[0] : `${apiUrl.replace('/api', '')}${evt.images[0]}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-550 ease-out"
                              alt=""
                            />
                          ) : (
                            <span className="text-5xl">🖼️</span>
                          )}
                          <div className="absolute top-3 right-3 bg-black/50 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-sm">
                            {evt.images ? evt.images.length : 0} Photos
                          </div>
                        </div>

                        {/* Event details and action footer */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div>
                            <h4 className="m-0 text-sm font-black text-slate-800 line-clamp-2 leading-snug">{evt.title || 'Untitled Album'}</h4>
                            <span className="inline-block mt-2.5 bg-indigo-50 text-indigo-650 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                              Facilities
                            </span>
                          </div>

                          <div className="flex gap-2.5 pt-2 border-t border-slate-50">
                            <button
                              onClick={() => handleEditEventLocal(evt, originalIndex)}
                              className="flex-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white py-2 rounded-xl font-bold text-xs border-none cursor-pointer transition text-center shadow-sm"
                            >
                              ✏️ Edit Album
                            </button>
                            <button
                              onClick={() => handleDeleteEventLocal(originalIndex)}
                              className="bg-red-50 text-red-600 hover:bg-red-650 hover:text-white px-4 py-2 rounded-xl font-bold text-xs border-none cursor-pointer transition shadow-sm"
                              title="Delete Album"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ) : (
            /* EDITOR VIEW */
            <div className="bg-white rounded-3xl border border-slate-150 p-6 md:p-8 space-y-6 shadow-sm">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 flex-wrap gap-4">
                <button
                  onClick={() => setGalleryView('list')}
                  className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 font-bold border-none bg-transparent cursor-pointer text-xs uppercase tracking-wider"
                >
                  ← Back to Albums
                </button>
                <h3 className="text-base font-black text-slate-800 m-0">
                  {editingEventIndex !== null ? '✏️ Edit Event Album' : '➕ Create New Event Album'}
                </h3>
              </div>

              {/* Event Title */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Album Title / Event Name *</label>
                <input
                  type="text"
                  value={galleryEventForm.title}
                  onChange={(e) => setGalleryEventForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-sm font-bold bg-white"
                  placeholder="e.g. Workshop on Embedded IoT Systems (Lab II) - March 2026"
                />
              </div>

              {/* Multi Image Upload block */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Upload Event Photographs *</label>
                <div className="relative border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/50 rounded-2xl p-6 text-center cursor-pointer transition group flex flex-col items-center justify-center">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleUploadGalleryImages}
                    disabled={uploadingFile}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <span className="text-4xl mb-2">{uploadingFile ? '⏳' : '📸'}</span>
                  <span className="font-extrabold text-sm text-slate-600">
                    {uploadingFile ? 'Uploading photographs...' : 'Click to Upload Multiple Images'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">JPEG, PNG, WebP — Select one or more files</span>
                </div>
              </div>

              {/* Uploaded Images Preview Grid */}
              {galleryEventForm.images && galleryEventForm.images.length > 0 && (
                <div className="space-y-3">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider">
                    Uploaded Photos ({galleryEventForm.images.length})
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {galleryEventForm.images.map((imgUrl, imgIdx) => {
                      const base = apiUrl.replace('/api', '');
                      const fullImgUrl = imgUrl.startsWith('/api/') ? `${base}${imgUrl}` : imgUrl;
                      return (
                        <div key={imgIdx} className="relative aspect-video rounded-xl border border-slate-150 bg-white overflow-hidden group shadow-sm">
                          <img src={fullImgUrl} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveUploadedImage(imgIdx)}
                            className="absolute top-2 right-2 bg-red-650 hover:bg-red-700 text-white font-bold text-xs w-6 h-6 rounded-full flex items-center justify-center border-none cursor-pointer shadow-md"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-slate-100 justify-end">
                <button
                  onClick={handleSaveEventLocal}
                  disabled={saving || uploadingFile}
                  className="bg-indigo-650 hover:bg-indigo-750 text-white px-8 py-3 rounded-xl font-bold transition cursor-pointer border-none shadow-md text-xs uppercase tracking-wider disabled:bg-indigo-300"
                >
                  {saving ? 'Saving...' : editingEventIndex !== null ? 'Save Album & Finish' : 'Create Album & Finish'}
                </button>
                <button
                  onClick={() => setGalleryView('list')}
                  className="bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 px-6 py-3 rounded-xl font-bold transition cursor-pointer text-xs uppercase tracking-wider shadow-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
