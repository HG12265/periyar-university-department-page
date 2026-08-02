'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from './ToastContext';

const EditDepartmentContext = createContext(null);

export const defaultMuseumContent = {
  intro_text: "As an integral part of Geological curriculum, an exclusive Geological museum has been established in Department of Geology, Periyar University in the year 2004. The geological museum and collections of rare geological samples are great assets of the nation and contribute to research, science education and public.",
  intro_bullets: [
    "Collections form an intrinsic part of research carried out in regional and national levels. They play a key role as a source of evidence in tackling major challenges such as understanding our past for precise characterization of future climate change and for exploring natural resources.",
    "The Tamil Nadu State is the site of many scientific breakthroughs in the history of geology. Collections narrate an engaging story about the geological heritage of the state.",
    "Museums and collections are crucial gateways to engaging students and the public in Geology, Earth history in particular and science in general.",
    "Local collection embodies, an important sense of place, different from centrally held collections, and tell a compelling story of local landscape and geology."
  ],
  intro_outro: "Tamil Nadu is a home to a wide-ranging and scientifically important set of geological collections. The diverse and unique natures of the collections contribute to the scientific advancement and cultural understanding of our planet for researchers, students and the public. Specimens housed in collections around the Tamil Nadu include rocks and minerals, casts, reconstructions, plants and animal fossils. Together, they represent an unparalleled scientific and resource that attracts visitors.",
  museum_text1: "Geological Museum of the Department of Geology, Periyar University, is unique, which displays more than 1000 exhibits of typical and rare specimens of minerals, rocks and fossils and models of earth processes and evolution of life. Besides, the museum has an excellent collection of gemstones; in natural and polished forms. There are collections of fossils (age-wise, phylum-wise) of both plants and animals, rocks of igneous, sedimentary and metamorphic groups, and minerals element-wise, statewise, and genesis. In addition, models of crystals that occur in nature and represent various ore and rock forming minerals are also housed in the Museum of the Department of Geology. Further, various physical features of rocks, namely folds, faults, joints and foliations together with different geomorphic models of the Earth and Earth surface and interior are also included in the exhibits. Collections in the Museum are used by staff and students for research and postgraduate courses.",
  museum_text2: "The curation and exhibition of geoscience samples are invaluable to science education. Visiting collections and using associated teaching resources provide engaging and exciting ways to learn. Local and national museums are visited by children and students of all ages, and are also a considerable draw for many people visiting the Department. Public access to collections often provides the opportunity for hands-on interaction with some samples, helping to develop a more concrete understanding of the processes they represent.",
  collections_can: [
    "Help people to better understand their local area through its geology.",
    "Provide students with practical insight into grand theoretical ideas such as palaeoclimatic change, plate tectonics, mountain building and seafloor spreading.",
    "Enable an understanding of rare and remote rocks and rock forming processes through visiting collections of local, regional, national and international samples.",
    "Illustrate the complexity of 'real world' features and processes which are often simplified when taught in the classroom.",
    "Create an appreciation of the flora and fauna of the planet, its evolution through geological time and humanity's place in the timescale of life."
  ],
  importance_text1: "Publicly accessible collections are well distributed across the nation. Smaller local collections are often best equipped to tell the story of an area's geology and landscapes through specimens and samples that may include outcrops and rock types unique to that area.",
  importance_text2: "Larger national institutions generally contain more nationally and internationally significant material which is less closely linked to its location. National and local collections therefore perform different and complementary functions in terms of public engagement and understanding. The Museum in the Department of Geology does precisely to fill this gap by housing and providing access to the rocks, minerals, fossils, and models of local-regional-national occurrence and importance.",
  importance_list_title: "List of Geological Specimens",
  importance_text3: "The Museum in the Department of Geology has arguably the largest and best rock and mineral collection in the region. Selected specimens are on display in the museum, and many more are stored for teaching and research purposes. The mineral collection has been the nucleus of a long history of research.",
  fossils: [
    { name: "Ammonite Fossil", image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80" },
    { name: "Trilobite Specimen", image: "https://images.unsplash.com/photo-1605092676920-8acb043d740c?auto=format&fit=crop&w=400&q=80" },
    { name: "Plant Fossil Specimen", image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80" },
    { name: "Vertebrate Fossil cast", image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80" }
  ],
  minerals: [
    { name: "Quartz Crystals", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80" },
    { name: "Amethyst Cluster", image: "https://images.unsplash.com/photo-1515688594390-b649af70d282?auto=format&fit=crop&w=400&q=80" },
    { name: "Feldspar Crystals", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80" }
  ],
  ores: [
    { name: "Pyrite Ore Specimen", image: "https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?auto=format&fit=crop&w=400&q=80" }
  ],
  events: []
};

export function EditDepartmentProvider({ children }) {
  const { id } = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
  const [dept, setDept] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Silent Refresh Interceptor for Cookie Auth
  useEffect(() => {
    const originalFetch = window.fetch;
    
    function getCookie(name) {
      if (typeof document === 'undefined') return '';
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return '';
    }

    window.fetch = async function (url, options = {}) {
      const urlString = typeof url === 'string' ? url : (url && url.url) || '';
      
      let response = await originalFetch(url, options);
      
      // If unauthorized on an administrative query, attempt a silent refresh
      if (response.status === 401 && urlString.includes('/api/admin/') && !urlString.includes('/api/admin/login') && !urlString.includes('/api/admin/refresh')) {
        try {
          const csrfToken = getCookie('csrf_token');
          const refreshHeaders = {};
          if (csrfToken) {
            refreshHeaders['X-CSRF-Token'] = csrfToken;
          }

          const refreshRes = await originalFetch(`${apiUrl}/admin/refresh`, {
            method: 'POST',
            headers: refreshHeaders,
            credentials: 'include'
          });
          
          if (refreshRes.ok) {
            // Retry the original query
            const newCsrfToken = getCookie('csrf_token');
            if (newCsrfToken) {
              if (!options.headers) {
                options.headers = {};
              }
              const isHeadersInstance = options.headers instanceof Headers;
              if (isHeadersInstance) {
                options.headers.set('X-CSRF-Token', newCsrfToken);
              } else {
                options.headers['X-CSRF-Token'] = newCsrfToken;
              }
            }
            response = await originalFetch(url, options);
          } else {
            // Refresh token has expired/failed
            localStorage.removeItem('PU_DEPT_ADMIN_AUTHED');
            window.location.reload();
          }
        } catch (err) {
          console.error("Silent refresh failed:", err);
          localStorage.removeItem('PU_DEPT_ADMIN_AUTHED');
          window.location.reload();
        }
      }
      
      return response;
    };
    
    return () => {
      window.fetch = originalFetch;
    };
  }, [apiUrl]);

  // States for adding new items
  const [newSection, setNewSection] = useState({ title: '', content: '' });
  const [newLink, setNewLink] = useState({ label: '', url: '' });
  const [syllabusFormData, setSyllabusFormData] = useState({ sno: '', title: '', file: null });
  const [programmeFormData, setProgrammeFormData] = useState({
    name: '',
    eligibility: '',
    link1Text: '',
    link1File: null,
    link2Text: '',
    link2File: null,
    link3Text: '',
    link3File: null,
    link4Text: '',
    link4File: null
  });
  const [ugcFormData, setUgcFormData] = useState({ contentText: '', file: null });
  const [journalText, setJournalText] = useState('');
  const [journalFile, setJournalFile] = useState(null);
  const [conferenceText, setConferenceText] = useState('');
  const [conferenceFile, setConferenceFile] = useState(null);
  const [journalBuilderMode, setJournalBuilderMode] = useState('entry'); // 'entry' or 'image'
  const [journalImageFile, setJournalImageFile] = useState(null);
  const [ugcBuilderMode, setUgcBuilderMode] = useState('row-builder'); // 'row-builder' or 'table-builder'
  const [ugcTableTitle, setUgcTableTitle] = useState('UGC-MRP RESEARCH PROJECTS');
  const [ugcTableRows, setUgcTableRows] = useState([
    { contentText: '', file: null, uploadedUrl: '' }
  ]);
  const [projectsPdfFile, setProjectsPdfFile] = useState(null);
  const [existingProjectsPdfUrl, setExistingProjectsPdfUrl] = useState('');

  // States for Activities Builder
  const [activitiesTemplate, setActivitiesTemplate] = useState('seminars'); // 'seminars', 'guest-lectures', 'visits', 'extension', 'custom'
  const [activitiesFormData, setActivitiesFormData] = useState({
    sno: '',
    date: '',
    field3: '',
    field4: '',
    field5: '',
    field6: '',
    file: null
  });
  const [activityCustomTableData, setActivityCustomTableData] = useState({
    headers: ['S.No', 'Date', 'Activity Title', 'Description', 'Details'],
    rows: []
  });
  const [tableMode, setTableMode] = useState('custom'); // 'custom' or 'standard'

  // New States for Activities Multi-session Component Builder
  const [activeBuilderTab, setActiveBuilderTab] = useState('table'); // 'table', 'image', 'points', 'file-upload'
  const [isActivitiesTableInserted, setIsActivitiesTableInserted] = useState(false);
  const [activitiesTableColumnInput, setActivitiesTableColumnInput] = useState('');
  const [activityTableTitle, setActivityTableTitle] = useState('');

  // Image Session State
  const [imageAlign, setImageAlign] = useState('center');
  const [imageWidth, setImageWidth] = useState('full');
  const [imageCaption, setImageCaption] = useState('');
  const [imageFile, setImageFile] = useState(null);

  // Points Session State
  const [pointsTitle, setPointsTitle] = useState('');
  const [pointsList, setPointsList] = useState(['First sample milestone/achievement', 'Second sample objective']);
  const [newPointText, setNewPointText] = useState('');
  const [pointIcon, setPointIcon] = useState('✔');

  // File Link State
  const [downloadTitle, setDownloadTitle] = useState('');
  const [downloadDesc, setDownloadDesc] = useState('');
  const [downloadStyle, setDownloadStyle] = useState('card'); // 'card', 'button', 'link'
  const [downloadFile, setDownloadFile] = useState(null);

  // New state for view management
  // Activity Gallery Events State (same as alumni meeting gallery)
  const [activityGalleryEvents, setActivityGalleryEvents] = useState([]);
  const [sectionGalleryEvents, setSectionGalleryEvents] = useState([]);
  const [activeActivityEvent, setActiveActivityEvent] = useState(null);
  const [activityEventFormData, setActivityEventFormData] = useState({ title: '', images: [] });
  const [activityGalleryUploading, setActivityGalleryUploading] = useState(false);

  const [showTemplateBuilder, setShowTemplateBuilder] = useState(false);

  const [view, setView] = useState('dashboard'); // 'dashboard', 'category', 'editor'
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [originalRawContent, setOriginalRawContent] = useState('');
  const [activeFaculty, setActiveFaculty] = useState(null);
  const [facultyFormData, setFacultyFormData] = useState({
    name: '', designation: '', email: '', specialization: '', is_former: 0, order_index: 0, image_url: '', profile_url: ''
  });
  const [facultyImageFile, setFacultyImageFile] = useState(null);
  const [alumniTableData, setAlumniTableData] = useState({ columns: [], rows: [], meeting_title: '', meeting_images: [] });
  const [alumniUploading, setAlumniUploading] = useState(false);
  const [activeAlumni, setActiveAlumni] = useState(null);
  const [alumniFormData, setAlumniFormData] = useState({});
  const [alumniImageFile, setAlumniImageFile] = useState(null);
  const [activeEvent, setActiveEvent] = useState(null);
  const [eventFormData, setEventFormData] = useState({ title: '', images: [] });

  // Placement States
  const [placementTableData, setPlacementTableData] = useState({ columns: [], rows: [], meeting_title: '', meeting_images: [] });
  const [placementUploading, setPlacementUploading] = useState(false);
  const [activePlacement, setActivePlacement] = useState(null);
  const [placementFormData, setPlacementFormData] = useState({});
  const [placementImageFile, setPlacementImageFile] = useState(null);
  const [activePlacementEvent, setActivePlacementEvent] = useState(null);
  const [placementEventFormData, setPlacementEventFormData] = useState({ title: '', images: [] });
  const [visitingFacultyRows, setVisitingFacultyRows] = useState([]);
  const [phdAwardedRows, setPhdAwardedRows] = useState([]);
  const [dstFacultyRows, setDstFacultyRows] = useState([]);
  const [activeDstFaculty, setActiveDstFaculty] = useState(null);
  const [dstFacultyFormData, setDstFacultyFormData] = useState({ name: '', email: '', mobile: '' });
  const [museumContent, setMuseumContent] = useState({});
  const [bestPracticesContent, setBestPracticesContent] = useState({ title: 'BEST PRACTICES', video_url: '', description: 'Best Practices, Periyar University' });
  const [financeDetailsContent, setFinanceDetailsContent] = useState([]);
  const [activeMuseumTab, setActiveMuseumTab] = useState('intro');
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: '', // 'addColumn', 'deleteColumn', 'deleteRow'
    title: '',
    message: '',
    inputValue: '',
    metadata: null
  });

  // Energy Park States
  const [energyParkImages, setEnergyParkImages] = useState([]);
  const [energyParkEquipments, setEnergyParkEquipments] = useState([]);
  const [energyParkUploading, setEnergyParkUploading] = useState(false);
  const [newEquipmentInput, setNewEquipmentInput] = useState('');

  // Student Projects States
  const [studentProjects, setStudentProjects] = useState([]);
  const [studentProjectsUploading, setStudentProjectsUploading] = useState(false);
  const [studentProjectForm, setStudentProjectForm] = useState({ title: '', student: '', degree: '', image_url: '' });
  const [editingStudentProjectIdx, setEditingStudentProjectIdx] = useState(null);

  const [globalConfirm, setGlobalConfirm] = useState(null);

  const showConfirm = (options) => {
    return new Promise((resolve) => {
      setGlobalConfirm({
        title: options.title || 'Delete Confirmation',
        message: options.message || 'Are you sure you want to perform this action?',
        itemName: options.itemName || '',
        resolve: (val) => {
          setGlobalConfirm(null);
          resolve(val);
        }
      });
    });
  };

  const [globalPrompt, setGlobalPrompt] = useState(null);

  const showPrompt = (options) => {
    return new Promise((resolve) => {
      setGlobalPrompt({
        title: options.title || 'Input Value',
        message: options.message || 'Please enter a value:',
        defaultValue: options.defaultValue || '',
        placeholder: options.placeholder || '',
        resolve: (val) => {
          setGlobalPrompt(null);
          resolve(val);
        }
      });
    });
  };

  useEffect(() => {
    if (activeCategory?.slug === 'projects' && activeSection?.content) {
      const match = activeSection.content.match(/href="([^"]+\.pdf)"/i);
      const url = match ? match[1] : '';
      if (existingProjectsPdfUrl !== url) {
        setExistingProjectsPdfUrl(url);
      }
    } else {
      if (existingProjectsPdfUrl !== '') {
        setExistingProjectsPdfUrl('');
      }
      if (projectsPdfFile !== null) {
        setProjectsPdfFile(null);
      }
    }
  }, [activeSection, activeCategory, existingProjectsPdfUrl, projectsPdfFile]);

  const handleUploadProjectsPdf = async () => {
    if (!projectsPdfFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', projectsPdfFile);
      formData.append('folder', 'syllabus');

      const res = await fetch(`${apiUrl}/admin/upload?folder=activities`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        const base = apiUrl.replace('/api', '');
        const fullUrl = `${base}${data.url}`;

        const pdfButtonHtml = `
<div style="margin-bottom: 8px; display: flex; align-items: center; justify-content: flex-start;">
  <a href="${fullUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 6px; background-color: #990033; color: white; padding: 6px 12px; border-radius: 8px; font-weight: bold; text-decoration: none; font-family: 'CMU Sans Serif Demi borderless', sans-serif; font-size: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: all 0.2s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 12px rgba(0,0,0,0.15)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px rgba(0,0,0,0.1)';">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
    FUNDED PROJECTS LIST
  </a>
</div>
        `.trim();

        let cleanContent = activeSection.content || '';
        cleanContent = cleanContent.replace(/<div[^>]*>[\s\S]*?FUNDED PROJECTS LIST[\s\S]*?<\/div>/i, '');
        const finalContent = pdfButtonHtml + "\n" + cleanContent;

        setActiveSection({
          ...activeSection,
          content: finalContent
        });
        setExistingProjectsPdfUrl(fullUrl);
        setProjectsPdfFile(null);
        alert('✓ Funded Projects List PDF successfully uploaded and button linked!');
      } else {
        const errData = await res.json();
        alert('Failed to upload PDF: ' + (errData.detail || 'Upload failed'));
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveProjectsPdf = async () => {
    const confirmed = await showConfirm({
      title: 'Remove Funded Projects PDF',
      message: 'Are you sure you want to remove the Funded Projects PDF link from this section?',
      itemName: 'Projects PDF'
    });
    if (!confirmed) return;
    let cleanContent = activeSection.content || '';
    cleanContent = cleanContent.replace(/<div[^>]*>[\s\S]*?FUNDED PROJECTS LIST[\s\S]*?<\/div>/i, '');
    setActiveSection({
      ...activeSection,
      content: cleanContent
    });
    setExistingProjectsPdfUrl('');
    setProjectsPdfFile(null);
    alert('✓ PDF link removed from content!');
  };

  const parseHtmlTableToData = (htmlString) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, 'text/html');
      const table = doc.querySelector('table');
      if (!table) return null;

      let tableTitle = '';
      const heading = doc.querySelector('h1, h2, h3, h4');
      if (heading) {
        tableTitle = heading.textContent.trim();
      }

      // Check if table has thead or th elements to determine if it is a headered table
      const hasTheadOrTh = table.querySelector('thead') || table.querySelector('th');

      let headers = [];
      const ths = table.querySelectorAll('th');
      if (ths.length > 0) {
        ths.forEach(th => {
          headers.push(th.textContent.trim());
        });
      }

      const allTrs = Array.from(table.querySelectorAll('tr'));
      const rows = [];

      allTrs.forEach((tr) => {
        const rowThs = tr.querySelectorAll('th');
        if (rowThs.length > 0) {
          if (headers.length === 0) {
            rowThs.forEach(th => headers.push(th.textContent.trim()));
          }
          return;
        }

        const tds = tr.querySelectorAll('td');
        if (tds.length === 0) return;

        // Only consume the first row as headers if the table actually has headers
        if (headers.length === 0 && hasTheadOrTh) {
          tds.forEach((td, idx) => {
            headers.push(td.textContent.trim() || `Column ${idx + 1}`);
          });
          return;
        }

        const cells = Array.from(tds).map(td => {
          let html = td.innerHTML.trim();
          return html.replace(/<br\s*\/?>/gi, '\n');
        });
        rows.push(cells);
      });

      // If it is completely headerless, generate headers dynamically without consuming any row data
      if (headers.length === 0 && rows.length > 0) {
        const colCount = Math.max(...rows.map(r => r.length));
        for (let i = 0; i < colCount; i++) {
          // Check if any row has an anchor/link in this column to auto-detect file column
          const isFile = rows.some(r => r[i] && r[i].toLowerCase().includes('<a href=') && (r[i].toLowerCase().includes('.pdf') || r[i].toLowerCase().includes('view')));
          headers.push(isFile ? `Column ${i + 1} (File)` : `Column ${i + 1}`);
        }
      }

      const sanitizedRows = rows.map(row => {
        const newRow = [...row];
        while (newRow.length < headers.length) {
          newRow.push('');
        }
        return newRow.slice(0, headers.length);
      });

      return { headers, rows: sanitizedRows, title: tableTitle };
    } catch (e) {
      console.error("HTML Table Parsing Error:", e);
      return null;
    }
  };

  const parseVisitingFacultyHtml = (htmlContent) => {
    if (!htmlContent) return [];
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      const table = doc.querySelector('table');
      if (!table) return [];

      const rows = [];
      const trs = table.querySelectorAll('tbody tr, tr');

      trs.forEach(tr => {
        if (tr.querySelector('th') || tr.innerHTML.includes('No of Professors') || tr.innerHTML.includes('Particulars of Visiting')) {
          return;
        }
        const tds = tr.querySelectorAll('td');
        if (tds.length >= 3) {
          const no_visited = tds[0].textContent.trim();
          const dates_visited = tds[2].textContent.trim();

          const particularsTd = tds[1];
          const professors = [];

          const divs = particularsTd.querySelectorAll('div');
          if (divs.length > 0) {
            divs.forEach(div => {
              const strong = div.querySelector('strong, b');
              let text = '';
              if (strong) {
                const strongText = strong.textContent.trim();
                const clone = div.cloneNode(true);
                const s = clone.querySelector('strong, b');
                if (s) s.remove();

                // Remove initial <br> if it exists after strong
                let restHtml = clone.innerHTML.trim();
                if (restHtml.startsWith('<br>') || restHtml.startsWith('<br/>') || restHtml.startsWith('<br />')) {
                  restHtml = restHtml.replace(/^<br\s*\/?>/i, '');
                }

                const restText = restHtml
                  .replace(/<br\s*\/?>/gi, '\n')
                  .replace(/<[^>]*>/g, '')
                  .trim();
                text = strongText + (restText ? '\n' + restText : '');
              } else {
                text = div.innerHTML
                  .replace(/<br\s*\/?>/gi, '\n')
                  .replace(/<[^>]*>/g, '')
                  .trim();
              }
              if (text) professors.push(text);
            });
          } else {
            const text = particularsTd.innerHTML
              .replace(/<br\s*\/?>/gi, '\n')
              .replace(/<[^>]*>/g, '')
              .trim();
            if (text) professors.push(text);
          }

          rows.push({
            no_visited,
            dates_visited,
            professors: professors.length > 0 ? professors : ['']
          });
        }
      });

      return rows;
    } catch (e) {
      console.error("Error parsing visiting faculty HTML:", e);
      return [];
    }
  };

  const parsePhdAwardedHtml = (htmlContent) => {
    if (!htmlContent) return [];
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      const table = doc.querySelector('table');
      if (!table) return [];

      const groups = [];
      let currentGroup = null;

      const trs = table.querySelectorAll('tbody tr, tr');
      trs.forEach(tr => {
        // Skip header row
        if (tr.querySelector('th') || tr.innerHTML.includes('Name of the Scholar') || tr.innerHTML.includes('Title of the Thesis') || tr.innerHTML.includes('Date of Award')) {
          return;
        }

        // Check if this is a year header row (colspan="5" or contains a year range like 2020 - 2021)
        const firstTd = tr.querySelector('td');
        if (firstTd && (firstTd.getAttribute('colspan') === '5' || (tr.textContent.includes(' - ') && !tr.querySelector('td:nth-child(2)')))) {
          const yearText = tr.textContent.trim();
          currentGroup = {
            year: yearText,
            candidates: []
          };
          groups.push(currentGroup);
          return;
        }

        // Otherwise, it's a candidate row
        const tds = tr.querySelectorAll('td');
        if (tds.length >= 5) {
          const candidate = {
            sno: tds[0].textContent.trim(),
            scholar_name: tds[1].textContent.trim(),
            supervisor: tds[2].textContent.trim(),
            thesis_title: tds[3].textContent.trim(),
            award_date: tds[4].textContent.trim()
          };
          if (!currentGroup) {
            currentGroup = { year: 'General', candidates: [] };
            groups.push(currentGroup);
          }
          currentGroup.candidates.push(candidate);
        }
      });

      return groups;
    } catch (e) {
      console.error("Error parsing PhD Awarded HTML:", e);
      return [];
    }
  };

  const parseDstFacultyHtml = (html) => {
    if (!html) return [];
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const divs = doc.querySelectorAll('div');

      const members = [];

      divs.forEach(div => {
        // Skip wrapper parent div by checking if it contains nested divs
        if (div.querySelector('div')) return;

        const lines = div.innerHTML.split(/<br\s*\/?>/i).map(l => l.replace(/<[^>]+>/g, '').trim()).filter(Boolean);
        if (lines.length > 0) {
          let name = '';
          let email = '';
          let mobile = '';

          lines.forEach(line => {
            if (line.toLowerCase().includes('email:')) {
              email = line.replace(/email:/i, '').trim();
            } else if (line.toLowerCase().includes('mobile')) {
              mobile = line.substring(line.indexOf(':') + 1).trim();
            } else {
              if (!name) name = line.trim();
            }
          });

          if (name || email || mobile) {
            members.push({ name, email, mobile });
          }
        }
      });

      // Fallback
      if (members.length === 0 && html.trim()) {
        const cleanLines = html.replace(/<[^>]+>/g, '\n').split('\n').map(l => l.trim()).filter(Boolean);
        let name = '';
        let email = '';
        let mobile = '';
        cleanLines.forEach(line => {
          if (line.toLowerCase().includes('email:')) {
            email = line.replace(/email:/i, '').trim();
          } else if (line.toLowerCase().includes('mobile')) {
            mobile = line.substring(line.indexOf(':') + 1).trim();
          } else {
            if (!name) name = line.trim();
          }
        });
        if (name || email || mobile) {
          members.push({ name, email, mobile });
        }
      }

      return members;
    } catch (e) {
      console.error("Error parsing DST-Faculty HTML:", e);
      return [];
    }
  };

  const getDeptIcon = (name) => {
    const n = name ? name.toLowerCase() : '';
    if (n.includes('computer') || n.includes('information')) return '💻';
    if (n.includes('biochem') || n.includes('microbiol') || n.includes('biotech')) return '🧬';
    if (n.includes('chemistry')) return '🧪';
    if (n.includes('physics')) return '⚛️';
    if (n.includes('math') || n.includes('stat')) return '📐';
    if (n.includes('geology')) return '⛰️';
    if (n.includes('environmental') || n.includes('energy')) return '🌱';
    if (n.includes('botany')) return '🌿';
    if (n.includes('zoology')) return '🦁';
    if (n.includes('commerce') || n.includes('economics')) return '📈';
    if (n.includes('management')) return '💼';
    if (n.includes('english') || n.includes('tamil') || n.includes('journalism')) return '✍️';
    if (n.includes('education')) return '🎓';
    if (n.includes('nutrition') || n.includes('food') || n.includes('diet')) return '🍎';
    if (n.includes('textiles') || n.includes('apparel')) return '🧵';
    if (n.includes('sociology') || n.includes('psychology')) return '🧠';
    if (n.includes('history')) return '⏳';
    return '🏛️';
  };

  const getCategoryIcon = (slug, name) => {
    const s = slug.toLowerCase();
    const n = name.toLowerCase();
    if (s === 'home') return '🏠';
    if (s === 'programmes' || n.includes('programme')) return '🎓';
    if (s === 'syllabus') return '📋';
    if (s === 'guest-faculty' || n.includes('guest faculty')) return '👥';
    if (s === 'faculty' || n.includes('faculty') || n.includes('professor')) return '👤';
    if (s === 'activities' || n.includes('activity')) return '⚡';
    if (s === 'facilities' || n.includes('facility')) return '🏢';
    if (s === 'projects' || n.includes('project')) return '💰';
    if (s === 'alumni') return '🤝';
    if (s === 'contact') return '📞';
    if (s === 'pdf') return '📄';
    if (n.includes('mrp') || n.includes('ugc')) return '🛡️';
    if (n.includes('journal')) return '📰';
    if (n.includes('conference')) return '🗣️';
    if (n.includes('museum')) return '🏛️';
    if (n.includes('practices') || n.includes('best')) return '⭐';
    if (n.includes('student') || n.includes('fee') || n.includes('finance') || n.includes('affidavit')) return '📝';
    if (n.includes('gallery')) return '🖼️';
    if (n.includes('park') || n.includes('environment')) return '🌲';
    if (n.includes('placement')) return '💼';
    return '📁';
  };

  const defaultCategories = [
    { name: 'Home', icon: '🏠', slug: 'home' },
    { name: 'Programmes Offered', icon: '🎓', slug: 'programmes' },
    { name: 'Syllabus', icon: '📋', slug: 'syllabus' },
    { name: 'Faculty', icon: '👤', slug: 'faculty' },
    { name: 'Conference', icon: '📢', slug: 'conference' },
    { name: 'Activities', icon: '⚡', slug: 'activities' },
    { name: 'Facilities', icon: '🏢', slug: 'facilities' },
    { name: 'Funded Projects', icon: '💰', slug: 'projects' },
    { name: 'Journal', icon: '📰', slug: 'journal' },
    { name: 'Alumni', icon: '🤝', slug: 'alumni' },
    { name: 'Contact', icon: '📞', slug: 'contact' },
  ];

  let categories = dept?.nav_links && dept.nav_links.length > 0
    ? dept.nav_links.map(link => {
      const slug = link.url.replace('#', '');
      return {
        name: link.label,
        slug: slug,
        icon: getCategoryIcon(slug, link.label)
      };
    })
    : defaultCategories;

  // Normalize guestfaculty slug to guest-faculty for uniform handling and duplicate prevention
  categories = categories.map(c => {
    if (c.slug === 'guestfaculty') {
      return { ...c, slug: 'guest-faculty' };
    }
    return c;
  });

  const toggleModuleSection = async (slug, name) => {
    if (!dept) return;
    const currentNavLinks = dept.nav_links ? [...dept.nav_links] : [];
    const targetLink = currentNavLinks.find(l => l.url === `#${slug}` || l.slug === slug || l.url === slug);

    let updatedNavLinks = [];
    if (targetLink) {
      // Toggle OFF: remove this link
      updatedNavLinks = currentNavLinks.filter(l => l.url !== `#${slug}` && l.slug !== slug && l.url !== slug);
      setDept(prev => ({ ...prev, nav_links: updatedNavLinks }));

      // Delete from DB
      if (targetLink.id && typeof targetLink.id === 'number') {
        try {
          await fetch(`${apiUrl}/admin/remove-link/${targetLink.id}`, { method: 'POST' });
        } catch (err) { console.error('Failed to delete nav link', err); }
      }
    } else {
      // Toggle ON: add this link
      const newOrderIndex = currentNavLinks.length + 1;
      const url = `#${slug}`;
      const tempId = `temp-${Date.now()}`;

      const newLink = {
        id: tempId,
        label: name,
        url: url,
        order_index: newOrderIndex,
        slug: slug
      };

      updatedNavLinks = [...currentNavLinks, newLink];
      setDept(prev => ({ ...prev, nav_links: updatedNavLinks }));

      // Insert into DB
      try {
        const res = await fetch(`${apiUrl}/admin/nav-links`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dept_id: dept.id,
            label: name,
            url: url,
            order_index: newOrderIndex
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.id) {
            setDept(prev => ({
              ...prev,
              nav_links: (prev.nav_links || []).map(l => l.id === tempId ? { ...l, id: data.id } : l)
            }));
          }
        }
      } catch (err) {
        console.error('Failed to persist nav link', err);
      }
    }
  };

  const fetchActivityGallery = async () => {
    try {
      const res = await fetch(`${apiUrl}/admin/activity-gallery/${id}`);
      if (res.ok) {
        const data = await res.json();
        setActivityGalleryEvents(data.events || []);
      }
    } catch (err) {
      console.error('Error fetching activity gallery:', err);
    }
  };

  const fetchStudentProjectsSection = () => {
    const sect = dept?.sections?.find(s => s.category === 'student-project');
    if (sect) {
      setActiveSection(sect);
      try {
        setStudentProjects(JSON.parse(sect.content) || []);
      } catch (e) {
        console.error("Error parsing student projects JSON:", e);
        setStudentProjects([]);
      }
    } else {
      setActiveSection({
        section_title: "Student's Project",
        category: 'student-project',
        content: JSON.stringify([])
      });
      setStudentProjects([]);
    }
    setStudentProjectForm({ title: '', student: '', degree: '', image_url: '' });
    setEditingStudentProjectIdx(null);
    setView('student-project-manager');
  };

  const handleSaveStudentProjects = async (updatedProjects) => {
    setUploading(true);
    try {
      const projectsList = updatedProjects !== undefined ? updatedProjects : studentProjects;

      let res;
      if (activeSection?.id) {
        const payload = {
          title: "Student's Project",
          category: 'student-project',
          content: JSON.stringify(projectsList),
          order: activeSection?.order_index || 0
        };
        res = await fetch(`${apiUrl}/admin/sections/${activeSection.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        const payload = {
          dept_id: parseInt(id),
          title: "Student's Project",
          category: 'student-project',
          content: JSON.stringify(projectsList),
          order: 0
        };
        res = await fetch(`${apiUrl}/admin/sections`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const createdSect = await res.json();
          setActiveSection(createdSect);
        }
      }

      if (res.ok) {
        await fetchDeptDetails();
      } else {
        alert("Failed to save Student's Projects.");
      }
    } catch (err) {
      console.error("Error saving student projects:", err);
      alert("An error occurred while saving.");
    } finally {
      setUploading(false);
    }
  };

  const handleUploadStudentProjectImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setStudentProjectsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'gallery');

      const res = await fetch(`${apiUrl}/admin/upload?folder=activities`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setStudentProjectForm(prev => ({ ...prev, image_url: data.url }));
      } else {
        const errData = await res.json();
        alert('Image upload failed: ' + (errData.detail || 'Upload failed'));
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('An error occurred during upload.');
    } finally {
      setStudentProjectsUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmitStudentProject = async (e) => {
    if (e) e.preventDefault();
    if (!studentProjectForm.title?.trim() || !studentProjectForm.student?.trim() || !studentProjectForm.degree?.trim() || !studentProjectForm.image_url?.trim()) {
      alert("Please fill in all required project fields.");
      return;
    }

    let updated = [...studentProjects];
    if (editingStudentProjectIdx !== null) {
      updated[editingStudentProjectIdx] = studentProjectForm;
    } else {
      updated.push(studentProjectForm);
    }

    setStudentProjects(updated);
    setStudentProjectForm({ title: '', student: '', degree: '', image_url: '' });
    setEditingStudentProjectIdx(null);
    await handleSaveStudentProjects(updated);
  };

  const handleEditStudentProject = (idx) => {
    setEditingStudentProjectIdx(idx);
    setStudentProjectForm(studentProjects[idx]);
  };

  const handleDeleteStudentProject = async (idx) => {
    const project = studentProjects[idx];
    const confirmed = await showConfirm({
      title: 'Delete Student Project',
      message: 'Are you sure you want to delete this student project?',
      itemName: project.title || `Project #${idx + 1}`
    });
    if (confirmed) {
      const updated = studentProjects.filter((_, i) => i !== idx);
      setStudentProjects(updated);
      await handleSaveStudentProjects(updated);
    }
  };

  const handleMoveStudentProject = async (idx, direction) => {
    const updated = [...studentProjects];
    if (direction === 'up' && idx > 0) {
      [updated[idx], updated[idx - 1]] = [updated[idx - 1], updated[idx]];
    } else if (direction === 'down' && idx < updated.length - 1) {
      [updated[idx], updated[idx + 1]] = [updated[idx + 1], updated[idx]];
    } else {
      return;
    }
    setStudentProjects(updated);
    await handleSaveStudentProjects(updated);
  };

  const fetchEnergyParkSection = () => {
    const sect = dept?.sections?.find(s => s.category === 'energy-environment-park');
    if (sect) {
      setActiveSection(sect);
      try {
        const parsed = JSON.parse(sect.content);
        setEnergyParkImages(parsed.images || []);
        setEnergyParkEquipments(parsed.equipments || []);
      } catch (e) {
        console.error("Error parsing energy park JSON:", e);
        setEnergyParkImages([]);
        setEnergyParkEquipments([]);
      }
    } else {
      setActiveSection({
        section_title: 'Energy and Environment Park',
        category: 'energy-environment-park',
        content: JSON.stringify({ images: [], equipments: [] })
      });
      setEnergyParkImages([]);
      setEnergyParkEquipments([]);
    }
    setView('energy-park-manager');
  };

  const handleSaveEnergyPark = async (updatedImages, updatedEquipments) => {
    setUploading(true);
    try {
      const contentObj = {
        images: updatedImages !== undefined ? updatedImages : energyParkImages,
        equipments: updatedEquipments !== undefined ? updatedEquipments : energyParkEquipments
      };

      let res;
      if (activeSection?.id) {
        const payload = {
          title: 'Energy and Environment Park',
          category: 'energy-environment-park',
          content: JSON.stringify(contentObj),
          order: activeSection?.order_index || 0
        };
        res = await fetch(`${apiUrl}/admin/sections/${activeSection.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        const payload = {
          dept_id: parseInt(id),
          title: 'Energy and Environment Park',
          category: 'energy-environment-park',
          content: JSON.stringify(contentObj),
          order: 0
        };
        res = await fetch(`${apiUrl}/admin/sections`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const createdSect = await res.json();
          setActiveSection(createdSect);
        }
      }

      if (res.ok) {
        await fetchDeptDetails();
      } else {
        alert('Failed to save Energy and Environment Park details.');
      }
    } catch (err) {
      console.error('Error saving energy park details:', err);
      alert('An error occurred while saving.');
    } finally {
      setUploading(false);
    }
  };

  const handleUploadEnergyParkImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setEnergyParkUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'gallery');

      const res = await fetch(`${apiUrl}/admin/upload?folder=facilities`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        const updatedImages = [...energyParkImages, data.url];
        setEnergyParkImages(updatedImages);
        await handleSaveEnergyPark(updatedImages, energyParkEquipments);
      } else {
        const errData = await res.json();
        alert('Image upload failed: ' + (errData.detail || 'Upload failed'));
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('An error occurred during upload.');
    } finally {
      setEnergyParkUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteEnergyParkImage = async (imgIdx) => {
    const confirmed = await showConfirm({
      title: 'Delete Energy Park Image',
      message: 'Are you sure you want to delete this energy park image?',
      itemName: `Image #${imgIdx + 1}`
    });
    if (confirmed) {
      const updatedImages = energyParkImages.filter((_, idx) => idx !== imgIdx);
      setEnergyParkImages(updatedImages);
      await handleSaveEnergyPark(updatedImages, energyParkEquipments);
    }
  };

  const handleAddEquipment = async () => {
    if (!newEquipmentInput.trim()) {
      alert("Please enter the name of the equipment.");
      return;
    }
    const updatedEquipments = [...energyParkEquipments, newEquipmentInput.trim()];
    setEnergyParkEquipments(updatedEquipments);
    setNewEquipmentInput('');
    await handleSaveEnergyPark(energyParkImages, updatedEquipments);
  };

  const handleDeleteEquipment = async (eqIdx) => {
    const eqName = energyParkEquipments[eqIdx];
    const confirmed = await showConfirm({
      title: 'Delete Equipment',
      message: 'Are you sure you want to delete this equipment from the list?',
      itemName: eqName
    });
    if (confirmed) {
      const updatedEquipments = energyParkEquipments.filter((_, idx) => idx !== eqIdx);
      setEnergyParkEquipments(updatedEquipments);
      await handleSaveEnergyPark(energyParkImages, updatedEquipments);
    }
  };

  const handleMoveEquipment = async (idx, direction) => {
    const updated = [...energyParkEquipments];
    if (direction === 'up' && idx > 0) {
      [updated[idx], updated[idx - 1]] = [updated[idx - 1], updated[idx]];
    } else if (direction === 'down' && idx < updated.length - 1) {
      [updated[idx], updated[idx + 1]] = [updated[idx + 1], updated[idx]];
    } else {
      return;
    }
    setEnergyParkEquipments(updated);
    await handleSaveEnergyPark(energyParkImages, updated);
  };

  const fetchDeptDetails = async () => {
    try {
      const res = await fetch(`${apiUrl}/admin/departments/${id}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (res.ok) {
        const data = await res.json();

        // Self-healing: clean up duplicate specialized facilities sections if they exist
        const specializedFacilitiesSections = data.sections?.filter(
          s => s.category === 'facilities' && s.content === '[SPECIALIZED_FACILITIES]'
        ) || [];
        if (specializedFacilitiesSections.length > 1) {
          const duplicates = specializedFacilitiesSections.slice(1);
          for (const dup of duplicates) {
            try {
              await fetch(`${apiUrl}/admin/remove-section/${dup.id}`, { method: 'POST' });
            } catch (err) {
              console.error('Error removing duplicate specialized facilities section:', err);
            }
          }
          fetchDeptDetails();
          return;
        }

        // Self-healing: clean up ALL specialized activities gallery sections under Activities category if they exist
        const specializedActivitiesSections = data.sections?.filter(
          s => s.category === 'activities' && s.content === '[SPECIALIZED_ACTIVITIES_GALLERY]'
        ) || [];
        if (specializedActivitiesSections.length > 0) {
          for (const dup of specializedActivitiesSections) {
            try {
              await fetch(`${apiUrl}/admin/remove-section/${dup.id}`, { method: 'POST' });
            } catch (err) {
              console.error('Error removing specialized activities section:', err);
            }
          }
          fetchDeptDetails();
          return;
        }

        // Auto-create specialized facilities section if it's missing
        const hasSpecialized = specializedFacilitiesSections.length > 0;
        if (!hasSpecialized) {
          try {
            const createRes = await fetch(`${apiUrl}/admin/sections`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                dept_id: parseInt(id),
                title: 'Specialized Facilities Cards Grid',
                category: 'facilities',
                content: '[SPECIALIZED_FACILITIES]',
                order: -100 // Default to the top
              })
            });
            if (createRes.ok) {
              const refreshRes = await fetch(`${apiUrl}/admin/departments/${id}`, {
                cache: 'no-store',
                headers: { 'Cache-Control': 'no-cache' }
              });
              if (refreshRes.ok) {
                const refreshData = await refreshRes.json();
                setDept(refreshData);
                return;
              }
            }
          } catch (createErr) {
            console.error('Error auto-creating specialized facilities section:', createErr);
          }
        }

        // Auto-creation of Specialized Activities Photo Gallery section disabled per user request

        setDept(data);
      }
    } catch (err) {
      console.error('Error fetching details:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlumniTable = async () => {
    try {
      const res = await fetch(`${apiUrl}/admin/alumni/${id}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (res.ok) {
        const data = await res.json();

        // Backwards compatibility for meeting events
        let galleryEvents = data.meeting_images || [];
        if (galleryEvents.length > 0 && typeof galleryEvents[0] === 'string') {
          galleryEvents = [{
            title: data.meeting_title || 'Past Alumni Meeting',
            images: galleryEvents
          }];
        }
        data.meeting_images = galleryEvents;

        setAlumniTableData(data);
      }
    } catch (err) {
      console.error('Error fetching alumni table:', err);
    }
  };

  const handleSaveAlumniTable = async () => {
    // Validation: Enforce that NO column is left empty (except Photo and S.No)
    if (alumniTableData.rows && alumniTableData.rows.length > 0 && Array.isArray(alumniTableData.columns)) {
      for (let i = 0; i < alumniTableData.rows.length; i++) {
        const row = alumniTableData.rows[i];

        for (const col of alumniTableData.columns) {
          const lowerCol = col.toLowerCase();
          // Skip validation for photo/image columns or auto-generated S.No
          if (lowerCol.includes('photo') || lowerCol.includes('image') || col === 'S.No') {
            continue;
          }

          const cellValue = String(row[col] || '').trim();
          if (!cellValue) {
            alert("Please fill in all required text cells in the table.");
            return;
          }
        }
      }
    }

    try {
      const res = await fetch(`${apiUrl}/admin/alumni/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alumniTableData)
      });
      if (res.ok) {
        alert('Alumni table saved successfully!');
        fetchAlumniTable();
        setView('dashboard');
      } else {
        alert('Failed to save alumni table.');
      }
    } catch (err) {
      console.error('Error saving alumni table:', err);
      alert('Error saving alumni table.');
    }
  };

  const handleSaveSingleAlumni = async (e) => {
    e.preventDefault();
    if (!alumniFormData['Name of the Student']?.trim() ||
      !alumniFormData['Present designation']?.trim() ||
      !alumniFormData['Place of work']?.trim() ||
      !alumniFormData['Programme Studied']?.trim() ||
      !alumniFormData['Year Passed']?.trim() ||
      (!alumniFormData['Photo']?.trim() && !alumniImageFile)) {
      alert("Please fill in all the required fields for the alumni record.");
      return;
    }
    setAlumniUploading(true);

    let photoUrl = alumniFormData['Photo'] || '';

    // Upload image if selected
    if (alumniImageFile) {
      const formData = new FormData();
      formData.append('file', alumniImageFile);
      try {
        const uploadRes = await fetch(`${apiUrl}/admin/alumni/upload`, {
          method: 'POST',
          body: formData
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          photoUrl = uploadData.url;
        }
      } catch (err) {
        console.error("Upload error:", err);
      }
    }

    const newRow = { ...alumniFormData, 'Photo': photoUrl };

    // Standardize columns
    const standardCols = ["S.No", "Photo", "Name of the Student", "Present designation", "Place of work", "Programme Studied", "Year Passed"];
    const currentCols = alumniTableData.columns.length > 0 ? alumniTableData.columns : standardCols;

    // Ensure all columns exist in the new row
    currentCols.forEach(col => {
      if (newRow[col] === undefined) newRow[col] = '';
    });

    let updatedRows = [...alumniTableData.rows];
    if (activeAlumni && activeAlumni.originalIndex !== undefined) {
      updatedRows[activeAlumni.originalIndex] = newRow;
    } else {
      updatedRows.push(newRow);
    }

    // Auto-recalculate S.No
    updatedRows = updatedRows.map((row, idx) => ({ ...row, 'S.No': `${idx + 1}.` }));

    const payload = {
      ...alumniTableData,
      columns: currentCols,
      rows: updatedRows
    };

    try {
      const res = await fetch(`${apiUrl}/admin/alumni/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert('Alumni member saved successfully!');
        fetchAlumniTable();
        setView('alumni-manager');
      } else {
        alert('Failed to save alumni member.');
      }
    } catch (err) {
      console.error('Error saving alumni:', err);
      alert('Error saving alumni.');
    } finally {
      setAlumniUploading(false);
    }
  };

  const handleSaveSingleEvent = async (e) => {
    e.preventDefault();
    if (!eventFormData.title?.trim() || !eventFormData.images || eventFormData.images.length === 0) {
      alert("Please enter the event title and upload at least one image.");
      return;
    }
    setAlumniUploading(true);

    let updatedEvents = [...(alumniTableData.meeting_images || [])];

    if (activeEvent && activeEvent.originalIndex !== undefined) {
      updatedEvents[activeEvent.originalIndex] = eventFormData;
    } else {
      updatedEvents.push(eventFormData);
    }

    const payload = {
      ...alumniTableData,
      meeting_images: updatedEvents
    };

    try {
      const res = await fetch(`${apiUrl}/admin/alumni/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert('Event saved successfully!');
        fetchAlumniTable();
        setView('alumni-manager');
      } else {
        alert('Failed to save event.');
      }
    } catch (err) {
      console.error('Error saving event:', err);
      alert('Error saving event.');
    } finally {
      setAlumniUploading(false);
    }
  };

  const fetchPlacementTable = async () => {
    try {
      const res = await fetch(`${apiUrl}/admin/placement/${id}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (res.ok) {
        const data = await res.json();
        const standardCols = ["S.No", "Photo", "Name of the Student", "Present designation", "Place of work", "Programme Studied", "Year Passed"];

        // Migrate legacy formats immediately if they exist in rows
        if (data.rows && data.rows.length > 0) {
          data.rows = data.rows.map(row => {
            const migrated = { ...row };
            if (row['Name of the Employer with contact details / Place of placement'] !== undefined) {
              migrated['Place of work'] = row['Name of the Employer with contact details / Place of placement'];
            }
            if (row['Pay package'] !== undefined) {
              migrated['Present designation'] = row['Pay package'];
            }
            if (row['Year of Passing'] !== undefined) {
              migrated['Year Passed'] = row['Year of Passing'];
            }
            return migrated;
          });
        }

        data.columns = standardCols;

        let galleryEvents = data.meeting_images || [];
        if (galleryEvents.length > 0 && typeof galleryEvents[0] === 'string') {
          galleryEvents = [{
            title: data.meeting_title || 'Past Placement Event',
            images: galleryEvents
          }];
        }
        data.meeting_images = galleryEvents;
        setPlacementTableData(data);
      }
    } catch (err) {
      console.error('Error fetching placement table:', err);
    }
  };

  const handleSavePlacementTable = async () => {
    const isNewFormat = placementTableData.rows && placementTableData.rows.some(r => r.type && (r.type === 'student' || r.type === 'year_header' || r.type === 'image'));

    if (!isNewFormat && placementTableData.rows && placementTableData.rows.length > 0 && Array.isArray(placementTableData.columns)) {
      for (let i = 0; i < placementTableData.rows.length; i++) {
        const row = placementTableData.rows[i];
        for (const col of placementTableData.columns) {
          const lowerCol = col.toLowerCase();
          if (lowerCol.includes('photo') || lowerCol.includes('image') || col === 'S.No') {
            continue;
          }
          const cellValue = String(row[col] || '').trim();
          if (!cellValue) {
            alert("Please fill in all required text cells in the table.");
            return;
          }
        }
      }
    }

    try {
      const res = await fetch(`${apiUrl}/admin/placement/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(placementTableData)
      });
      if (res.ok) {
        alert('Placement student details table saved successfully!');
        fetchPlacementTable();
        setView('dashboard');
      } else {
        alert('Failed to save placement table.');
      }
    } catch (err) {
      console.error('Error saving placement table:', err);
      alert('Error saving placement table.');
    }
  };

  const handleSaveSinglePlacement = async (e) => {
    e.preventDefault();
    if (!placementFormData['Name of the Student']?.trim() ||
      !placementFormData['Present designation']?.trim() ||
      !placementFormData['Place of work']?.trim() ||
      !placementFormData['Programme Studied']?.trim() ||
      !placementFormData['Year Passed']?.trim() ||
      (!placementFormData['Photo']?.trim() && !placementImageFile)) {
      alert("Please fill in all required fields for the placement record.");
      return;
    }
    setPlacementUploading(true);

    let photoUrl = placementFormData['Photo'] || '';
    if (placementImageFile) {
      const formData = new FormData();
      formData.append('file', placementImageFile);
      try {
        const uploadRes = await fetch(`${apiUrl}/admin/placement/upload`, {
          method: 'POST',
          body: formData
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          photoUrl = uploadData.url;
        }
      } catch (err) {
        console.error("Upload error:", err);
      }
    }

    const newRow = { ...placementFormData, 'Photo': photoUrl };
    const standardCols = ["S.No", "Photo", "Name of the Student", "Present designation", "Place of work", "Programme Studied", "Year Passed"];
    const currentCols = standardCols;

    currentCols.forEach(col => {
      if (newRow[col] === undefined) newRow[col] = '';
    });

    let updatedRows = [...placementTableData.rows];

    // Migrate old keys in any existing rows if they are being updated
    updatedRows = updatedRows.map(row => {
      const migrated = { ...row };
      if (row['Name of the Employer with contact details / Place of placement'] !== undefined) {
        migrated['Place of work'] = row['Name of the Employer with contact details / Place of placement'];
      }
      if (row['Pay package'] !== undefined) {
        migrated['Present designation'] = row['Pay package'];
      }
      if (row['Year of Passing'] !== undefined) {
        migrated['Year Passed'] = row['Year of Passing'];
      }
      return migrated;
    });

    if (activePlacement && activePlacement.originalIndex !== undefined) {
      updatedRows[activePlacement.originalIndex] = newRow;
    } else {
      updatedRows.push(newRow);
    }

    updatedRows = updatedRows.map((row, idx) => ({ ...row, 'S.No': `${idx + 1}.` }));

    const payload = {
      ...placementTableData,
      columns: currentCols,
      rows: updatedRows
    };

    try {
      const res = await fetch(`${apiUrl}/admin/placement/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert('Placement student details saved successfully!');
        fetchPlacementTable();
        setView('placement-manager');
      } else {
        alert('Failed to save placement record.');
      }
    } catch (err) {
      console.error('Error saving placement:', err);
      alert('Error saving placement.');
    } finally {
      setPlacementUploading(false);
    }
  };

  const handleSaveSinglePlacementEvent = async (e) => {
    e.preventDefault();
    if (!placementEventFormData.title?.trim() || !placementEventFormData.images || placementEventFormData.images.length === 0) {
      alert("Please enter the event title and upload at least one image.");
      return;
    }
    setPlacementUploading(true);

    let updatedEvents = [...(placementTableData.meeting_images || [])];
    if (activePlacementEvent && activePlacementEvent.originalIndex !== undefined) {
      updatedEvents[activePlacementEvent.originalIndex] = placementEventFormData;
    } else {
      updatedEvents.push(placementEventFormData);
    }

    const payload = {
      ...placementTableData,
      meeting_images: updatedEvents
    };

    try {
      const res = await fetch(`${apiUrl}/admin/placement/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert('Placement event saved successfully!');
        fetchPlacementTable();
        setView('placement-manager');
      } else {
        alert('Failed to save placement event.');
      }
    } catch (err) {
      console.error('Error saving placement event:', err);
      alert('Error saving placement event.');
    } finally {
      setPlacementUploading(false);
    }
  };

  useEffect(() => {
    if (id) {
      setTimeout(() => {
        setView('dashboard');
      }, 0);
      fetchDeptDetails();
      fetchActivityGallery();
    }
  }, [id]);

  useEffect(() => {
    if (Array.isArray(phdAwardedRows) && phdAwardedRows.length > 0 && !phdAwardedRows[0].candidates) {
      // Legacy flat array detected, normalize it
      const groupsMap = {};
      phdAwardedRows.forEach(item => {
        const yr = item.award_year || item.award_date || 'General';
        let yearGroup = yr;
        if (yr.includes('.')) {
          const parts = yr.split('.');
          const y = parseInt(parts[parts.length - 1]);
          if (!isNaN(y)) yearGroup = `${y - 1} - ${y}`;
        } else if (yr.match(/^\d{4}$/)) {
          const y = parseInt(yr);
          yearGroup = `${y - 1} - ${y}`;
        }
        if (!groupsMap[yearGroup]) groupsMap[yearGroup] = [];
        groupsMap[yearGroup].push({
          sno: item.sno || '1',
          scholar_name: item.scholar_name || item.name || '',
          supervisor: item.supervisor || '',
          thesis_title: item.thesis_title || '',
          award_date: item.award_date || item.award_year || ''
        });
      });
      const normalized = Object.keys(groupsMap).map(yr => {
        const cands = groupsMap[yr];
        cands.forEach((c, idx) => { c.sno = `${idx + 1}`; });
        return { year: yr, candidates: cands };
      });
      setTimeout(() => {
        setPhdAwardedRows(normalized);
      }, 0);
    }
  }, [phdAwardedRows]);

  const handleSaveSection = async (e) => {
    if (e) e.preventDefault();

    const isSyllabusOrProgrammes = activeCategory?.slug === 'syllabus' || activeCategory?.slug === 'programmes';
    
    let sectionTitle = activeSection.section_title;
    // Automatically default section title for Syllabus and Programmes since input is hidden
    if (isSyllabusOrProgrammes && (!sectionTitle || !sectionTitle.trim())) {
      sectionTitle = activeCategory.name;
    }

    const hasNoTitle = !sectionTitle?.trim();
    
    let finalContent = activeSection.content;
    if (activeCategory?.slug === 'activities' && activeBuilderTab === 'image') {
      if (sectionGalleryEvents.length === 0) {
        alert("⚠️ Please add at least one event with photos to the Event Gallery before saving.");
        return;
      }
      finalContent = '[SECTION_GALLERY]' + JSON.stringify(sectionGalleryEvents);
    }

    const isContentEmpty = !finalContent ||
      finalContent.trim() === '' ||
      (!finalContent.startsWith('[SECTION_GALLERY]') && finalContent.replace(/<p>\s*<br\s*\/?>\s*<\/p>/g, '').trim() === '');
    
    const trCount = (finalContent?.match(/<tr\b[^>]*>/gi) || []).length;
    const isTableEmpty = isSyllabusOrProgrammes && trCount <= 1;

    if (!isSyllabusOrProgrammes && hasNoTitle) {
      alert("⚠️ Section title is required.");
      return;
    }

    if (isContentEmpty) {
      alert("⚠️ Section content is required. Please fill in the content before saving.");
      return;
    }

    if (isTableEmpty) {
      alert("⚠️ Empty sections cannot be created. Please add at least one row to the table before saving.");
      return;
    }

    const method = activeSection.id ? 'PUT' : 'POST';
    const endpoint = activeSection.id ? `${apiUrl}/admin/sections/${activeSection.id}` : `${apiUrl}/admin/sections`;

    try {
      const res = await fetch(endpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dept_id: parseInt(id),
          title: sectionTitle,
          category: activeCategory.slug,
          content: finalContent
        })
      });
      if (res.ok) {
        alert(method === 'POST' ? '✓ Section created successfully!' : '✓ Section updated successfully!');
        setView('category');
        fetchDeptDetails();
      }
    } catch (err) { alert('Error saving section'); }
  };

  const handleFinishActivitiesTable = async () => {
    if (!activityTableTitle?.trim() ||
      activityCustomTableData.headers.length === 0 ||
      activityCustomTableData.rows.length === 0 ||
      activityCustomTableData.rows.some(row => row.some(cell => !cell?.trim()))) {
      alert("Please ensure all table headers and cells are filled before completing.");
      return;
    }

    // Compile dynamic custom table data into university styled responsive HTML
    let tableHtml = '';
    if (activityTableTitle) {
      tableHtml += `<h3 style="color: #333; font-size: 20px; font-weight: bold; margin-top: 30px; margin-bottom: 15px; text-transform: uppercase; border-bottom: 2px solid #990033; padding-bottom: 8px; font-family: Arial, sans-serif;">${activityTableTitle}</h3>`;
    }
    tableHtml += `<table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-family: Arial, sans-serif; border: 1px solid #dee2e6; box-shadow: 0 4px 10px rgba(0,0,0,0.03);">`;
    
    if (tableMode !== 'standard') {
      tableHtml += `<thead><tr style="background-color: #f8f9fa; border-bottom: 2px solid #990033;">`;
      activityCustomTableData.headers.forEach(header => {
        tableHtml += `<th style="padding: 15px 12px; text-align: left; font-weight: bold; color: #333; font-size: 14px; border: 1px solid #dee2e6; text-transform: uppercase;">${header}</th>`;
      });
      tableHtml += `</tr></thead>`;
    }
    
    tableHtml += `<tbody>`;
    activityCustomTableData.rows.forEach((row, idx) => {
      const bg = idx % 2 === 1 ? '#f9fafb' : '#ffffff';
      tableHtml += `<tr style="background-color: ${bg}; border-bottom: 1px solid #dee2e6;">`;
      row.forEach(cell => {
        const formattedCell = (cell || '').replace(/\n/g, '<br />');
        tableHtml += `<td style="padding: 15px 12px; text-align: left; color: #444; font-size: 13.5px; border: 1px solid #dee2e6; line-height: 1.6; vertical-align: top;">${formattedCell}</td>`;
      });
      tableHtml += `</tr>`;
    });
    tableHtml += `</tbody></table>`;

    // Preserve any existing PDF button in activeSection.content so they coexist beautifully
    let existingPdfBtn = '';
    if (activeSection && activeSection.content) {
      const pdfBtnMatch = activeSection.content.match(/<div[^>]*>[\s\S]*?<svg[\s\S]*?<\/svg>[\s\S]*?<\/div>/i);
      if (pdfBtnMatch) {
        existingPdfBtn = pdfBtnMatch[0] + "\n";
      }
    }
    const finalContent = existingPdfBtn + tableHtml;

    const method = activeSection.id ? 'PUT' : 'POST';
    const endpoint = activeSection.id ? `${apiUrl}/admin/sections/${activeSection.id}` : `${apiUrl}/admin/sections`;

    try {
      setUploading(true);
      const res = await fetch(endpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dept_id: parseInt(id),
          title: activeSection.section_title || 'Activities Table',
          category: activeCategory.slug,
          content: finalContent
        })
      });
      if (res.ok) {
        alert('✓ Table section updated and pushed successfully to public site!');
        setIsActivitiesTableInserted(false);
        setView(activeCategory.slug === 'facilities' ? 'facilities-manager' : 'category');
        fetchDeptDetails();
        setActivityTableTitle('');
        setActivityCustomTableData({ headers: [], rows: [] });
      } else {
        alert('Failed to save table section');
      }
    } catch (err) {
      alert('Error saving section');
    } finally {
      setUploading(false);
    }
  };

  const deleteSection = async (secId) => {
    try {
      const res = await fetch(`${apiUrl}/admin/remove-section/${secId}`, { method: 'POST' });
      if (res.ok) {
        showToast('Section deleted successfully!', 'success');
        fetchDeptDetails();
        return true;
      } else {
        showToast('Failed to delete section.', 'error');
        return false;
      }
    } catch (err) {
      console.error(err);
      showToast('Error deleting section.', 'error');
      return false;
    }
  };

  const handleMoveSection = async (secId, direction) => {
    if (!dept || !dept.sections) return;

    // Find the section and its category
    const section = dept.sections.find(s => s.id === secId);
    if (!section) return;

    const category = section.category;

    // Filter sections belonging to this category
    const catSections = dept.sections.filter(s => s.category === category);
    const index = catSections.findIndex(s => s.id === secId);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= catSections.length) return;

    const currentItem = catSections[index];
    const swapItem = catSections[targetIndex];

    // Swap their order_index
    const currentOrder = currentItem.order_index || 0;
    const swapOrder = swapItem.order_index || 0;

    const newCurrentOrder = currentOrder === swapOrder ? swapOrder - 1 : swapOrder;
    const newSwapOrder = currentOrder;

    try {
      setUploading(true);
      const update1 = await fetch(`${apiUrl}/admin/sections/${currentItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: newCurrentOrder })
      });

      const update2 = await fetch(`${apiUrl}/admin/sections/${swapItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: newSwapOrder })
      });

      if (update1.ok && update2.ok) {
        await fetchDeptDetails();
      } else {
        alert('Failed to save display order.');
      }
    } catch (err) {
      console.error('Error reordering sections:', err);
      alert('Error changing display order.');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveFaculty = async (e) => {
    e.preventDefault();
    if (!facultyFormData.name?.trim() ||
      !facultyFormData.designation?.trim() ||
      !facultyFormData.email?.trim() ||
      !facultyFormData.specialization?.trim() ||
      !facultyFormData.profile_url?.trim() ||
      (!facultyFormData.image_url?.trim() && !facultyImageFile)) {
      alert("Please fill in all the required faculty details.");
      return;
    }
    setUploading(true);
    let finalImageUrl = facultyFormData.image_url;

    // If a new image file is selected, upload it first
    if (facultyImageFile) {
      const formData = new FormData();
      formData.append('file', facultyImageFile);
      formData.append('folder', 'faculties');
      try {
        const upRes = await fetch(`${apiUrl}/admin/upload?folder=faculties`, {
          method: 'POST',
          body: formData
        });
        const upData = await upRes.json();
        if (!upRes.ok) throw new Error(upData.detail || 'Image upload failed');
        finalImageUrl = upData.url;
      } catch (err) { alert('Image upload failed: ' + err.message); setUploading(false); return; }
    }

    const isUpdate = activeFaculty?.id;
    const method = isUpdate ? 'PUT' : 'POST';
    const endpoint = isUpdate ? `${apiUrl}/admin/faculties/${activeFaculty.id}` : `${apiUrl}/admin/faculties`;

    try {
      const res = await fetch(endpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dept_id: parseInt(id),
          ...facultyFormData,
          order: parseInt(facultyFormData.order_index || 0),
          image_url: finalImageUrl
        })
      });
      if (res.ok) {
        setView('faculty-manager');
        setActiveFaculty(null);
        setFacultyFormData({ name: '', designation: '', email: '', specialization: '', is_former: 0, order_index: 0, image_url: '', profile_url: '' });
        setFacultyImageFile(null);
        fetchDeptDetails();
      }
    } catch (err) { alert('Error saving faculty'); }
    setUploading(false);
  };

  const deleteFaculty = async (fId) => {
    const facultyMember = dept?.faculties?.find(f => f.id === fId);
    const confirmed = await showConfirm({
      title: 'Delete Faculty Member',
      message: 'Are you sure you want to delete this faculty member?',
      itemName: facultyMember ? facultyMember.name : `Faculty Member #${fId}`
    });
    if (!confirmed) return;
    await fetch(`${apiUrl}/admin/remove-faculty/${fId}`, { method: 'POST' });
    fetchDeptDetails();
  };

  const handleSaveVisitingFacultyTable = async () => {
    if (visitingFacultyRows.length === 0) {
      alert("Please add at least one visiting faculty row.");
      return;
    }
    for (const row of visitingFacultyRows) {
      if (!row.no_visited?.trim() || !row.dates_visited?.trim() || !row.professors || row.professors.length === 0) {
        alert("Please fill in all visiting faculty fields.");
        return;
      }
      for (const prof of row.professors) {
        if (!prof?.trim()) {
          alert("Please fill in all professor fields.");
          return;
        }
      }
    }
    let tableHtml = `
<table style="width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; font-family: 'Outfit', 'Inter', sans-serif;">
  <thead>
    <tr style="border-bottom: 2px solid #e2e8f0; background-color: #f8fafc;">
      <th style="padding: 16px; border: 1px solid #e2e8f0; text-align: left; font-weight: 700; color: #1e293b; font-size: 15px; width: 20%;">No of Professors Visited</th>
      <th style="padding: 16px; border: 1px solid #e2e8f0; text-align: left; font-weight: 700; color: #1e293b; font-size: 15px; width: 60%;">Particulars of Visiting Professors</th>
      <th style="padding: 16px; border: 1px solid #e2e8f0; text-align: left; font-weight: 700; color: #1e293b; font-size: 15px; width: 20%;">Dates visited</th>
    </tr>
  </thead>
  <tbody>
    `.trim();

    visitingFacultyRows.forEach((row, idx) => {
      const bg = idx % 2 === 1 ? '#f9fafb' : '#ffffff';
      tableHtml += `
    <tr style="border-bottom: 1px solid #e2e8f0; background-color: ${bg};">
      <td style="padding: 16px; border: 1px solid #e2e8f0; color: #334155; font-size: 14px; text-align: left; vertical-align: middle; font-weight: 600;">${row.no_visited || ''}</td>
      <td style="padding: 16px; border: 1px solid #e2e8f0; color: #334155; font-size: 14.5px; text-align: left; line-height: 1.6;">
      `;

      row.professors.forEach((profText, profIdx) => {
        const lines = (profText || '').split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length > 0) {
          const name = lines[0];
          const rest = lines.slice(1).join('<br/>');
          const marginStyle = profIdx < row.professors.length - 1 ? 'margin-bottom: 16px;' : '';
          tableHtml += `
        <div style="${marginStyle}">
          <strong>${name}</strong><br/>
          ${rest}
        </div>
          `.trim();
        }
      });

      tableHtml += `
      </td>
      <td style="padding: 16px; border: 1px solid #e2e8f0; color: #475569; font-size: 14px; text-align: left; vertical-align: middle;">${row.dates_visited || ''}</td>
    </tr>
      `;
    });

    tableHtml += `
  </tbody>
</table>
    `.trim();

    const method = activeSection.id ? 'PUT' : 'POST';
    const endpoint = activeSection.id ? `${apiUrl}/admin/sections/${activeSection.id}` : `${apiUrl}/admin/sections`;

    try {
      setUploading(true);
      const res = await fetch(endpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dept_id: parseInt(id),
          title: activeSection.section_title || 'Visiting Faculty Details',
          category: activeCategory.slug,
          content: tableHtml
        })
      });
      if (res.ok) {
        alert('✓ Visiting Faculty table updated and saved successfully!');
        setView('dashboard');
        fetchDeptDetails();
      } else {
        alert('Failed to save visiting faculty table.');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving section');
    } finally {
      setUploading(false);
    }
  };

  const handleSavePhdAwardedTable = async () => {
    if (phdAwardedRows.length === 0) {
      alert("Please add at least one Ph.D. awarded record.");
      return;
    }
    for (const group of phdAwardedRows) {
      if (!group.year?.trim() || !group.candidates || group.candidates.length === 0) {
        alert("Please enter the year and candidates details.");
        return;
      }
      for (const row of group.candidates) {
        if (!row.sno?.trim() || !row.scholar_name?.trim() || !row.supervisor?.trim() || !row.award_date?.trim()) {
          alert("Please fill in all candidate fields (S.No, Scholar Name, Research Supervisor, Award Date).");
          return;
        }
      }
    }
    let tableHtml = `
<table style="width: 100%; border-collapse: collapse; font-family: 'Outfit', 'Inter', sans-serif;">
  <thead>
    <tr style="border-bottom: 2px solid #dee2e6;">
      <th style="padding: 12px 8px; text-align: left; font-weight: 700; color: #333333; font-size: 14px; width: 6%;">S.No</th>
      <th style="padding: 12px 8px; text-align: left; font-weight: 700; color: #333333; font-size: 14px; width: 20%;">Name of the Scholar</th>
      <th style="padding: 12px 8px; text-align: left; font-weight: 700; color: #333333; font-size: 14px; width: 20%;">Research Supervisor</th>
      <th style="padding: 12px 8px; text-align: left; font-weight: 700; color: #333333; font-size: 14px; width: 42%;">Title of the Thesis</th>
      <th style="padding: 12px 8px; text-align: left; font-weight: 700; color: #333333; font-size: 14px; width: 12%;">Date of Award</th>
    </tr>
  </thead>
  <tbody>
    `.trim();

    phdAwardedRows.forEach((group) => {
      tableHtml += `
    <!-- ${group.year} Group -->
    <tr style="background-color: #1ca3bc;">
      <td colspan="5" style="padding: 10px; text-align: center; font-weight: 700; color: #ffffff; font-size: 14px; letter-spacing: 0.5px;">${group.year}</td>
    </tr>
      `.trim();

      group.candidates.forEach((row, idx) => {
        const bg = idx % 2 === 1 ? '#eaeaea' : '#ffffff';
        const snoVal = row.sno || `${idx + 1}`;
        tableHtml += `
    <tr style="border-bottom: 1px solid #eaeaea; background-color: ${bg};">
      <td style="padding: 12px 8px; color: #555555; font-size: 13.5px; text-align: left; vertical-align: top;">${snoVal}</td>
      <td style="padding: 12px 8px; color: #333333; font-size: 13.5px; text-align: left; vertical-align: top;">${row.scholar_name || ''}</td>
      <td style="padding: 12px 8px; color: #333333; font-size: 13.5px; text-align: left; vertical-align: top;">${row.supervisor || ''}</td>
      <td style="padding: 12px 8px; color: #555555; font-size: 13.5px; text-align: left; vertical-align: top; line-height: 1.5;">${row.thesis_title || ''}</td>
      <td style="padding: 12px 8px; color: #333333; font-size: 13.5px; text-align: left; vertical-align: top;">${row.award_date || ''}</td>
    </tr>
        `;
      });
    });

    tableHtml += `
  </tbody>
</table>
    `.trim();

    const method = activeSection.id ? 'PUT' : 'POST';
    const endpoint = activeSection.id ? `${apiUrl}/admin/sections/${activeSection.id}` : `${apiUrl}/admin/sections`;

    try {
      setUploading(true);
      const res = await fetch(endpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dept_id: parseInt(id),
          title: activeSection.section_title || 'Ph.D. Awarded Details',
          category: activeCategory.slug,
          content: tableHtml
        })
      });
      if (res.ok) {
        alert('✓ Ph.D. Awarded table updated and saved successfully!');
        setView('dashboard');
        fetchDeptDetails();
      } else {
        alert('Failed to save Ph.D. Awarded table.');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving section');
    } finally {
      setUploading(false);
    }
  };

  const saveDstFacultyRowsDirectly = async (rowsToSave) => {
    let htmlContent = '';
    rowsToSave.forEach((member, index) => {
      if (index === 0) {
        htmlContent += `
<div style="font-family: Arial, sans-serif; font-size: 14.5px; color: #333333; line-height: 1.8; padding-top: 10px; padding-left: 25px;">
  ${member.name || ''}<br/>
  Email:<a href="mailto:${member.email || ''}" style="color: #990033; text-decoration: none;">${member.email || ''}</a><br/>
  Mobile : ${member.mobile || ''}
</div>
        `.trim();
      } else {
        htmlContent += `\n<div style="font-family: Arial, sans-serif; font-size: 14.5px; color: #333333; line-height: 1.8; padding-top: 20px; padding-left: 25px; border-top: 1px dashed #eee; margin-top: 20px;">
  ${member.name || ''}<br/>
  Email:<a href="mailto:${member.email || ''}" style="color: #990033; text-decoration: none;">${member.email || ''}</a><br/>
  Mobile : ${member.mobile || ''}
</div>`.trim();
      }
    });

    const method = activeSection.id ? 'PUT' : 'POST';
    const endpoint = activeSection.id ? `${apiUrl}/admin/sections/${activeSection.id}` : `${apiUrl}/admin/sections`;

    try {
      setUploading(true);
      const res = await fetch(endpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dept_id: parseInt(id),
          title: activeSection.section_title || 'DST-Faculty Details',
          category: 'dst-faculty',
          content: htmlContent
        })
      });
      if (res.ok) {
        const updatedSection = await res.json();
        setActiveSection(updatedSection);
        fetchDeptDetails();
      } else {
        console.error("Failed to auto-save DST-Faculty details.");
      }
    } catch (err) {
      console.error("Error auto-saving DST-Faculty details:", err);
    } finally {
      setUploading(false);
    }
  };

  const saveMuseumContentDirectly = async (contentObj) => {
    if (!contentObj.importance_list_title?.trim() ||
      !contentObj.fossils || contentObj.fossils.some(f => !f.name?.trim() || !f.image?.trim()) ||
      !contentObj.minerals || contentObj.minerals.some(m => !m.name?.trim() || !m.image?.trim())) {
      alert("Please fill in the museum title, fossil details, and mineral details before saving.");
      return;
    }
    const method = activeSection?.id ? 'PUT' : 'POST';
    const endpoint = activeSection?.id ? `${apiUrl}/admin/sections/${activeSection.id}` : `${apiUrl}/admin/sections`;

    try {
      setUploading(true);
      const res = await fetch(endpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dept_id: parseInt(id),
          title: activeSection?.section_title || 'Museum Details',
          category: 'museum',
          content: JSON.stringify(contentObj)
        })
      });
      if (res.ok) {
        const updatedSection = await res.json();
        setActiveSection(updatedSection);
        fetchDeptDetails();
      } else {
        console.error("Failed to auto-save Museum content.");
      }
    } catch (err) {
      console.error("Error auto-saving Museum content:", err);
    } finally {
      setUploading(false);
    }
  };

  const saveBestPracticesContentDirectly = async (contentObj) => {
    const method = activeSection?.id ? 'PUT' : 'POST';
    const endpoint = activeSection?.id ? `${apiUrl}/admin/sections/${activeSection.id}` : `${apiUrl}/admin/sections`;

    try {
      setUploading(true);
      const res = await fetch(endpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dept_id: parseInt(id),
          title: activeSection?.section_title || 'Best Practices Details',
          category: 'best-practices',
          content: JSON.stringify(contentObj)
        })
      });
      if (res.ok) {
        const updatedSection = await res.json();
        setActiveSection(updatedSection);
        fetchDeptDetails();
      } else {
        console.error("Failed to auto-save Best Practices content.");
      }
    } catch (err) {
      console.error("Error auto-saving Best Practices content:", err);
    } finally {
      setUploading(false);
    }
  };

  const saveFinanceDetailsContentDirectly = async (contentObj) => {
    const method = activeSection?.id ? 'PUT' : 'POST';
    const endpoint = activeSection?.id ? `${apiUrl}/admin/sections/${activeSection.id}` : `${apiUrl}/admin/sections`;

    try {
      setUploading(true);
      const res = await fetch(endpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dept_id: parseInt(id),
          title: activeSection?.section_title || 'Finance Details',
          category: 'finance-details',
          content: JSON.stringify(contentObj)
        })
      });
      if (res.ok) {
        const updatedSection = await res.json();
        setActiveSection(updatedSection);
        fetchDeptDetails();
      } else {
        console.error("Failed to auto-save Finance Details.");
      }
    } catch (err) {
      console.error("Error auto-saving Finance Details:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleMuseumImageUpload = async (file, type, idx) => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`${apiUrl}/admin/upload?folder=facilities`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const uploadData = await res.json();
        const current = [...(museumContent[type] || [])];
        current[idx].image = uploadData.url;
        const updatedContent = { ...museumContent, [type]: current };
        setMuseumContent(updatedContent);
        // Automatically save to the database directly
        await saveMuseumContentDirectly(updatedContent);
      } else {
        const errData = await res.json();
        alert('Upload failed: ' + (errData.detail || 'Please try again.'));
      }
    } catch (err) {
      console.error("Error uploading museum image:", err);
      alert("Error uploading image file.");
    } finally {
      setUploading(false);
    }
  };

  const getImageUrl = (url, typeOrIsMineral = 'fossils') => {
    const defaultFossil = 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80';
    const defaultMineral = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80';
    const defaultOre = 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?auto=format&fit=crop&w=400&q=80';
    if (!url || url.trim() === '') {
      if (typeOrIsMineral === true || typeOrIsMineral === 'minerals') return defaultMineral;
      if (typeOrIsMineral === 'ores') return defaultOre;
      return defaultFossil;
    }
    if (url.startsWith('http')) return url;
    const backendBase = (process.env.NEXT_PUBLIC_API_URL || '/api').replace('/api', '');
    if (url.startsWith('/api/uploads')) {
      return `${backendBase}${url}`;
    }
    if (url.startsWith('/uploads')) {
      return `${backendBase}${url}`;
    }
    if (url.startsWith('/')) {
      return `${backendBase}${url}`;
    }
    return url;
  };

  const getItemCountText = (catSlug) => {
    if (catSlug === 'faculty') {
      const facultyCount = dept.faculties ? dept.faculties.length : 0;
      return `${facultyCount} Member${facultyCount !== 1 ? 's' : ''}`;
    }
    const count = dept.sections ? dept.sections.filter(s => s.category === catSlug).length : 0;
    return `${count} Section${count !== 1 ? 's' : ''}`;
  };



  // ─── Banner Image ───────────────────────────────────────────────────────────
  const handleUpdateBannerImage = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'banner');
      const uploadRes = await fetch(`${apiUrl}/admin/upload`, { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.detail || 'Upload failed');
      const { url } = uploadData;

      const patchRes = await fetch(`${apiUrl}/admin/departments/${id}?banner_image=${encodeURIComponent(url)}`, { method: 'PUT' });
      if (!patchRes.ok) throw new Error('Save failed');

      setDept(prev => ({ ...prev, banner_image: url }));
      alert('Banner image updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update banner image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveBannerImage = async () => {
    const confirmed = await showConfirm({
      title: 'Remove Banner Image',
      message: 'Are you sure you want to remove the department banner image?',
      itemName: 'Banner Image'
    });
    if (!confirmed) return;
    setUploading(true);
    try {
      const patchRes = await fetch(`${apiUrl}/admin/departments/${id}?banner_image=`, { method: 'PUT' });
      if (!patchRes.ok) throw new Error('Remove failed');
      setDept(prev => ({ ...prev, banner_image: '' }));
      alert('Banner image removed.');
    } catch (err) {
      console.error(err);
      alert('Failed to remove banner image.');
    } finally {
      setUploading(false);
    }
  };

  const hasCustomManager = (slug) => {
    return [
      'faculty', 'alumni', 'visiting-faculty', 'phd-awarded', 'dst-faculty',
      'museum', 'best-practices', 'finance-details', 'gallery', 'energy-environment-park',
      'student-project', 'facilities', 'placement', 'guest-faculty'
    ].includes(slug);
  };

  const hasDynamicSection = (slug) => {
    return dept?.sections?.some(s => s.category === slug) || false;
  };

  const hasCustomDataOnly = (slug) => {
    if (!dept) return false;

    // Check category-specific data collections
    if (slug === 'faculty') {
      return (dept.faculties && dept.faculties.some(f => f.is_former === 0 || f.is_former === 1)) || false;
    }
    if (slug === 'guest-faculty') {
      return (dept.faculties && dept.faculties.some(f => f.is_former === 2)) || false;
    }
    if (slug === 'facilities') {
      return (dept.facilities && dept.facilities.length > 0) || false;
    }

    if (slug === 'placement') {
      const hasPlacementRows = dept.placement_table && (
        (Array.isArray(dept.placement_table.rows) && dept.placement_table.rows.length > 0) ||
        (typeof dept.placement_table.rows === 'string' && JSON.parse(dept.placement_table.rows || '[]').length > 0)
      );
      return hasPlacementRows || false;
    }
    if (slug === 'gallery') {
      return (dept.activity_gallery && dept.activity_gallery.events && dept.activity_gallery.events.length > 0) || false;
    }

    return false;
  };

  const handleOpenSpecializedManager = (slug) => {
    if (slug === 'faculty') setView('faculty-manager');
    else if (slug === 'alumni') {
      fetchAlumniTable();
      setView('alumni-manager');
    } else if (slug === 'visiting-faculty') {
      const sect = dept.sections?.find(s => s.category === slug);
      if (sect) {
        setActiveSection(sect);
        const parsed = parseVisitingFacultyHtml(sect.content);
        setVisitingFacultyRows(parsed);
      } else {
        setActiveSection({ section_title: 'Visiting Faculty Details', content: '' });
        setVisitingFacultyRows([]);
      }
      setView('visiting-faculty-manager');
    } else if (slug === 'phd-awarded') {
      const sect = dept.sections?.find(s => s.category === slug);
      if (sect) {
        setActiveSection(sect);
        const parsed = parsePhdAwardedHtml(sect.content);
        setPhdAwardedRows(parsed);
      } else {
        setActiveSection({ section_title: 'Ph.D. Awarded Details', content: '' });
        setPhdAwardedRows([]);
      }
      setView('phd-awarded-manager');
    } else if (slug === 'dst-faculty') {
      const sect = dept.sections?.find(s => s.category === slug);
      if (sect) {
        setActiveSection(sect);
        const parsed = parseDstFacultyHtml(sect.content);
        setDstFacultyRows(parsed);
      } else {
        setActiveSection({ section_title: 'DST-Faculty Details', content: '' });
        setDstFacultyRows([]);
      }
      setActiveDstFaculty(null);
      setView('dst-faculty-manager');
    } else if (slug === 'museum') {
      const sect = dept.sections?.find(s => s.category === slug);
      if (sect) {
        setActiveSection(sect);
        try {
          setMuseumContent(JSON.parse(sect.content));
        } catch (e) {
          setMuseumContent(defaultMuseumContent);
        }
      } else {
        setActiveSection({ section_title: 'Museum Details', content: '' });
        setMuseumContent(defaultMuseumContent);
      }
      if (dept?.slug === 'zoology') {
        setActiveMuseumTab('events');
      } else {
        setActiveMuseumTab('intro');
      }
      setView('museum-manager');
    } else if (slug === 'best-practices') {
      const sect = dept.sections?.find(s => s.category === slug);
      if (sect) {
        setActiveSection(sect);
        try {
          setBestPracticesContent(JSON.parse(sect.content));
        } catch (e) {
          setBestPracticesContent({ title: 'BEST PRACTICES', video_url: '', description: 'Best Practices, Periyar University' });
        }
      } else {
        setActiveSection({ section_title: 'Best Practices Details', content: '' });
        setBestPracticesContent({ title: 'BEST PRACTICES', video_url: '', description: 'Best Practices, Periyar University' });
      }
      setView('best-practices-manager');
    } else if (slug === 'finance-details') {
      const sect = dept.sections?.find(s => s.category === slug);
      if (sect) {
        setActiveSection(sect);
        try {
          setFinanceDetailsContent(JSON.parse(sect.content));
        } catch (e) {
          setFinanceDetailsContent([]);
        }
      } else {
        setActiveSection({ section_title: 'Finance Details', content: '' });
        setFinanceDetailsContent([]);
      }
      setView('finance-details-manager');
    } else if (slug === 'gallery') {
      fetchActivityGallery();
      setView('gallery-manager');
    } else if (slug === 'energy-environment-park') {
      fetchEnergyParkSection();
    } else if (slug === 'student-project') {
      fetchStudentProjectsSection();
    } else if (slug === 'facilities') {
      setView('facilities-manager');
    } else if (slug === 'placement') {
      fetchPlacementTable();
      setView('placement-manager');
    } else if (slug === 'guest-faculty') {
      setView('guest-faculty-manager');
    }
  };

  return (
    <EditDepartmentContext.Provider value={{
      hasCustomManager, hasDynamicSection, hasCustomDataOnly, handleOpenSpecializedManager,
      id, router, dept, setDept, loading, setLoading, uploading, setUploading,
      newSection, setNewSection, newLink, setNewLink,
      syllabusFormData, setSyllabusFormData, programmeFormData, setProgrammeFormData,
      ugcFormData, setUgcFormData, journalText, setJournalText, journalFile, setJournalFile,
      conferenceText, setConferenceText, conferenceFile, setConferenceFile,
      journalBuilderMode, setJournalBuilderMode, journalImageFile, setJournalImageFile,
      ugcBuilderMode, setUgcBuilderMode, ugcTableTitle, setUgcTableTitle, ugcTableRows, setUgcTableRows,
      projectsPdfFile, setProjectsPdfFile, existingProjectsPdfUrl, setExistingProjectsPdfUrl,
      activitiesTemplate, setActivitiesTemplate, activitiesFormData, setActivitiesFormData,
      activityCustomTableData, setActivityCustomTableData, activeBuilderTab, setActiveBuilderTab,
      tableMode, setTableMode,
      isActivitiesTableInserted, setIsActivitiesTableInserted, activitiesTableColumnInput, setActivitiesTableColumnInput,
      activityTableTitle, setActivityTableTitle, imageAlign, setImageAlign, imageWidth, setImageWidth,
      imageCaption, setImageCaption, imageFile, setImageFile, pointsTitle, setPointsTitle,
      pointsList, setPointsList, newPointText, setNewPointText, pointIcon, setPointIcon,
      downloadTitle, setDownloadTitle, downloadDesc, setDownloadDesc, downloadStyle, setDownloadStyle,
      downloadFile, setDownloadFile, activityGalleryEvents, setActivityGalleryEvents,
      sectionGalleryEvents, setSectionGalleryEvents,
      activeActivityEvent, setActiveActivityEvent, activityEventFormData, setActivityEventFormData,
      activityGalleryUploading, setActivityGalleryUploading, showTemplateBuilder, setShowTemplateBuilder,
      view, setView, activeCategory, setActiveCategory, activeSection, setActiveSection,
      originalRawContent, setOriginalRawContent, activeFaculty, setActiveFaculty,
      facultyFormData, setFacultyFormData, facultyImageFile, setFacultyImageFile,
      alumniTableData, setAlumniTableData, alumniUploading, setAlumniUploading,
      activeAlumni, setActiveAlumni, alumniFormData, setAlumniFormData, alumniImageFile, setAlumniImageFile,
      activeEvent, setActiveEvent, eventFormData, setEventFormData,
      placementTableData, setPlacementTableData, placementUploading, setPlacementUploading,
      activePlacement, setActivePlacement, placementFormData, setPlacementFormData, placementImageFile, setPlacementImageFile,
      activePlacementEvent, setActivePlacementEvent, placementEventFormData, setPlacementEventFormData,
      visitingFacultyRows, setVisitingFacultyRows, phdAwardedRows, setPhdAwardedRows,
      dstFacultyRows, setDstFacultyRows, activeDstFaculty, setActiveDstFaculty,
      dstFacultyFormData, setDstFacultyFormData, museumContent, setMuseumContent,
      bestPracticesContent, setBestPracticesContent,
      financeDetailsContent, setFinanceDetailsContent,
      activeMuseumTab, setActiveMuseumTab, modalState, setModalState,
      energyParkImages, setEnergyParkImages, energyParkEquipments, setEnergyParkEquipments,
      energyParkUploading, setEnergyParkUploading, newEquipmentInput, setNewEquipmentInput,
      studentProjects, setStudentProjects, studentProjectsUploading, setStudentProjectsUploading,
      studentProjectForm, setStudentProjectForm, editingStudentProjectIdx, setEditingStudentProjectIdx,
      apiUrl, categories, defaultCategories, defaultMuseumContent,
      handleUploadProjectsPdf, handleRemoveProjectsPdf, parseHtmlTableToData,
      parseVisitingFacultyHtml, parsePhdAwardedHtml, parseDstFacultyHtml,
      getCategoryIcon, fetchActivityGallery, fetchStudentProjectsSection,
      handleSaveStudentProjects, handleUploadStudentProjectImage, handleSubmitStudentProject,
      handleEditStudentProject, handleDeleteStudentProject, handleMoveStudentProject,
      fetchEnergyParkSection, handleSaveEnergyPark, handleUploadEnergyParkImage,
      handleDeleteEnergyParkImage, handleAddEquipment, handleDeleteEquipment, handleMoveEquipment,
      fetchDeptDetails, fetchAlumniTable, handleSaveAlumniTable, handleSaveSingleAlumni,
      handleSaveSingleEvent, handleSaveSection, handleFinishActivitiesTable, deleteSection, handleMoveSection,
      fetchPlacementTable, handleSavePlacementTable, handleSaveSinglePlacement, handleSaveSinglePlacementEvent,
      handleSaveFaculty, deleteFaculty, handleSaveVisitingFacultyTable, handleSavePhdAwardedTable,
      saveDstFacultyRowsDirectly, saveMuseumContentDirectly, saveBestPracticesContentDirectly, saveFinanceDetailsContentDirectly, handleMuseumImageUpload, getImageUrl,
      getItemCountText, getDeptIcon, toggleModuleSection,
      handleUpdateBannerImage, handleRemoveBannerImage,
      globalConfirm, showConfirm, globalPrompt, showPrompt
    }}>
      {children}
    </EditDepartmentContext.Provider>
  );
}

export function useEditDepartment() {
  const context = useContext(EditDepartmentContext);
  if (!context) {
    throw new Error('useEditDepartment must be used within an EditDepartmentProvider');
  }
  return context;
}
