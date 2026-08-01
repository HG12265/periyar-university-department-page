'use client';

import React from 'react';

export default function MuseumSection({ content, slug }) {
  // Default values matching the screenshots exactly
  const defaultData = {
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
    ]
  };

  let data = defaultData;
  if (content) {
    try {
      data = JSON.parse(content);
    } catch (e) {
      console.warn("Parsing museum content JSON failed, using defaults");
    }
  }

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

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-8 md:p-12 shadow-sm space-y-10 animate-in fade-in slide-in-from-top-4 duration-500 max-w-5xl mx-auto">
      
      {/* Page Title */}
      <div className="border-b-4 border-[#990033] pb-4">
        <h1 className="text-[#990033] text-3xl md:text-4xl font-extrabold tracking-tight m-0 uppercase">
          MUSEUM
        </h1>
      </div>

      {/* GEOLOGY ONLY SECTIONS */}
      {slug !== 'zoology' && (
        <>
          {/* SECTION 1: INTRODUCTION */}
          <div className="space-y-6">
            <h2 className="text-[#990033] text-xl font-bold tracking-tight m-0 border-b border-slate-100 pb-2">
              Introduction
            </h2>
            {data.intro_text && (
              <p className="text-slate-700 text-sm md:text-[15px] leading-relaxed m-0 font-medium text-justify">
                {data.intro_text}
              </p>
            )}

            {/* Bullet List for Introduction */}
            {data.intro_bullets && data.intro_bullets.length > 0 && (
              <ul className="space-y-4 m-0 pl-6 list-none">
                {data.intro_bullets.map((bullet, idx) => (
                  <li key={idx} className="relative text-slate-700 text-sm md:text-[15px] leading-relaxed font-medium text-justify before:content-['•'] before:absolute before:-left-5 before:text-[#990033] before:text-xl before:font-bold">
                    {bullet}
                  </li>
                ))}
              </ul>
            )}

            {data.intro_outro && (
              <p className="text-slate-700 text-sm md:text-[15px] leading-relaxed m-0 font-medium text-justify">
                {data.intro_outro}
              </p>
            )}
          </div>

          {/* SECTION 2: GEOLOGICAL MUSEUM */}
          <div className="space-y-6">
            <h2 className="text-[#990033] text-xl font-bold tracking-tight m-0 border-b border-slate-100 pb-2">
              Geological Museum
            </h2>
            {data.museum_text1 && (
              <p className="text-slate-700 text-sm md:text-[15px] leading-relaxed m-0 font-medium text-justify">
                {data.museum_text1}
              </p>
            )}
            {data.museum_text2 && (
              <p className="text-slate-700 text-sm md:text-[15px] leading-relaxed m-0 font-medium text-justify">
                {data.museum_text2}
              </p>
            )}

            {/* Geological Collections Can bullet points */}
            {data.collections_can && data.collections_can.length > 0 && (
              <div className="space-y-3 pt-2">
                <p className="text-slate-800 text-sm md:text-[15px] font-bold italic m-0">
                  Geological collections can:
                </p>
                <ul className="space-y-3 m-0 pl-6 list-none">
                  {data.collections_can.map((bullet, idx) => (
                    <li key={idx} className="relative text-slate-700 text-sm md:text-[15px] leading-relaxed font-medium text-justify before:content-['•'] before:absolute before:-left-5 before:text-[#990033] before:text-xl before:font-bold">
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* SECTION 3: IMPORTANCE OF GEOLOGICAL MUSEUM */}
          <div className="space-y-6">
            <h2 className="text-[#990033] text-xl font-bold tracking-tight m-0 border-b border-slate-100 pb-2">
              The importance of Geological Museum
            </h2>
            {data.importance_text1 && (
              <p className="text-slate-700 text-sm md:text-[15px] leading-relaxed m-0 font-medium text-justify">
                {data.importance_text1}
              </p>
            )}
            {data.importance_text2 && (
              <p className="text-slate-700 text-sm md:text-[15px] leading-relaxed m-0 font-medium text-justify">
                {data.importance_text2}
              </p>
            )}
            {data.importance_list_title && (
              <p className="text-slate-700 text-sm md:text-[15px] leading-relaxed m-0 font-medium text-justify font-bold text-[#990033] italic">
                {data.importance_list_title}
              </p>
            )}
            {data.importance_text3 && (
              <p className="text-slate-700 text-sm md:text-[15px] leading-relaxed m-0 font-medium text-justify">
                {data.importance_text3}
              </p>
            )}
          </div>

          {/* SECTION 4: PHOTO SHOWCASE (FOSSILS & MINERALS & ORES) */}
          <div className="space-y-8 pt-4">
            {/* Fossils Subsection */}
            {data.fossils && data.fossils.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-[#990033] text-lg font-bold tracking-tight m-0 uppercase border-l-4 border-[#990033] pl-3">
                  Fossils
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {data.fossils.map((item, idx) => (
                    <div key={idx} className="group overflow-hidden rounded-xl border border-slate-100 bg-slate-50 p-2 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-200">
                        <img src={getImageUrl(item.image, false)} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80'; }} />
                      </div>
                      <div className="mt-2 text-center text-xs font-bold text-slate-600">{item.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Minerals Subsection */}
            {data.minerals && data.minerals.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-[#990033] text-lg font-bold tracking-tight m-0 uppercase border-l-4 border-[#990033] pl-3">
                  Minerals
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {data.minerals.map((item, idx) => (
                    <div key={idx} className="group overflow-hidden rounded-xl border border-slate-100 bg-slate-50 p-2 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-200">
                        <img src={getImageUrl(item.image, true)} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80'; }} />
                      </div>
                      <div className="mt-2 text-center text-xs font-bold text-slate-600">{item.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ores Subsection */}
            {data.ores && data.ores.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-[#990033] text-lg font-bold tracking-tight m-0 uppercase border-l-4 border-[#990033] pl-3">
                  Ores
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {data.ores.map((item, idx) => (
                    <div key={idx} className="group overflow-hidden rounded-xl border border-slate-100 bg-slate-50 p-2 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-200">
                        <img src={getImageUrl(item.image, 'ores')} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?auto=format&fit=crop&w=400&q=80'; }} />
                      </div>
                      <div className="mt-2 text-center text-xs font-bold text-slate-600">{item.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ZOOLOGY ONLY SECTIONS (MUSEUM EVENTS & ACTIVITIES) */}
      {slug === 'zoology' && (
        <div className="space-y-6 pt-4">
          <h2 className="text-[#990033] text-xl font-bold tracking-tight m-0 border-b border-slate-100 pb-3 uppercase">
            Event Gallery
          </h2>
          
          {data.events && data.events.length > 0 ? (
            <div className="space-y-8">
              {data.events.map((evt, evtIdx) => (
                <div key={evtIdx} className="w-full overflow-hidden bg-white border border-slate-100 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md">
                  {/* Header Bar: `#990033` background with white centered text */}
                  <div className="bg-[#990033] px-6 py-3 border-b border-red-800 text-center shadow-sm">
                    <h3 className="text-sm font-extrabold text-white tracking-wider m-0 font-sans uppercase">
                      {evt.title || 'Museum Event'}
                    </h3>
                  </div>
                  
                  {/* Event Images Grid */}
                  {evt.images && evt.images.length > 0 ? (
                    <div className="p-6 bg-slate-50/50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {evt.images.map((imgUrl, idx) => (
                          <div 
                            key={idx} 
                            className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center items-center overflow-hidden transition-transform duration-300 hover:scale-[1.01]"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={getImageUrl(imgUrl, 'events')} 
                              alt={`Event Photo ${idx + 1}`} 
                              className="w-full aspect-[4/3] object-cover rounded-lg border border-slate-100 shadow-inner"
                              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80'; }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-slate-50/20 text-slate-400 font-medium">
                      No photographs uploaded for this event.
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-16 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
              <span className="text-4xl block mb-3">📸</span>
              <p className="text-slate-650 font-extrabold text-lg m-0">No Event Photos Available</p>
              <p className="text-slate-450 text-sm mt-1 m-0">Check back later for recent photographs of the Zoology Museum event gallery.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
