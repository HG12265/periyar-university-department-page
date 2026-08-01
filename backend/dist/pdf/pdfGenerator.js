"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateResumePdf = void 0;
const pdfmake = require('pdfmake');
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const logger_1 = require("../config/logger");
const env_1 = require("../config/env");
// Dynamic Font Resolution logic
function resolveFontPath() {
    const baseDir = path_1.default.resolve(__dirname, '../..');
    const possibleFonts = [
        { name: 'ArialUnicode', path: path_1.default.join(baseDir, 'fonts', 'arialuni.ttf') },
        { name: 'NotoSansTamil', path: path_1.default.join(baseDir, 'fonts', 'NotoSansTamil-Regular.ttf') },
        { name: 'ArialUnicode', path: 'C:\\Windows\\Fonts\\ARIALUNI.TTF' },
        { name: 'ArialUnicode', path: 'C:\\Windows\\Fonts\\arialuni.ttf' },
        { name: 'Nirmala', path: 'C:\\Windows\\Fonts\\Nirmala.ttc' },
        { name: 'DejaVuSans', path: '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf' },
        { name: 'FreeSans', path: '/usr/share/fonts/truetype/freefont/FreeSans.ttf' },
        { name: 'NotoSansTamil', path: '/usr/share/fonts/truetype/noto/NotoSansTamil-Regular.ttf' },
    ];
    for (const font of possibleFonts) {
        if (fs_1.default.existsSync(font.path)) {
            return font;
        }
    }
    // Fallback to standard Helvetica if no Tamil font file exists
    return { name: 'Helvetica', path: 'Helvetica' };
}
const resolvedFont = resolveFontPath();
const fontName = resolvedFont.name;
const fontDefs = {
    Helvetica: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique',
    },
};
if (fontName !== 'Helvetica') {
    fontDefs[fontName] = {
        normal: resolvedFont.path,
        bold: resolvedFont.path,
    };
}
// Custom color palette matching the university's design system
const PRIMARY_COLOR = '#000066'; // Deep Navy Blue
const SECONDARY_COLOR = '#990033'; // Crimson Red
const TEXT_COLOR = '#1e293b'; // Slate-800
const LIGHT_BG = '#f8fafc'; // Slate-50
const BORDER_COLOR = '#cbd5e1'; // Slate-300
// Helper to compile styled section header definition
function createSectionHeader(title) {
    return [
        { text: title.toUpperCase(), style: 'sectionTitle', margin: [0, 12, 0, 2] },
        {
            table: {
                widths: ['*'],
                body: [['']],
            },
            layout: {
                hLineWidth: () => 2,
                vLineWidth: () => 0,
                hLineColor: () => PRIMARY_COLOR,
                paddingTop: () => 0,
                paddingBottom: () => 0,
            },
            margin: [0, 0, 0, 8],
        },
    ];
}
// Helper to clean HTML bold tags for PDF rendering
function cleanTextForPdf(val) {
    if (!val)
        return '';
    // Convert basic HTML tags <b>/<strong> to markdown-like structures or just strip them
    return val.replace(/<[^>]+>/g, '').trim();
}
const generateResumePdf = (resumeData, outputPath) => {
    return new Promise((resolve, reject) => {
        try {
            const personal = resumeData.personal || {};
            const summary = resumeData.summary || '';
            const qualifications = resumeData.qualifications || [];
            const previousPositions = resumeData.previous_positions || [];
            const universityPositions = resumeData.university_positions || [];
            const papersPublished = resumeData.papers_published || [];
            const papersPresented = resumeData.papers_presented || [];
            const researchProjects = resumeData.research_projects || [];
            const foreignVisits = resumeData.foreign_visits || [];
            const eventsOrganized = resumeData.events_organized || [];
            const lecturesDelivered = resumeData.lectures_delivered || [];
            const awardsReceived = resumeData.awards_received || [];
            const patents = resumeData.patents || [];
            const copyrights = resumeData.copyrights || [];
            const phdProduced = resumeData.phd_produced || [];
            const researchAreas = resumeData.research_areas || [];
            const docContent = [];
            // ==========================================
            // HEADER PROFILE SECTION
            // ==========================================
            let imagePath = personal.image_url;
            let hasImage = false;
            if (imagePath && imagePath.startsWith('/api/uploads/')) {
                const relativePath = imagePath.replace('/api/uploads/', '');
                const absolutePath = path_1.default.resolve(env_1.env.UPLOAD_DIR, relativePath);
                if (fs_1.default.existsSync(absolutePath)) {
                    imagePath = absolutePath;
                    hasImage = true;
                }
            }
            const leftCol = [
                { text: personal.name, style: 'docTitle' },
                { text: personal.designation, style: 'docSubtitle' },
                { text: `Department of ${personal.department}`, style: 'docDepartment' },
                { text: `Employee ID: ${personal.employee_id}`, style: 'docBody' },
                { text: `Official Email: ${personal.email}`, style: 'docBody' },
            ];
            if (hasImage && imagePath) {
                docContent.push({
                    columns: [
                        { width: '*', stack: leftCol },
                        { width: 92, image: imagePath, fit: [92, 92], alignment: 'right' },
                    ],
                    columnGap: 20,
                });
            }
            else {
                docContent.push({ stack: leftCol });
            }
            docContent.push({ text: '', margin: [0, 8] });
            // ==========================================
            // 1. PROFILE & EDUCATION
            // ==========================================
            docContent.push(...createSectionHeader('1. Profile'));
            if (summary) {
                docContent.push({ text: summary, style: 'docBody', margin: [0, 0, 0, 8] });
            }
            if (qualifications.length > 0) {
                const qualTableBody = [
                    [
                        { text: 'Degree', style: 'tableHeader' },
                        { text: 'Year', style: 'tableHeader' },
                        { text: 'Marks/Grade', style: 'tableHeader' },
                        { text: 'Institution/University', style: 'tableHeader' },
                    ],
                ];
                qualifications.forEach((q) => {
                    let yrStr = q.year_from || '';
                    if (q.year_upto)
                        yrStr += ` - ${q.year_upto}`;
                    qualTableBody.push([
                        { text: q.qualification || 'N/A', style: 'tableCell' },
                        { text: yrStr || '-', style: 'tableCell' },
                        { text: q.mark || '-', style: 'tableCell' },
                        { text: q.institute || 'N/A', style: 'tableCell' },
                    ]);
                });
                docContent.push({
                    table: {
                        headerRows: 1,
                        widths: [110, 80, 80, '*'],
                        body: qualTableBody,
                    },
                    layout: 'lightHorizontalLines',
                    margin: [0, 0, 0, 10],
                });
            }
            else {
                docContent.push({ text: 'No Records Available', style: 'docBody', margin: [0, 0, 0, 10] });
            }
            // ==========================================
            // 2. CONTACT & WEB PAGES
            // ==========================================
            docContent.push(...createSectionHeader('2. Web Pages'));
            const webpageList = [];
            if (personal.profile_url)
                webpageList.push({ text: `🌐 Profile URL: ${personal.profile_url}`, style: 'bulletItem' });
            if (personal.email)
                webpageList.push({ text: `✉ Email: ${personal.email}`, style: 'bulletItem' });
            if (webpageList.length > 0) {
                docContent.push({ stack: webpageList, margin: [0, 0, 0, 10] });
            }
            else {
                docContent.push({ text: 'No Records Available', style: 'docBody', margin: [0, 0, 0, 10] });
            }
            // ==========================================
            // 3. EXPERIENCE
            // ==========================================
            docContent.push(...createSectionHeader('3. Professional Experience'));
            // Teaching Experience
            docContent.push({ text: 'Teaching Experience', style: 'subSectionTitle', margin: [0, 4, 0, 4] });
            if (previousPositions.length > 0) {
                const prevTableBody = [
                    [
                        { text: 'Designation', style: 'tableHeader' },
                        { text: 'Institution/Organization', style: 'tableHeader' },
                        { text: 'Duration', style: 'tableHeader' },
                    ],
                ];
                previousPositions.forEach((pos) => {
                    let dur = `${pos.month_from || ''} ${pos.year_from || ''}`;
                    const upto = `${pos.month_upto || ''} ${pos.year_upto || ''}`.trim();
                    dur += upto ? ` - ${upto}` : ' - Present';
                    prevTableBody.push([
                        { text: pos.role || 'N/A', style: 'tableCell' },
                        { text: pos.company || 'N/A', style: 'tableCell' },
                        { text: dur, style: 'tableCell' },
                    ]);
                });
                docContent.push({
                    table: {
                        headerRows: 1,
                        widths: [130, '*', 150],
                        body: prevTableBody,
                    },
                    layout: 'lightHorizontalLines',
                    margin: [0, 0, 0, 10],
                });
            }
            else {
                docContent.push({ text: 'No Records Available', style: 'docBody', margin: [0, 0, 0, 10] });
            }
            // Administrative Positions
            docContent.push({ text: 'Administrative Experience', style: 'subSectionTitle', margin: [0, 6, 0, 4] });
            if (universityPositions.length > 0) {
                const univTableBody = [
                    [
                        { text: 'Designation', style: 'tableHeader' },
                        { text: 'Institution/Organization', style: 'tableHeader' },
                        { text: 'Duration', style: 'tableHeader' },
                    ],
                ];
                universityPositions.forEach((pos) => {
                    let dur = `${pos.month_from || ''} ${pos.year_from || ''}`;
                    const upto = `${pos.month_upto || ''} ${pos.year_upto || ''}`.trim();
                    dur += upto ? ` - ${upto}` : ' - Present';
                    univTableBody.push([
                        { text: pos.role || 'N/A', style: 'tableCell' },
                        { text: pos.company || 'N/A', style: 'tableCell' },
                        { text: dur, style: 'tableCell' },
                    ]);
                });
                docContent.push({
                    table: {
                        headerRows: 1,
                        widths: [130, '*', 150],
                        body: univTableBody,
                    },
                    layout: 'lightHorizontalLines',
                    margin: [0, 0, 0, 10],
                });
            }
            else {
                docContent.push({ text: 'No Records Available', style: 'docBody', margin: [0, 0, 0, 10] });
            }
            // ==========================================
            // 4. RESEARCH PROJECTS
            // ==========================================
            docContent.push(...createSectionHeader('4. Research Projects'));
            if (researchProjects.length > 0) {
                const projectList = researchProjects.map((p) => ({
                    text: `• "${p.title}" | Fund Agency: ${p.FundAgency} | Amount: Rs. ${p.samt} | Duration: ${p.duration}`,
                    style: 'bulletItem',
                }));
                docContent.push({ stack: projectList, margin: [0, 0, 0, 10] });
            }
            else {
                docContent.push({ text: 'No Records Available', style: 'docBody', margin: [0, 0, 0, 10] });
            }
            // ==========================================
            // 5. PATENTS
            // ==========================================
            docContent.push(...createSectionHeader('5. Patents'));
            if (patents.length > 0) {
                const patentList = patents.map((p) => ({
                    text: `• ${p.Name} (${p.PNumber}) - Category: ${p.Categry} | Status: ${p.Stus} | Date: ${p.Fdate}`,
                    style: 'bulletItem',
                }));
                docContent.push({ stack: patentList, margin: [0, 0, 0, 10] });
            }
            else {
                docContent.push({ text: 'No Records Available', style: 'docBody', margin: [0, 0, 0, 10] });
            }
            // ==========================================
            // 6. FOREIGN VISITS
            // ==========================================
            docContent.push(...createSectionHeader('6. Foreign Visits'));
            if (foreignVisits.length > 0) {
                const fvList = foreignVisits.map((v) => ({
                    text: `• Visited ${v.company} for purpose of ${v.purpose} (${v.dfrom} to ${v.dto}) | Funded by: ${v.agency}`,
                    style: 'bulletItem',
                }));
                docContent.push({ stack: fvList, margin: [0, 0, 0, 10] });
            }
            else {
                docContent.push({ text: 'No Records Available', style: 'docBody', margin: [0, 0, 0, 10] });
            }
            // ==========================================
            // 7. EVENTS ORGANIZED
            // ==========================================
            docContent.push(...createSectionHeader('7. Events Organized'));
            if (eventsOrganized.length > 0) {
                const eoList = eventsOrganized.map((e) => ({
                    text: `• ${e.Role} of ${e.O_type} on "${e.Title}" at ${e.Org} (${e.Date_f} to ${e.Date_t})`,
                    style: 'bulletItem',
                }));
                docContent.push({ stack: eoList, margin: [0, 0, 0, 10] });
            }
            else {
                docContent.push({ text: 'No Records Available', style: 'docBody', margin: [0, 0, 0, 10] });
            }
            // ==========================================
            // 8. PUBLICATIONS
            // ==========================================
            docContent.push(...createSectionHeader('8. Publications'));
            // Papers Published
            docContent.push({ text: 'Papers Published in Journals', style: 'subSectionTitle', margin: [0, 4, 0, 4] });
            if (papersPublished.length > 0) {
                const pubList = papersPublished.map((p) => {
                    const authors = [p.Author_1, p.Author_2, p.Author_3].filter(Boolean).join(', ');
                    return {
                        text: `• ${authors}. "${p.Title}". ${p.P_Name}, Vol. ${p.Volume}, Issue ${p.Issue}, pp. ${p.Page_from}-${p.Page_to} (${p.P_year}). DOI: ${p.DOI || 'N/A'}`,
                        style: 'bulletItem',
                    };
                });
                docContent.push({ stack: pubList, margin: [0, 0, 0, 10] });
            }
            else {
                docContent.push({ text: 'No Records Available', style: 'docBody', margin: [0, 0, 0, 10] });
            }
            // Papers Presented
            docContent.push({ text: 'Papers Presented in Conferences', style: 'subSectionTitle', margin: [0, 6, 0, 4] });
            if (papersPresented.length > 0) {
                const presList = papersPresented.map((p) => {
                    const authors = [p.Author_1, p.Author_2, p.Author_3].filter(Boolean).join(', ');
                    return {
                        text: `• ${authors}. Presented "${p.Title}" at ${p.P_Name} (${p.P_year}).`,
                        style: 'bulletItem',
                    };
                });
                docContent.push({ stack: presList, margin: [0, 0, 0, 10] });
            }
            else {
                docContent.push({ text: 'No Records Available', style: 'docBody', margin: [0, 0, 0, 10] });
            }
            // ==========================================
            // 9. LECTURES DELIVERED
            // ==========================================
            docContent.push(...createSectionHeader('9. Invited Lectures Delivered'));
            if (lecturesDelivered.length > 0) {
                const lecList = lecturesDelivered.map((l) => ({
                    text: `• Delivered Lecture on "${l.Title}" as ${l.Role} at ${l.Org} (Date: ${l.Date_f})`,
                    style: 'bulletItem',
                }));
                docContent.push({ stack: lecList, margin: [0, 0, 0, 10] });
            }
            else {
                docContent.push({ text: 'No Records Available', style: 'docBody', margin: [0, 0, 0, 10] });
            }
            // ==========================================
            // 10. COPYRIGHTS
            // ==========================================
            docContent.push(...createSectionHeader('10. Copyrights'));
            if (copyrights.length > 0) {
                const copyList = copyrights.map((c) => ({
                    text: `• Copyright for "${c.Name}" - RegNo: ${c.PNumber} | Status: ${c.Stus} | Date: ${c.Fdate}`,
                    style: 'bulletItem',
                }));
                docContent.push({ stack: copyList, margin: [0, 0, 0, 10] });
            }
            else {
                docContent.push({ text: 'No Records Available', style: 'docBody', margin: [0, 0, 0, 10] });
            }
            // ==========================================
            // 11. PHD GUIDED
            // ==========================================
            docContent.push(...createSectionHeader('11. Research Guidance (PhD Produced)'));
            if (phdProduced.length > 0) {
                const phdList = phdProduced.map((txt) => ({
                    text: `• ${cleanTextForPdf(txt)}`,
                    style: 'bulletItem',
                }));
                docContent.push({ stack: phdList, margin: [0, 0, 0, 10] });
            }
            else {
                docContent.push({ text: 'No Records Available', style: 'docBody', margin: [0, 0, 0, 10] });
            }
            // ==========================================
            // 12. AWARDS
            // ==========================================
            docContent.push(...createSectionHeader('12. Academic Awards & Honors'));
            if (awardsReceived.length > 0) {
                const awardList = awardsReceived.map((a) => ({
                    text: `• "${a.Title}" by ${a.Sponcer} (${a.A_date}) | Level: ${a.Level}`,
                    style: 'bulletItem',
                }));
                docContent.push({ stack: awardList, margin: [0, 0, 0, 10] });
            }
            else {
                docContent.push({ text: 'No Records Available', style: 'docBody', margin: [0, 0, 0, 10] });
            }
            // ==========================================
            // 13. RESEARCH AREAS
            // ==========================================
            docContent.push(...createSectionHeader('13. Areas of Specialization'));
            if (researchAreas.length > 0) {
                docContent.push({ text: researchAreas.join(', '), style: 'docBody', margin: [0, 0, 0, 10] });
            }
            else {
                docContent.push({ text: 'No Records Available', style: 'docBody', margin: [0, 0, 0, 10] });
            }
            // Build Document Definition
            const docDefinition = {
                content: docContent,
                defaultStyle: {
                    font: fontName,
                    fontSize: 9.5,
                    color: TEXT_COLOR,
                },
                styles: {
                    docTitle: {
                        fontSize: 20,
                        bold: true,
                        color: PRIMARY_COLOR,
                        margin: [0, 0, 0, 2],
                    },
                    docSubtitle: {
                        fontSize: 12,
                        color: SECONDARY_COLOR,
                        margin: [0, 0, 0, 4],
                    },
                    docDepartment: {
                        fontSize: 11,
                        color: TEXT_COLOR,
                        margin: [0, 0, 0, 10],
                    },
                    sectionTitle: {
                        fontSize: 13,
                        bold: true,
                        color: PRIMARY_COLOR,
                    },
                    subSectionTitle: {
                        fontSize: 10.5,
                        bold: true,
                        color: SECONDARY_COLOR,
                    },
                    docBody: {
                        fontSize: 9.5,
                        lineHeight: 1.35,
                    },
                    bulletItem: {
                        fontSize: 9.5,
                        lineHeight: 1.3,
                        margin: [0, 2, 0, 2],
                    },
                    tableHeader: {
                        bold: true,
                        fontSize: 9,
                        color: '#ffffff',
                        fillColor: PRIMARY_COLOR,
                        margin: [2, 4, 2, 4],
                    },
                    tableCell: {
                        fontSize: 9,
                        margin: [2, 4, 2, 4],
                    },
                },
                // Layout metrics
                pageSize: 'LETTER',
                pageMargins: [36, 54, 36, 54], // 0.5 inch sides, 0.75 inch top/bottom
                // Page counting and dynamic footer drawing
                footer: (currentPage, pageCount) => {
                    return {
                        stack: [
                            {
                                canvas: [
                                    { type: 'line', x1: 36, y1: 0, x2: 576, y2: 0, lineWidth: 0.5, strokeColor: BORDER_COLOR }
                                ]
                            },
                            {
                                columns: [
                                    { text: 'Periyar University Faculty Resume Portal', alignment: 'left', style: 'footerText' },
                                    { text: `Page ${currentPage} of ${pageCount}`, alignment: 'right', style: 'footerText' }
                                ],
                                margin: [36, 4, 36, 0]
                            }
                        ],
                        style: 'footerContainer'
                    };
                }
            };
            // Add footerText style definition explicitly
            docDefinition.styles.footerText = {
                fontSize: 8,
                color: '#475569', // slate-600
            };
            docDefinition.styles.footerContainer = {
                margin: [0, 0, 0, 0]
            };
            pdfmake.setFonts(fontDefs);
            pdfmake.setUrlAccessPolicy(() => true);
            pdfmake.setLocalAccessPolicy(() => true);
            const doc = pdfmake.createPdf(docDefinition);
            doc.write(outputPath)
                .then(() => {
                logger_1.logger.info(`PDF Resume generated successfully at ${outputPath}`);
                resolve();
            })
                .catch((err) => {
                logger_1.logger.error(`PDF write failed: ${err.message}`);
                reject(err);
            });
        }
        catch (error) {
            logger_1.logger.error(`PDF generation process threw an error: ${error.message}`);
            reject(error);
        }
    });
};
exports.generateResumePdf = generateResumePdf;
