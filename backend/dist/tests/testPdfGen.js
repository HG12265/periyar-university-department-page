"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pdfGenerator_1 = require("../pdf/pdfGenerator");
const path_1 = __importDefault(require("path"));
const mockFaculty = {
    name: 'Dr. T. PALVANNAN',
    designation: 'PROFESSOR',
    email: 'pal2912@periyaruniversity.ac.in',
    specialization: 'Clinical Biochemistry and Enzymology',
    image_url: null,
};
const mockPublications = [
    {
        title: 'An outstanding study in Biochemistry',
        authors: 'T. Palvannan, et al.',
        journal: 'Journal of Biochemistry',
        year: '2023',
        volume: '12',
        pages: '100-112',
    }
];
const mockVisits = [
    {
        country: 'United Kingdom',
        purpose: 'Collaborative Research',
        duration: '2 Months',
    }
];
const mockOrganizers = [
    {
        role: 'Convener',
        event_name: 'National Conference on Biochemistry',
        date: '2022-03-15',
    }
];
const outputPath = path_1.default.resolve(__dirname, '../../uploads/resumes/test_resume.pdf');
const resumeData = {
    personal: mockFaculty,
    publications: mockPublications,
    visits: mockVisits,
    organizers: mockOrganizers,
    qualifications: [],
    experience: [],
    research: [],
};
(0, pdfGenerator_1.generateResumePdf)(resumeData, outputPath)
    .then(() => {
    console.log('PDF Generated successfully!');
    process.exit(0);
})
    .catch((err) => {
    console.error('PDF Generation failed:', err);
    process.exit(1);
});
