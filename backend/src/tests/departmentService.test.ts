// Mock db first before any imports to prevent database pool instantiation
jest.mock('../db', () => ({
  primaryDB: {
    query: jest.fn(),
    getConnection: jest.fn(),
  },
  resumeDB: {
    query: jest.fn(),
    getConnection: jest.fn(),
  },
  testDbConnections: jest.fn(),
  closeDbPools: jest.fn(),
}));

import { DepartmentService } from '../services/departmentService';
import { DepartmentRepository } from '../repositories/departmentRepository';
import { FacultyRepository } from '../repositories/facultyRepository';
import { ApiError } from '../utils/ApiError';

jest.mock('../repositories/departmentRepository');
jest.mock('../repositories/facultyRepository');

describe('DepartmentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllDepartments', () => {
    it('should return lists of departments from repository', async () => {
      const mockDepts = [
        { id: 1, name: 'Computer Science', slug: 'computer-science' },
        { id: 2, name: 'Mathematics', slug: 'mathematics' },
      ];
      (DepartmentRepository.getAll as jest.Mock).mockResolvedValue(mockDepts);

      const result = await DepartmentService.getAllDepartments();
      expect(result).toEqual(mockDepts);
      expect(DepartmentRepository.getAll).toHaveBeenCalled();
    });
  });

  describe('createDepartment', () => {
    it('should throw 400 if slug already exists', async () => {
      const existingDept = { id: 1, name: 'CS', slug: 'computer-science' };
      (DepartmentRepository.findBySlug as jest.Mock).mockResolvedValue(existingDept);

      await expect(
        DepartmentService.createDepartment('Computer Science', 'computer-science')
      ).rejects.toThrow(new ApiError(400, "Slug 'computer-science' is already taken."));
    });

    it('should create new department and return it', async () => {
      (DepartmentRepository.findBySlug as jest.Mock).mockResolvedValue(null);
      (DepartmentRepository.create as jest.Mock).mockResolvedValue(10);
      (DepartmentRepository.findById as jest.Mock).mockResolvedValue({
        id: 10,
        name: 'Physics',
        slug: 'physics',
        title: 'Physics Department',
        facilities_table: null,
      });

      // Mock sub-calls inside getDepartmentById
      (DepartmentRepository.getSectionsByDept as jest.Mock).mockResolvedValue([]);
      (DepartmentRepository.getNavLinksByDept as jest.Mock).mockResolvedValue([]);
      (FacultyRepository.getByDept as jest.Mock).mockResolvedValue([]);
      (DepartmentRepository.getFacilitiesByDept as jest.Mock).mockResolvedValue([]);

      const result = await DepartmentService.createDepartment('Physics', 'physics', 'Physics Department');

      expect(DepartmentRepository.create).toHaveBeenCalledWith('Physics', 'physics', 'Physics Department', undefined);
      expect(result.id).toBe(10);
      expect(result.name).toBe('Physics');
    });
  });

  describe('updateDepartment', () => {
    it('should throw 400 if updating to an already taken slug', async () => {
      const existingDept = { id: 5, name: 'Math', slug: 'mathematics' };
      (DepartmentRepository.findBySlug as jest.Mock).mockResolvedValue(existingDept);

      await expect(
        DepartmentService.updateDepartment(10, 'Math Upgraded', 'mathematics')
      ).rejects.toThrow(new ApiError(400, "Slug 'mathematics' is already taken."));
    });

    it('should update department details successfully', async () => {
      // Find by slug should return null (no collision)
      (DepartmentRepository.findBySlug as jest.Mock).mockResolvedValue(null);
      (DepartmentRepository.findById as jest.Mock).mockResolvedValue({
        id: 10,
        name: 'Math Upgraded',
        slug: 'math-new',
        facilities_table: null,
      });

      (DepartmentRepository.getSectionsByDept as jest.Mock).mockResolvedValue([]);
      (DepartmentRepository.getNavLinksByDept as jest.Mock).mockResolvedValue([]);
      (FacultyRepository.getByDept as jest.Mock).mockResolvedValue([]);
      (DepartmentRepository.getFacilitiesByDept as jest.Mock).mockResolvedValue([]);

      const result = await DepartmentService.updateDepartment(10, 'Math Upgraded', 'math-new');

      expect(DepartmentRepository.update).toHaveBeenCalledWith(10, 'Math Upgraded', 'math-new', undefined, undefined);
      expect(result.name).toBe('Math Upgraded');
    });
  });

  describe('deleteDepartment', () => {
    it('should throw 404 if department does not exist', async () => {
      (DepartmentRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(DepartmentService.deleteDepartment(99)).rejects.toThrow(
        new ApiError(404, 'Department not found')
      );
    });

    it('should invoke delete on repository if department exists', async () => {
      (DepartmentRepository.findById as jest.Mock).mockResolvedValue({ id: 1, name: 'CS' });

      await DepartmentService.deleteDepartment(1);
      expect(DepartmentRepository.delete).toHaveBeenCalledWith(1);
    });
  });
});
