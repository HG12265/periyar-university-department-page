import { generateResumePdf } from '../pdf/pdfGenerator';
import path from 'path';

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

const outputPath = path.resolve(__dirname, '../../uploads/resumes/test_resume.pdf');

const resumeData = {
  personal: mockFaculty,
  publications: mockPublications,
  visits: mockVisits,
  organizers: mockOrganizers,
  qualifications: [],
  experience: [],
  research: [],
};

generateResumePdf(resumeData, outputPath)
  .then(() => {
    console.log('PDF Generated successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('PDF Generation failed:', err);
    process.exit(1);
  });
