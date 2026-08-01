import { FacultyRepository, Faculty } from '../repositories/facultyRepository';
import { LegacyRepository } from '../repositories/legacyRepository';
import { ApiError } from '../utils/ApiError';

export class FacultyService {
  // Add a new faculty member
  static async addFaculty(
    deptId: number,
    name: string,
    designation?: string,
    email?: string,
    specialization?: string,
    imageUrl?: string,
    profileUrl?: string,
    isFormer = 0,
    orderIndex = 0
  ): Promise<Faculty> {
    // 1. Proactively resolve emp_id from legacy DB if email is provided
    let empId: string | undefined;
    if (email) {
      const resolved = await LegacyRepository.resolveEmpIdByEmail(email);
      if (resolved) empId = resolved;
    }

    const id = await FacultyRepository.add(
      deptId,
      name,
      designation,
      email,
      specialization,
      imageUrl,
      profileUrl,
      isFormer,
      orderIndex,
      empId
    );

    const faculty = await FacultyRepository.findById(id);
    if (!faculty) throw new ApiError(500, 'Failed to retrieve created faculty');
    return faculty;
  }

  // Update a faculty member
  static async updateFaculty(
    id: number,
    fields: Partial<Omit<Faculty, 'id'>>
  ): Promise<Faculty> {
    const existing = await FacultyRepository.findById(id);
    if (!existing) {
      throw new ApiError(404, 'Faculty member not found');
    }

    // If email is changing, re-resolve emp_id from legacy DB
    if (fields.email && fields.email.trim().toLowerCase() !== (existing.email || '').trim().toLowerCase()) {
      const resolved = await LegacyRepository.resolveEmpIdByEmail(fields.email);
      fields.emp_id = resolved || null;
    }

    await FacultyRepository.update(id, fields);

    const updated = await FacultyRepository.findById(id);
    if (!updated) throw new ApiError(500, 'Failed to retrieve updated faculty');
    return updated;
  }

  // Delete a faculty member
  static async deleteFaculty(id: number): Promise<void> {
    const existing = await FacultyRepository.findById(id);
    if (!existing) {
      throw new ApiError(404, 'Faculty member not found');
    }
    await FacultyRepository.delete(id);
  }

  // Get all faculties with department name and resolved legacy emp_id
  static async getAllFacultiesWithEmpId(): Promise<any[]> {
    const faculties = await FacultyRepository.getAllWithDeptName();
    
    // Batch resolve employee IDs to optimize queries (avoid N+1 queries)
    const emails = faculties
      .map((f) => (f.email ? f.email.trim().toLowerCase() : ''))
      .filter((email) => email !== '');

    const resolvedMap: Record<string, string> = {};
    
    if (emails.length > 0) {
      const resolvedIds = await LegacyRepository.resolveEmailsByEmpIds(
        faculties.map((f) => f.emp_id).filter((id): id is string => id !== null)
      );
      
      // Also query legacy database for emails in case emp_id wasn't stored yet
      const fallbackResolved = await LegacyRepository.resolveEmpIdsByEmails(emails);
      
      // Resolve emails to ID maps
      const emailToIdMap = await LegacyRepository.resolveEmailsByEmpIds(fallbackResolved);
      emailToIdMap.forEach((item) => {
        resolvedMap[item.email] = item.emp_id;
      });
    }

    return faculties.map((f) => {
      let resolvedEmpId = f.emp_id;
      if (!resolvedEmpId && f.email && resolvedMap[f.email.trim().toLowerCase()]) {
        resolvedEmpId = resolvedMap[f.email.trim().toLowerCase()];
      }
      return {
        id: f.id,
        name: f.name,
        email: f.email,
        designation: f.designation,
        emp_id: resolvedEmpId || null,
        department_name: f.department_name || 'N/A',
      };
    });
  }
}
