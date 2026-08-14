'use client';

import React, { useEffect, useState, useRef } from 'react';

// ── Canvas renderer — fills container exactly, DPR-aware for crisp text ──────
const PdfPageCanvas = ({ pdfDoc, pageNum, containerWidth, containerHeight }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!pdfDoc || !pageNum || !containerWidth || !containerHeight) return;
    let cancelled = false;

    const render = async () => {
      try {
        const page = await pdfDoc.getPage(pageNum);
        if (cancelled) return;

        const nat    = page.getViewport({ scale: 1 });
        const scaleW = containerWidth  / nat.width;
        const scaleH = containerHeight / nat.height;
        const scale  = Math.min(scaleW, scaleH);
        const vp     = page.getViewport({ scale });

        const canvas = canvasRef.current;
        if (!canvas) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width        = Math.floor(vp.width  * dpr);
        canvas.height       = Math.floor(vp.height * dpr);
        canvas.style.width  = `${Math.floor(vp.width)}px`;
        canvas.style.height = `${Math.floor(vp.height)}px`;

        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        await page.render({ canvasContext: ctx, viewport: vp }).promise;
      } catch (e) {
        console.error('PDF page render error:', e);
      }
    };

    render();
    return () => { cancelled = true; };
  }, [pdfDoc, pageNum, containerWidth, containerHeight]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-white overflow-hidden">
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  );
};

// ── Main modal ────────────────────────────────────────────────────────────────
export default function FlipbookModal({ fileUrl, title, onClose }) {
  const [libLoaded,    setLibLoaded]    = useState(false);
  const [pdfDoc,       setPdfDoc]       = useState(null);
  const [numPages,     setNumPages]     = useState(0);
  const [currentPage,  setCurrentPage]  = useState(1);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [isFlipping,   setIsFlipping]   = useState(false);
  const [flipDir,      setFlipDir]      = useState('next');
  const [targetPage,   setTargetPage]   = useState(null); // page being revealed

  // ── Single-page sizing: full modal width, max height ─────────────────────
  const [bookH, setBookH] = useState(720);
  const [pageW, setPageW] = useState(640);

  useEffect(() => {
    const calc = () => {
      // compact header+footer ≈ 100px; leave 8px top+bottom padding
      const h = Math.min(Math.floor((window.innerHeight - 116) * 0.995), 980);
      // single page fills full width minus tiny side margins
      const wFromH = Math.floor(h / 1.414);         // A4 portrait ratio
      const wMax   = window.innerWidth - 40;          // near edge-to-edge
      const w      = Math.min(wFromH, wMax, 920);    // cap at 920px
      setBookH(h);
      setPageW(w);
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  // ── Load PDF.js ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (window.pdfjsLib) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = '/dept/js/pdf.worker.min.js';
      setLibLoaded(true);
      return;
    }
    const s    = document.createElement('script');
    s.src      = '/dept/js/pdf.min.js';
    s.async    = true;
    s.onload   = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = '/dept/js/pdf.worker.min.js';
        setLibLoaded(true);
      }
    };
    s.onerror  = () => { setError('PDF library failed to load.'); setLoading(false); };
    document.body.appendChild(s);
    return () => { try { document.body.removeChild(s); } catch (_) {} };
  }, []);

  // ── Parse PDF ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!libLoaded || !fileUrl) return;
    let live = true;
    setLoading(true); setError(null);
    const load = async () => {
      try {
        let resolvedUrl = fileUrl;

        // Clean up any legacy localhost URLs stored in database content
        if (typeof resolvedUrl === 'string') {
          resolvedUrl = resolvedUrl.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, '');
        }

        // 1. Resolve relative URLs
        if (resolvedUrl.startsWith('/api/uploads') || resolvedUrl.startsWith('/uploads')) {
          const backendBase = (process.env.NEXT_PUBLIC_API_URL || '/api').replace('/api', '');
          const cleanPath = resolvedUrl.startsWith('/api') ? resolvedUrl : '/api' + resolvedUrl;
          resolvedUrl = `${backendBase}${cleanPath}`;
        } else if (!resolvedUrl.startsWith('http://') && !resolvedUrl.startsWith('https://')) {
          const cleanPath = resolvedUrl.replace(/^\/+/, '');
          resolvedUrl = cleanPath.startsWith('Dept/') 
            ? `https://www.periyaruniversity.ac.in/${cleanPath}`
            : `https://www.periyaruniversity.ac.in/Dept/${cleanPath}`;
        }

        // 2. Fetch PDF data (ArrayBuffer) to bypass CORS issues in pdf.js
        let pdfData = resolvedUrl;
        if (typeof resolvedUrl === 'string' && resolvedUrl.startsWith('http')) {
          try {
            const response = await fetch(resolvedUrl);
            if (response.ok) {
              const buffer = await response.arrayBuffer();
              pdfData = { data: new Uint8Array(buffer) };
            }
          } catch (_) {
            pdfData = resolvedUrl;
          }
        }

        const doc = await window.pdfjsLib.getDocument(pdfData).promise;
        if (!live) return;
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setLoading(false);
      } catch (err) {
        console.error('Flipbook PDF Load Error:', err);
        if (live) { setError('Could not open the PDF. Check the file URL.'); setLoading(false); }
      }
    };
    load();
    return () => { live = false; };
  }, [libLoaded, fileUrl]);

  // ── Navigation ───────────────────────────────────────────────────────────
  const canNext = !isFlipping && !loading && !error && currentPage < numPages;
  const canPrev = !isFlipping && !loading && !error && currentPage > 1;

  const flip = (dir) => {
    if (isFlipping) return;
    const dest = dir === 'next' ? currentPage + 1 : currentPage - 1;
    setTargetPage(dest);
    setFlipDir(dir);
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentPage(dest);
      setTargetPage(null);
      setIsFlipping(false);
    }, 600);
  };

  // ── Keyboard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight' && canNext) flip('next');
      if (e.key === 'ArrowLeft'  && canPrev) flip('prev');
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canNext, canPrev, isFlipping]);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-slate-950/92 backdrop-blur-md animate-in fade-in duration-300 select-none">

      {/* ── Compact Header ─────────────────────────────────────────────── */}
      <div className="w-full px-4 py-1.5 bg-slate-900 border-b border-slate-800 flex justify-between items-center flex-shrink-0 z-20">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-[8px] text-emerald-400 font-extrabold uppercase tracking-[0.2em] hidden sm:inline flex-shrink-0">
            📖 SYLLABUS
          </span>
          <p className="text-xs font-bold text-slate-100 truncate m-0">{title}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {!loading && !error && (
            <span className="text-[10px] font-black text-slate-400 hidden sm:inline">
              {currentPage} / {numPages}
            </span>
          )}
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center border-none cursor-pointer transition-all duration-200 text-xs font-bold"
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {/* ── Book Arena ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center overflow-hidden" style={{ padding: '6px 20px' }}>

        {loading && (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
            <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">Opening Book…</span>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center gap-3 text-center max-w-sm">
            <span className="text-3xl">⚠️</span>
            <p className="text-sm font-bold text-rose-400">{error}</p>
          </div>
        )}

        {!loading && !error && pdfDoc && (
          <div
            className="book-3d"
            style={{ width: pageW, height: bookH }}
          >
            {/* ── Static background page (destination, pre-rendered) ── */}
            <div
              className="book-page static-cover"
              style={{ width: pageW }}
            >
              <PdfPageCanvas
                pdfDoc={pdfDoc}
                pageNum={isFlipping ? targetPage : currentPage}
                containerWidth={pageW}
                containerHeight={bookH}
              />
            </div>

            {/* ── Animated flipping sheet ──────────────────────────── */}
            {isFlipping && (
              <div
                className={`book-page flipping-sheet ${flipDir === 'next' ? 'flip-next' : 'flip-prev'}`}
                style={{
                  width: pageW,
                  left: 0,
                  transformOrigin: flipDir === 'next' ? 'left center' : 'right center',
                }}
              >
                {/* Front face: the page you're leaving */}
                <div className="page-face face-front">
                  <PdfPageCanvas
                    pdfDoc={pdfDoc}
                    pageNum={flipDir === 'next' ? currentPage : targetPage}
                    containerWidth={pageW}
                    containerHeight={bookH}
                  />
                </div>
                {/* Back face: the page being revealed (mirror-corrected by CSS) */}
                <div className="page-face face-back">
                  <PdfPageCanvas
                    pdfDoc={pdfDoc}
                    pageNum={flipDir === 'next' ? targetPage : currentPage}
                    containerWidth={pageW}
                    containerHeight={bookH}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Compact Footer ─────────────────────────────────────────────── */}
      <div className="w-full px-4 py-1.5 bg-slate-900 border-t border-slate-800 flex justify-between items-center flex-shrink-0 z-20">
        <button
          onClick={() => flip('prev')}
          disabled={!canPrev}
          className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 text-slate-200 disabled:text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-wider transition border border-slate-700 disabled:border-slate-800 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          ◀ Prev
        </button>

        <span className="text-[9px] font-bold text-slate-600 hidden sm:inline">
          ← → arrow keys to flip
        </span>

        <button
          onClick={() => flip('next')}
          disabled={!canNext}
          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-900 text-white disabled:text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-wider transition border-none disabled:border disabled:border-slate-800 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          Next ▶
        </button>
      </div>

    </div>
  );
}
