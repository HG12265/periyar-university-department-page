"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
const departmentService_1 = require("../services/departmentService");
const departmentRepository_1 = require("../repositories/departmentRepository");
const facultyRepository_1 = require("../repositories/facultyRepository");
const ApiError_1 = require("../utils/ApiError");
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
            departmentRepository_1.DepartmentRepository.getAll.mockResolvedValue(mockDepts);
            const result = await departmentService_1.DepartmentService.getAllDepartments();
            expect(result).toEqual(mockDepts);
            expect(departmentRepository_1.DepartmentRepository.getAll).toHaveBeenCalled();
        });
    });
    describe('createDepartment', () => {
        it('should throw 400 if slug already exists', async () => {
            const existingDept = { id: 1, name: 'CS', slug: 'computer-science' };
            departmentRepository_1.DepartmentRepository.findBySlug.mockResolvedValue(existingDept);
            await expect(departmentService_1.DepartmentService.createDepartment('Computer Science', 'computer-science')).rejects.toThrow(new ApiError_1.ApiError(400, "Slug 'computer-science' is already taken."));
        });
        it('should create new department and return it', async () => {
            departmentRepository_1.DepartmentRepository.findBySlug.mockResolvedValue(null);
            departmentRepository_1.DepartmentRepository.create.mockResolvedValue(10);
            departmentRepository_1.DepartmentRepository.findById.mockResolvedValue({
                id: 10,
                name: 'Physics',
                slug: 'physics',
                title: 'Physics Department',
                facilities_table: null,
            });
            // Mock sub-calls inside getDepartmentById
            departmentRepository_1.DepartmentRepository.getSectionsByDept.mockResolvedValue([]);
            departmentRepository_1.DepartmentRepository.getNavLinksByDept.mockResolvedValue([]);
            facultyRepository_1.FacultyRepository.getByDept.mockResolvedValue([]);
            departmentRepository_1.DepartmentRepository.getFacilitiesByDept.mockResolvedValue([]);
            const result = await departmentService_1.DepartmentService.createDepartment('Physics', 'physics', 'Physics Department');
            expect(departmentRepository_1.DepartmentRepository.create).toHaveBeenCalledWith('Physics', 'physics', 'Physics Department', undefined);
            expect(result.id).toBe(10);
            expect(result.name).toBe('Physics');
        });
    });
    describe('updateDepartment', () => {
        it('should throw 400 if updating to an already taken slug', async () => {
            const existingDept = { id: 5, name: 'Math', slug: 'mathematics' };
            departmentRepository_1.DepartmentRepository.findBySlug.mockResolvedValue(existingDept);
            await expect(departmentService_1.DepartmentService.updateDepartment(10, 'Math Upgraded', 'mathematics')).rejects.toThrow(new ApiError_1.ApiError(400, "Slug 'mathematics' is already taken."));
        });
        it('should update department details successfully', async () => {
            // Find by slug should return null (no collision)
            departmentRepository_1.DepartmentRepository.findBySlug.mockResolvedValue(null);
            departmentRepository_1.DepartmentRepository.findById.mockResolvedValue({
                id: 10,
                name: 'Math Upgraded',
                slug: 'math-new',
                facilities_table: null,
            });
            departmentRepository_1.DepartmentRepository.getSectionsByDept.mockResolvedValue([]);
            departmentRepository_1.DepartmentRepository.getNavLinksByDept.mockResolvedValue([]);
            facultyRepository_1.FacultyRepository.getByDept.mockResolvedValue([]);
            departmentRepository_1.DepartmentRepository.getFacilitiesByDept.mockResolvedValue([]);
            const result = await departmentService_1.DepartmentService.updateDepartment(10, 'Math Upgraded', 'math-new');
            expect(departmentRepository_1.DepartmentRepository.update).toHaveBeenCalledWith(10, 'Math Upgraded', 'math-new', undefined, undefined);
            expect(result.name).toBe('Math Upgraded');
        });
    });
    describe('deleteDepartment', () => {
        it('should throw 404 if department does not exist', async () => {
            departmentRepository_1.DepartmentRepository.findById.mockResolvedValue(null);
            await expect(departmentService_1.DepartmentService.deleteDepartment(99)).rejects.toThrow(new ApiError_1.ApiError(404, 'Department not found'));
        });
        it('should invoke delete on repository if department exists', async () => {
            departmentRepository_1.DepartmentRepository.findById.mockResolvedValue({ id: 1, name: 'CS' });
            await departmentService_1.DepartmentService.deleteDepartment(1);
            expect(departmentRepository_1.DepartmentRepository.delete).toHaveBeenCalledWith(1);
        });
    });
});
