import fs from 'fs';
import path from 'path';
import cron from 'node-cron';
import { FacultyRepository } from '../repositories/facultyRepository';
import { LegacyRepository } from '../repositories/legacyRepository';
import { ResumeRepository, ResumeMaster } from '../repositories/resumeRepository';
import { ApiError } from '../utils/ApiError';
import { logger } from '../config/logger';
import { env } from '../config/env';
import { parseDateToMonthYear, safeIntYear, extractYearFromText, safeStrStrip } from '../utils/date';
import { cleanMojibakeRecursive } from '../utils/string';
import { generateResumePdf } from '../pdf/pdfGenerator';

export class ResumeService {
  
  // Compile faculty resume data from both databases
  static async compileFacultyResumeData(facultyId: number): Promise<any> {
    // 1. Fetch Faculty
    let faculty = await FacultyRepository.findById(facultyId);
    if (!faculty) {
      // Fallback: Check if facultyId is actually an emp_id
      faculty = await FacultyRepository.findByEmpId(String(facultyId));
    }

    if (!faculty) {
      throw new ApiError(404, 'Faculty record not found');
    }

    const deptName = faculty.department_name || '';
    let empId = faculty.emp_id;

    // Resolve email lookup in legacy DB if emp_id is missing
    if (!empId && faculty.email) {
      const resolved = await LegacyRepository.resolveEmpIdByEmail(faculty.email);
      if (resolved) {
        empId = resolved;
        // Proactively update in primary DB
        await FacultyRepository.update(faculty.id, { emp_id: empId });
      }
    }

    // Initialize lists
    const qualifications: any[] = [];
    const previousPositions: any[] = [];
    const universityPositions: any[] = [];
    const papersPublished: any[] = [];
    const papersPresented: any[] = [];
    const researchProjects: any[] = [];
    const foreignVisits: any[] = [];
    const eventsOrganized: any[] = [];
    const lecturesDelivered: any[] = [];
    const awardsReceived: any[] = [];
    const patents: any[] = [];
    const copyrights: any[] = [];
    const phdProduced: string[] = [];
    const researchAreas: string[] = [];

    if (empId) {
      const empIdStr = String(empId);

      // 1. Qualifications
      const qualRows = await LegacyRepository.getQualifications(empIdStr);
      qualRows.forEach((q) => {
        qualifications.push({
          qualification: safeStrStrip(q.qualification),
          year_from: safeStrStrip(q.year_from),
          year_upto: safeStrStrip(q.year_upto),
          mark: safeStrStrip(q.mark),
          institute: safeStrStrip(q.institute),
          status: safeStrStrip(q.status),
          arrange: q.arrange !== null ? Number(q.arrange) : 0,
        });
      });

      // 2. Previous Positions
      const prevRows = await LegacyRepository.getPreviousPositions(empIdStr);
      prevRows.forEach((r) => {
        const [mf, yf] = parseDateToMonthYear(r.FromDate);
        const [mt, yt] = parseDateToMonthYear(r.ToDate);
        previousPositions.push({
          role: safeStrStrip(r.Designation),
          company: safeStrStrip(r.Institution),
          month_from: mf,
          year_from: yf,
          month_upto: mt,
          year_upto: yt,
          Exp_type: 'Teaching',
        });
      });

      // 3. University Positions (position_held)
      const univRows = await LegacyRepository.getUniversityPositions(empIdStr);
      univRows.forEach((r) => {
        const [mf, yf] = parseDateToMonthYear(r.FromDate);
        const [mt, yt] = parseDateToMonthYear(r.ToDate);
        universityPositions.push({
          role: safeStrStrip(r.Role),
          company: safeStrStrip(r.University),
          month_from: mf,
          year_from: yf,
          month_upto: mt,
          year_upto: yt,
          Exp_type: 'Administrative',
        });
      });

      // 4. Awards
      const awdRows = await LegacyRepository.getAwards(empIdStr);
      awdRows.forEach((a) => {
        awardsReceived.push({
          Title: safeStrStrip(a.Title),
          A_date: safeStrStrip(a.A_date),
          Level: safeStrStrip(a.Level),
          Sponcer: safeStrStrip(a.Sponcer),
          Spon_Address: safeStrStrip(a.Spon_Address),
        });
      });

      // 5. Research Areas
      const areaRows = await LegacyRepository.getResearchAreas(empIdStr);
      areaRows.forEach((ar) => {
        if (ar.area) {
          researchAreas.push(safeStrStrip(ar.area));
        }
      });

      // 6. Research Projects
      const propRows = await LegacyRepository.getProjects(empIdStr);
      propRows.forEach((p) => {
        researchProjects.push({
          title: safeStrStrip(p.title),
          FundAgency: safeStrStrip(p.FundAgency),
          samt: p.samt !== null ? Number(p.samt) : 0,
          duration: safeStrStrip(p.duration),
          publications_list: safeStrStrip(p.Publications),
        });
      });

      // 7. Patents
      const patRows = await LegacyRepository.getPatents(empIdStr);
      patRows.forEach((pt) => {
        patents.push({
          Categry: safeStrStrip(pt.Categry),
          Level: safeStrStrip(pt.Level),
          Name: safeStrStrip(pt.Name),
          Detail: safeStrStrip(pt.Detail),
          Fdate: safeStrStrip(pt.Fdate),
          Issued: safeStrStrip(pt.Issued),
          Stus: safeStrStrip(pt.Stus),
          PNumber: safeStrStrip(pt.PNumber),
        });
      });

      // 8. Foreign Visits
      const fvRows = await LegacyRepository.getForeignVisits(empIdStr);
      const seenFv = new Set<string>();
      fvRows.forEach((fv) => {
        const company = safeStrStrip(fv.Company);
        const purpose = safeStrStrip(fv.Purpose);
        const dfrom = safeStrStrip(fv.DFrom);
        const dto = safeStrStrip(fv.DTo);
        const agency = safeStrStrip(fv.Agency);
        const invitation = safeStrStrip(fv.Invitation);
        const certificate = safeStrStrip(fv.Certificate);

        if (!company && !purpose && !agency) return;
        if (company === 'AFG' && !purpose && dfrom === '1970-01-01') return;

        const tupleKey = `${company}|${purpose}|${dfrom}|${dto}|${agency}|${invitation}|${certificate}`;
        if (seenFv.has(tupleKey)) return;
        seenFv.add(tupleKey);

        foreignVisits.push({
          company,
          purpose,
          dfrom,
          dto,
          agency,
          invitation,
          certificate,
        });
      });

      // 9. Events Organized
      const eoRows = await LegacyRepository.getEventsOrganized(empIdStr);
      const seenEo = new Set<string>();
      eoRows.forEach((eo) => {
        const T_role = safeStrStrip(eo.T_role);
        const O_type = safeStrStrip(eo.O_type);
        const Title = safeStrStrip(eo.Title);
        const Date_f = safeStrStrip(eo.Date_f);
        const Date_t = safeStrStrip(eo.Date_t);
        const Level = safeStrStrip(eo.Level);
        const Role = safeStrStrip(eo.Role);
        const Org = safeStrStrip(eo.Org);
        const Org_Address = safeStrStrip(eo.Org_Address);
        const local = safeStrStrip(eo.local);
        const outstation = safeStrStrip(eo.outstation);
        const Amount = safeStrStrip(eo.Amount);
        const letter = safeStrStrip(eo.letter);
        const Sanctioned = safeStrStrip(eo.Sanctioned);
        const Utilized = safeStrStrip(eo.Utilized);
        const uc = safeStrStrip(eo.uc);
        const report = safeStrStrip(eo.report);
        const photo1 = safeStrStrip(eo.photo1);
        const photo2 = safeStrStrip(eo.photo2);
        const photo3 = safeStrStrip(eo.photo3);
        const photo4 = safeStrStrip(eo.photo4);

        if (!Title && !Org && !Role) return;

        const tupleKey = `${T_role}|${O_type}|${Title}|${Date_f}|${Date_t}|${Level}|${Role}|${Org}|${Org_Address}|${local}|${outstation}|${Amount}|${letter}|${Sanctioned}|${Utilized}|${uc}|${report}|${photo1}|${photo2}|${photo3}|${photo4}`;
        if (seenEo.has(tupleKey)) return;
        seenEo.add(tupleKey);

        eventsOrganized.push({
          T_role, O_type, Title, Date_f, Date_t, Level, Role, Org, Org_Address,
          local, outstation, Amount, letter, Sanctioned, Utilized, uc, report,
          photo1, photo2, photo3, photo4,
        });
      });

      // 10. Publications
      const pubRows = await LegacyRepository.getPublications(empIdStr);
      const seenPub = new Set<string>();
      pubRows.forEach((pb) => {
        const P_type = safeStrStrip(pb.P_type);
        const Title = safeStrStrip(pb.Title);
        const P_Name = safeStrStrip(pb.P_Name);
        const P_Level = safeStrStrip(pb.P_Level);
        const Author_1 = safeStrStrip(pb.Author_1);
        const Author_2 = safeStrStrip(pb.Author_2);
        const Author_3 = safeStrStrip(pb.Author_3);
        const Volume = safeStrStrip(pb.Volume);
        const Issue = safeStrStrip(pb.Issue);
        const Page_from = safeStrStrip(pb.Page_from);
        const Page_to = safeStrStrip(pb.Page_to);
        const Impact_F = safeStrStrip(pb.Impact_F);
        const Indexing = safeStrStrip(pb.Indexing);
        const Publisher = safeStrStrip(pb.Publisher);
        const P_year = safeStrStrip(pb.P_year);
        const P_month = safeStrStrip(pb.P_month);
        const DOI = safeStrStrip(pb.DOI);
        const Webpage = safeStrStrip(pb.Webpage);
        const Paper = safeStrStrip(pb.Paper);
        const UPDATED = safeStrStrip(pb.UPDATED);

        if (!Title && !P_Name && !Author_1) return;

        const tupleKey = `${P_type}|${Title}|${P_Name}|${P_Level}|${Author_1}|${Author_2}|${Author_3}|${Volume}|${Issue}|${Page_from}|${Page_to}|${Impact_F}|${Indexing}|${Publisher}|${P_year}|${P_month}|${DOI}|${Webpage}|${Paper}|${UPDATED}`;
        if (seenPub.has(tupleKey)) return;
        seenPub.add(tupleKey);

        const pubItem = {
          P_type, Title, P_Name, P_Level, Author_1, Author_2, Author_3, Volume, Issue,
          Page_from, Page_to, Impact_F, Indexing, Publisher, P_year, P_month, DOI,
          Webpage, Paper, UPDATED,
        };

        const pTypeLower = P_type.toLowerCase();
        if (pTypeLower.includes('article') || pTypeLower.includes('journal') || pTypeLower.includes('review')) {
          papersPublished.push(pubItem);
        } else if (pTypeLower.includes('conference')) {
          papersPresented.push(pubItem);
        }
      });

      // 11. Lectures Delivered
      const lecRows = await LegacyRepository.getLecturesDelivered(empIdStr);
      lecRows.forEach((r) => {
        lecturesDelivered.push({
          Title: safeStrStrip(r.Title),
          Role: safeStrStrip(r.LType),
          Org: `${safeStrStrip(r.Institution)}, ${safeStrStrip(r.Venue)}`,
          Date_f: safeStrStrip(r.LDate),
          Date_t: '',
          EventTitle: safeStrStrip(r.EventTitle),
          Mode: safeStrStrip(r.Mode),
          Description: safeStrStrip(r.Description),
        });
      });

      // 12. Copyrights
      const copyRows = await LegacyRepository.getCopyrights(empIdStr);
      copyRows.forEach((r) => {
        copyrights.push({
          PNumber: safeStrStrip(r.RegNumber),
          Stus: safeStrStrip(r.Status),
          Name: safeStrStrip(r.Title),
          Fdate: safeStrStrip(r.RegDate),
          Issued: '',
        });
      });

      // 13. PhD Produced
      const phdRows = await LegacyRepository.getPhdProduced(empIdStr);
      phdRows.forEach((r) => {
        const scholar = safeStrStrip(r.ScholarName);
        const title = safeStrStrip(r.Title);
        const univ = safeStrStrip(r.University);
        const regy = safeStrStrip(r.RegYear);
        const awdy = safeStrStrip(r.AwardedYear);
        const role = safeStrStrip(r.Role);
        const status = safeStrStrip(r.Status);

        const yParts: string[] = [];
        if (regy) yParts.push(`Reg: ${regy}`);
        if (awdy) yParts.push(`Awarded: ${awdy}`);
        const yStr = yParts.length > 0 ? ` (${yParts.join(', ')})` : '';

        const phdTxt = `<b>${scholar}</b>${yStr} - "${title}" | Status: ${status} | Role: ${role} | ${univ}`;
        phdProduced.push(phdTxt);
      });
    }

    // Sorting Descending (Newest First)
    qualifications.sort((a, b) => safeIntYear(b.year_from) - safeIntYear(a.year_from));
    previousPositions.sort((a, b) => safeIntYear(b.year_from) - safeIntYear(a.year_from));
    universityPositions.sort((a, b) => safeIntYear(b.year_from) - safeIntYear(a.year_from));
    
    papersPublished.sort((a, b) => {
      const yDiff = safeIntYear(b.P_year) - safeIntYear(a.P_year);
      if (yDiff !== 0) return yDiff;
      return safeIntYear(b.P_month) - safeIntYear(a.P_month);
    });

    papersPresented.sort((a, b) => {
      const yDiff = safeIntYear(b.P_year) - safeIntYear(a.P_year);
      if (yDiff !== 0) return yDiff;
      return safeIntYear(b.P_month) - safeIntYear(a.P_month);
    });

    researchProjects.sort((a, b) => extractYearFromText(b.duration) - extractYearFromText(a.duration));
    foreignVisits.sort((a, b) => String(b.dfrom).localeCompare(String(a.dfrom)));
    eventsOrganized.sort((a, b) => String(b.Date_f).localeCompare(String(a.Date_f)));
    lecturesDelivered.sort((a, b) => String(b.Date_f).localeCompare(String(a.Date_f)));
    awardsReceived.sort((a, b) => String(b.A_date).localeCompare(String(a.A_date)));
    patents.sort((a, b) => String(b.Fdate).localeCompare(String(a.Fdate)));
    copyrights.sort((a, b) => String(b.Fdate).localeCompare(String(a.Fdate)));

    // Skills extraction
    let skills: string[] = [];
    if (faculty.specialization) {
      skills = faculty.specialization.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
    } else if (researchAreas.length > 0) {
      skills = researchAreas.slice(0, 5);
    } else {
      skills = ['Research', 'Teaching', 'Curriculum Development', 'Academic Mentoring'];
    }

    // Compile Summary Paragraph
    const summaryParts: string[] = [
      `${faculty.name} is a ${faculty.designation || 'Faculty Member'} in the Department of ${deptName || 'Academic studies'} at Periyar University.`,
    ];
    if (researchAreas.length > 0) {
      summaryParts.push(`Primary research areas and interests include ${researchAreas.slice(0, 3).join(', ')}.`);
    }
    if (universityPositions.length > 0 || previousPositions.length > 0) {
      const totalExp = universityPositions.length + previousPositions.length;
      summaryParts.push(`Brings academic and professional experience spanning ${totalExp} key roles.`);
    }
    if (awardsReceived.length > 0) {
      summaryParts.push(`Recipient of ${awardsReceived.length} professional awards and honors.`);
    }
    const summary = summaryParts.join(' ');

    const resumeData = {
      personal: {
        name: faculty.name,
        employee_id: empId || 'N/A',
        designation: faculty.designation || 'N/A',
        department: deptName || 'N/A',
        email: faculty.email || 'N/A',
        image_url: faculty.image_url || '',
        profile_url: faculty.profile_url || '',
      },
      summary,
      qualifications,
      previous_positions: previousPositions,
      university_positions: universityPositions,
      papers_published: papersPublished,
      papers_presented: papersPresented,
      research_projects: researchProjects,
      foreign_visits: foreignVisits,
      events_organized: eventsOrganized,
      lectures_delivered: lecturesDelivered,
      awards_received: awardsReceived,
      patents,
      copyrights,
      phd_produced: phdProduced,
      total_publications: papersPublished.length + papersPresented.length,
      total_foreign_visits: foreignVisits.length,
      total_events_organized: eventsOrganized.length,
      additional_info: {
        is_former: faculty.is_former === 1,
      },
      // Backward-compatibility keys
      experience: [...universityPositions, ...previousPositions].sort((a, b) => safeIntYear(b.year_from) - safeIntYear(a.year_from)),
      awards: awardsReceived,
      publications: researchProjects,
      academic_publications: [...papersPublished, ...papersPresented].sort((a, b) => {
        const yDiff = safeIntYear(b.P_year) - safeIntYear(a.P_year);
        if (yDiff !== 0) return yDiff;
        return safeIntYear(b.P_month) - safeIntYear(a.P_month);
      }),
    };

    return cleanMojibakeRecursive(resumeData);
  }

  // Create or synchronize resume_master record and PDF
  static async syncOrCreateResume(facultyId: number): Promise<any> {
    const faculty = await FacultyRepository.findById(facultyId) || await FacultyRepository.findByEmpId(String(facultyId));
    if (!faculty) {
      throw new ApiError(404, 'Faculty record not found');
    }

    const compiledData = await this.compileFacultyResumeData(faculty.id);
    const resumeRecord = await ResumeRepository.findByFacultyId(faculty.id);

    const pdfFilename = `resume_${faculty.id}.pdf`;
    const pdfDir = path.resolve(env.UPLOAD_DIR, 'resumes');
    const pdfFilepath = path.join(pdfDir, pdfFilename);
    const pdfUrl = `/api/uploads/resumes/${pdfFilename}`;

    // Ensure uploads/resumes directory exists
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    const compiledJsonStr = JSON.stringify(compiledData);
    let needSave = false;

    if (!resumeRecord) {
      needSave = true;
    } else {
      const storedData = JSON.parse(resumeRecord.generated_resume_json);
      // Deep compare
      if (JSON.stringify(storedData) !== compiledJsonStr) {
        needSave = true;
      }
    }

    const pdfExists = fs.existsSync(pdfFilepath);

    if (needSave || !pdfExists) {
      // Regenerate the PDF file on disk
      await generateResumePdf(compiledData, pdfFilepath);
      // Save/update DB
      await ResumeRepository.save(faculty.id, compiledJsonStr, pdfUrl);
    }

    const updatedRecord = await ResumeRepository.findByFacultyId(faculty.id);
    if (!updatedRecord) throw new ApiError(500, 'Failed to fetch updated resume record');

    return {
      id: updatedRecord.id,
      faculty_id: updatedRecord.faculty_id,
      generated_resume_json: JSON.parse(updatedRecord.generated_resume_json),
      generated_pdf_url: updatedRecord.generated_pdf_url,
      created_at: updatedRecord.created_at,
      updated_at: updatedRecord.updated_at,
    };
  }

  // Force regenerate resume (with spam checking matching 5-minute interval)
  static async forceRegenerateResume(facultyId: number, isAdmin = false): Promise<any> {
    const faculty = await FacultyRepository.findById(facultyId) || await FacultyRepository.findByEmpId(String(facultyId));
    if (!faculty) {
      throw new ApiError(404, 'Faculty record not found');
    }

    const resumeRecord = await ResumeRepository.findByFacultyId(faculty.id);
    const pdfFilename = `resume_${faculty.id}.pdf`;
    const pdfFilepath = path.resolve(env.UPLOAD_DIR, 'resumes', pdfFilename);
    const pdfExists = fs.existsSync(pdfFilepath);
    const pdfUrl = `/api/uploads/resumes/${pdfFilename}`;

    // Cache spam throttling (5 minutes - 300 seconds) for non-admin force regeneration
    if (!isAdmin && resumeRecord && pdfExists && resumeRecord.updated_at) {
      const diffSeconds = (Date.now() - new Date(resumeRecord.updated_at).getTime()) / 1000;
      if (diffSeconds < 300) {
        return {
          status: 'success',
          message: 'Resume recently regenerated. Returning cached version.',
          resume: {
            id: resumeRecord.id,
            faculty_id: resumeRecord.faculty_id,
            generated_resume_json: JSON.parse(resumeRecord.generated_resume_json),
            generated_pdf_url: resumeRecord.generated_pdf_url,
          },
        };
      }
    }

    const compiledData = await this.compileFacultyResumeData(faculty.id);
    const compiledJsonStr = JSON.stringify(compiledData);

    // Draw PDF on disk
    await generateResumePdf(compiledData, pdfFilepath);
    
    // Save to DB
    await ResumeRepository.save(faculty.id, compiledJsonStr, pdfUrl);

    const updatedRecord = await ResumeRepository.findByFacultyId(faculty.id);
    if (!updatedRecord) throw new ApiError(500, 'Failed to retrieve updated resume record');

    return {
      status: 'success',
      message: 'Resume and PDF regenerated successfully.',
      resume: {
        id: updatedRecord.id,
        faculty_id: updatedRecord.faculty_id,
        generated_resume_json: JSON.parse(updatedRecord.generated_resume_json),
        generated_pdf_url: updatedRecord.generated_pdf_url,
      },
    };
  }

  // Verify faculty email lookup
  static async verifyFacultyEmail(email: string): Promise<any> {
    const emailClean = email.trim().toLowerCase();
    if (!emailClean) {
      throw new ApiError(400, 'Email query parameter is required.');
    }

    // Query faculty by email
    const faculties = await FacultyRepository.getAllWithDeptName();
    const faculty = faculties.find((f) => f.email && f.email.trim().toLowerCase() === emailClean);

    if (!faculty) {
      throw new ApiError(404, 'No faculty record found with the official email address.');
    }

    const resume = await this.syncOrCreateResume(faculty.id);

    return {
      exists: true,
      faculty_id: faculty.id,
      name: faculty.name,
      designation: faculty.designation,
      email: faculty.email,
      resume,
    };
  }

  // Admin: list all resumes
  static async adminListResumes(filters: { search?: string; email?: string; deptId?: number }) {
    return await ResumeRepository.listAllForAdmin(filters);
  }

  // Admin: delete resume master record and PDF file
  static async adminDeleteResume(resumeId: number): Promise<void> {
    const resume = await ResumeRepository.findById(resumeId);
    if (!resume) {
      throw new ApiError(404, 'Resume record not found.');
    }

    // Delete PDF file if exists
    const pdfFilename = `resume_${resume.faculty_id}.pdf`;
    const pdfFilepath = path.resolve(env.UPLOAD_DIR, 'resumes', pdfFilename);
    if (fs.existsSync(pdfFilepath)) {
      try {
        fs.unlinkSync(pdfFilepath);
      } catch (err) {
        logger.error(`Failed to delete resume PDF file at ${pdfFilepath}`);
      }
    }

    await ResumeRepository.delete(resumeId);
  }

  // Daily cron to remove orphaned PDF resume files from disk
  static startResumeRegenCron(): void {
    cron.schedule('0 2 * * *', async () => {
      try {
        const resumesDir = path.resolve(env.UPLOAD_DIR, 'resumes');
        if (!fs.existsSync(resumesDir)) return;

        const files = await fs.promises.readdir(resumesDir);
        const records = await ResumeRepository.listAllForAdmin({});
        const activeIds = new Set(records.map(r => r.faculty_id));

        for (const file of files) {
          if (!file.endsWith('.pdf')) continue;
          const match = file.match(/^resume_(\d+)\.pdf$/);
          if (match) {
            const facultyId = Number(match[1]);
            if (!activeIds.has(facultyId)) {
              const filePath = path.join(resumesDir, file);
              await fs.promises.unlink(filePath);
              logger.info(`Cron cleanup: Deleted orphaned PDF resume file ${file}`);
            }
          }
        }
      } catch (err: any) {
        logger.error(`Cron cleanup task failed for resumes: ${err.message}`);
      }
    });
    logger.info('Daily resume PDF cleanup cron job scheduled successfully.');
  }
}
