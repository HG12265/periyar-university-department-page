"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuseumScraper = void 0;
const db_1 = require("../db");
const logger_1 = require("../config/logger");
const FALLBACK_DATA = {
    intro_text: "As an integral part of Geological curriculum, an exclusive Geological museum has been established in Department of Geology, Periyar University in the year 2004. The geological museum and collections of rare geological samples are great assets of the nation and contribute to research, science education and public.",
    intro_bullets: [
        "Collections form an intrinsic part of research carried out in regional and national levels. They play a key role as a source of evidence in tackling major challenges such as understanding our past for precise characterization of future climate change and for exploring natural resources.",
        "The Tamil Nadu State is the site of many scientific breakthroughs in the history of geology. Collections narrate an engaging story about the geological heritage of the state.",
        "Museums and collections are crucial gateways to engaging students and the public in Geology, Earth history in particular and science in general.",
        "Local collection embodies, an important sense of place, different from centrally held collections, and tell a compelling story of local landscape and geology."
    ],
    intro_outro: "Tamil Nadu is a home to a wide-ranging and scientifically important set of geological collections. The diverse and unique natures of the collections contribute to the scientific advancement and cultural understanding of our planet for researchers, students and the public. Specimens housed in collections around the Tamil Nadu include rocks and minerals, casts, reconstructions, plants and animal fossils. Together, they represent an unparalleled scientific and resource that attracts visitors",
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
        {
            name: "Fossil Specimen",
            image: "https://www.periyaruniversity.ac.in/Dept/geo/images/fossil.jpg"
        }
    ],
    minerals: [
        {
            name: "Mineral Specimen",
            image: "https://www.periyaruniversity.ac.in/Dept/geo/images/mineral.jpg"
        }
    ],
    ores: [
        {
            name: "Ore Specimen",
            image: "https://www.periyaruniversity.ac.in/Dept/geo/images/ores.jpg"
        }
    ]
};
function cleanHtml(text) {
    if (!text)
        return '';
    return text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/’/g, "'")
        .replace(/‘/g, "'")
        .replace(/“/g, '"')
        .replace(/”/g, '"')
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}
function extractListItems(sectionHtml) {
    const parts = sectionHtml.split(/<li[^>]*>/i);
    const items = [];
    for (let i = 1; i < parts.length; i++) {
        let subPart = parts[i].split(/<\/ul[^>]*>|<\/ol[^>]*>/i)[0];
        subPart = subPart.split(/<\/li[^>]*>/i)[0];
        const cleaned = cleanHtml(subPart);
        if (cleaned) {
            items.push(cleaned);
        }
    }
    return items;
}
class MuseumScraper {
    static async scrapeAndSave() {
        const url = 'https://www.periyaruniversity.ac.in/Dept/geo.php';
        let parsedData = null;
        try {
            const res = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5'
                },
                signal: AbortSignal.timeout(15000) // 15 seconds timeout
            });
            if (res.ok) {
                const content = await res.text();
                // Find Geological Museum section
                const regexStart = /id=["'\s]*Museum["'\s]*/i;
                const startMatch = regexStart.exec(content);
                if (startMatch) {
                    const startPos = startMatch.index;
                    // Find next section (Placement)
                    const regexEnd = /id=["'\s]*Placement["'\s]*|id=["'\s]*placement["'\s]*/i;
                    const contentAfterMuseum = content.substring(startPos);
                    const endMatch = regexEnd.exec(contentAfterMuseum);
                    const endPos = endMatch ? startPos + endMatch.index : startPos + 50000;
                    const museumHtml = content.substring(startPos, endPos);
                    // 1. Extract Introduction section
                    let introText = "";
                    let introBullets = [];
                    const introRegex = /<h5>Introduction<\/h5>(.*?)($|<h5>)/si;
                    const introMatch = introRegex.exec(museumHtml);
                    if (introMatch) {
                        const introSection = introMatch[1];
                        const pMatch = /<p[^>]*>(.*?)<\/p>/si.exec(introSection);
                        if (pMatch) {
                            introText = cleanHtml(pMatch[1]);
                        }
                        introBullets = extractListItems(introSection);
                    }
                    // 2. Extract Geological Museum text
                    let museumText1 = "";
                    let museumText2 = "";
                    let collectionsCan = [];
                    const museumRegex = /<h5>Geological Museum\s*<\/h5>(.*?)($|<h5>)/si;
                    const museumMatch = museumRegex.exec(museumHtml);
                    if (museumMatch) {
                        const museumSection = museumMatch[1];
                        const pTags = [];
                        const pRegex = /<p[^>]*>(.*?)<\/p>/gsi;
                        let m;
                        while ((m = pRegex.exec(museumSection)) !== null) {
                            pTags.push(m[1]);
                        }
                        museumText1 = pTags.length > 0 ? cleanHtml(pTags[0]) : "";
                        museumText2 = pTags.length > 1 ? cleanHtml(pTags[1]) : "";
                        collectionsCan = extractListItems(museumSection);
                    }
                    // 3. Extract Importance
                    let importanceText1 = "";
                    let importanceText2 = "";
                    let importanceText3 = "";
                    const importanceListTitle = "List of Geological Specimens";
                    const importanceRegex = /<h5>The importance of Geological Museum<\/h5>(.*?)($|<h5>)/si;
                    const importanceMatch = importanceRegex.exec(museumHtml);
                    if (importanceMatch) {
                        const impSection = importanceMatch[1];
                        const impPTags = [];
                        const pRegex = /<p[^>]*>(.*?)<\/p>/gsi;
                        let m;
                        while ((m = pRegex.exec(impSection)) !== null) {
                            impPTags.push(m[1]);
                        }
                        if (impPTags.length > 0) {
                            importanceText1 = cleanHtml(impPTags[0]);
                        }
                        if (impPTags.length > 1) {
                            const pContent = impPTags[1];
                            const parts = pContent.split('The Museum in the Department of Geology has arguably');
                            if (parts.length > 1) {
                                importanceText2 = cleanHtml(parts[0]);
                                importanceText3 = "The Museum in the Department of Geology has arguably " + cleanHtml(parts[1]);
                            }
                            else {
                                importanceText2 = cleanHtml(pContent);
                            }
                        }
                    }
                    // 4. Extract Images
                    const imgRegex = /<img\s+[^>]*src=["']([^"']+)["']/gi;
                    const imgTags = [];
                    let mImg;
                    while ((mImg = imgRegex.exec(museumHtml)) !== null) {
                        imgTags.push(mImg[1]);
                    }
                    const fossils = [];
                    const minerals = [];
                    const ores = [];
                    const baseUrl = "https://www.periyaruniversity.ac.in/Dept/";
                    imgTags.forEach((img) => {
                        const fullImgUrl = img.startsWith('http') ? img : baseUrl + img;
                        const imgLower = img.toLowerCase();
                        if (imgLower.includes('fossil')) {
                            fossils.push({ name: "Fossil Specimen", image: fullImgUrl });
                        }
                        else if (imgLower.includes('mineral')) {
                            minerals.push({ name: "Mineral Specimen", image: fullImgUrl });
                        }
                        else if (imgLower.includes('ores')) {
                            ores.push({ name: "Ore Specimen", image: fullImgUrl });
                        }
                    });
                    parsedData = {
                        intro_text: introText,
                        intro_bullets: introBullets,
                        intro_outro: "",
                        museum_text1: museumText1,
                        museum_text2: museumText2,
                        collections_can: collectionsCan,
                        importance_text1: importanceText1,
                        importance_text2: importanceText2,
                        importance_list_title: importanceListTitle,
                        importance_text3: importanceText3,
                        fossils: fossils,
                        minerals: minerals,
                        ores: ores
                    };
                }
            }
        }
        catch (e) {
            logger_1.logger.error(`Museum scraping HTTP fetch failed: ${e.message}. Falling back to default pre-scraped data.`);
        }
        if (!parsedData) {
            parsedData = FALLBACK_DATA;
        }
        // Save to Database
        const contentJsonStr = JSON.stringify(parsedData);
        // Find geology department ID
        const [deptRows] = await db_1.primaryDB.query('SELECT id FROM departments WHERE slug = ? LIMIT 1', ['geology']);
        if (deptRows.length === 0) {
            throw new Error("Geology department not found in database");
        }
        const deptId = deptRows[0].id;
        // Check if section exists
        const [sectionRows] = await db_1.primaryDB.query('SELECT id FROM department_sections WHERE dept_id = ? AND category = ? LIMIT 1', [deptId, 'museum']);
        if (sectionRows.length === 0) {
            // Insert new section
            await db_1.primaryDB.query('INSERT INTO department_sections (dept_id, section_title, category, content, order_index) VALUES (?, ?, ?, ?, 10)', [deptId, 'Museum Details', 'museum', contentJsonStr]);
        }
        else {
            // Update section content
            await db_1.primaryDB.query('UPDATE department_sections SET content = ? WHERE dept_id = ? AND category = ?', [contentJsonStr, deptId, 'museum']);
            // Delete any duplicates
            await db_1.primaryDB.query('DELETE FROM department_sections WHERE dept_id = ? AND category = ? AND id != ?', [deptId, 'museum', sectionRows[0].id]);
        }
        return {
            status: 'success',
            message: 'Geological museum data scraped/seeded and database updated!'
        };
    }
}
exports.MuseumScraper = MuseumScraper;
exports.default = MuseumScraper;
