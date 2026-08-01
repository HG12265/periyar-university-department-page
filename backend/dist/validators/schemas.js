"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicationUpdateSchema = exports.publicationSchema = exports.organizerUpdateSchema = exports.organizerSchema = exports.foreignVisitUpdateSchema = exports.foreignVisitSchema = exports.activityGallerySchema = exports.facilitiesTableSchema = exports.facilitiesConfigSchema = exports.facilityUpdateSchema = exports.facilityCreateSchema = exports.placementTableSaveSchema = exports.alumniTableSaveSchema = exports.facultyUpdateSchema = exports.facultyCreateSchema = exports.navLinkCreateSchema = exports.sectionUpdateSchema = exports.sectionCreateSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    username: zod_1.z.string().min(1, 'Username is required'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.sectionCreateSchema = zod_1.z.object({
    dept_id: zod_1.z.coerce.number().int().positive('dept_id must be a positive integer'),
    title: zod_1.z.string().optional(),
    section_title: zod_1.z.string().optional(),
    category: zod_1.z.string().default('home'),
    content: zod_1.z.string().default(''),
    order: zod_1.z.coerce.number().int().optional(),
    order_index: zod_1.z.coerce.number().int().optional(),
}).transform((data) => ({
    dept_id: data.dept_id,
    section_title: data.section_title || data.title || 'Untitled Section',
    category: data.category || 'home',
    content: data.content || '',
    order_index: data.order_index ?? data.order ?? 0,
}));
exports.sectionUpdateSchema = zod_1.z.object({
    title: zod_1.z.string().optional(),
    section_title: zod_1.z.string().optional(),
    category: zod_1.z.string().optional(),
    content: zod_1.z.string().optional(),
    order: zod_1.z.coerce.number().int().optional(),
    order_index: zod_1.z.coerce.number().int().optional(),
}).transform((data) => ({
    section_title: data.section_title || data.title,
    category: data.category,
    content: data.content,
    order_index: data.order_index ?? data.order,
}));
exports.navLinkCreateSchema = zod_1.z.object({
    dept_id: zod_1.z.coerce.number().int().positive('dept_id must be a positive integer'),
    label: zod_1.z.string().min(1, 'label is required'),
    url: zod_1.z.string().min(1, 'url is required'),
    order: zod_1.z.coerce.number().int().optional(),
    order_index: zod_1.z.coerce.number().int().optional(),
}).transform((data) => ({
    dept_id: data.dept_id,
    label: data.label,
    url: data.url,
    order_index: data.order_index ?? data.order ?? 0,
}));
const facultyBaseSchema = zod_1.z.object({
    dept_id: zod_1.z.coerce.number().int().positive('dept_id must be a positive integer'),
    name: zod_1.z.string().min(1, 'name is required'),
    designation: zod_1.z.string().optional().nullable(),
    email: zod_1.z.string().optional().nullable(),
    specialization: zod_1.z.string().optional().nullable(),
    image_url: zod_1.z.string().optional().nullable(),
    profile_url: zod_1.z.string().optional().nullable(),
    is_former: zod_1.z.coerce.number().int().default(0),
    order: zod_1.z.coerce.number().int().optional(),
    order_index: zod_1.z.coerce.number().int().optional(),
});
exports.facultyCreateSchema = facultyBaseSchema.transform((data) => ({
    dept_id: data.dept_id,
    name: data.name,
    designation: data.designation,
    email: data.email,
    specialization: data.specialization,
    image_url: data.image_url,
    profile_url: data.profile_url,
    is_former: data.is_former ?? 0,
    order_index: data.order_index ?? data.order ?? 0,
}));
exports.facultyUpdateSchema = facultyBaseSchema.partial().omit({ dept_id: true }).transform((data) => ({
    name: data.name,
    designation: data.designation,
    email: data.email,
    specialization: data.specialization,
    image_url: data.image_url,
    profile_url: data.profile_url,
    is_former: data.is_former,
    order_index: data.order_index ?? data.order,
}));
exports.alumniTableSaveSchema = zod_1.z.object({
    columns: zod_1.z.array(zod_1.z.any()).default([]),
    rows: zod_1.z.array(zod_1.z.any()).default([]),
    meeting_title: zod_1.z.string().optional().nullable(),
    meeting_images: zod_1.z.array(zod_1.z.string()).optional().nullable(),
});
exports.placementTableSaveSchema = exports.alumniTableSaveSchema;
const facilityBaseSchema = zod_1.z.object({
    dept_id: zod_1.z.coerce.number().int().positive('dept_id must be a positive integer'),
    title: zod_1.z.string().min(1, 'title is required'),
    image_url: zod_1.z.string().optional().nullable(),
    link_url: zod_1.z.string().optional().nullable(),
    order: zod_1.z.coerce.number().int().optional(),
    order_index: zod_1.z.coerce.number().int().optional(),
});
exports.facilityCreateSchema = facilityBaseSchema.transform((data) => ({
    dept_id: data.dept_id,
    title: data.title,
    image_url: data.image_url,
    link_url: data.link_url,
    order_index: data.order_index ?? data.order ?? 0,
}));
exports.facilityUpdateSchema = facilityBaseSchema.partial().omit({ dept_id: true }).transform((data) => ({
    title: data.title,
    image_url: data.image_url,
    link_url: data.link_url,
    order_index: data.order_index ?? data.order,
}));
exports.facilitiesConfigSchema = zod_1.z.object({
    facilities_req_title: zod_1.z.string().optional().nullable(),
    facilities_req_file: zod_1.z.string().optional().nullable(),
    facilities_btn_label: zod_1.z.string().optional().nullable(),
    facilities_btn_url: zod_1.z.string().optional().nullable(),
});
exports.facilitiesTableSchema = zod_1.z.object({
    columns: zod_1.z.array(zod_1.z.any()).default([]),
    rows: zod_1.z.array(zod_1.z.any()).default([]),
    table_title: zod_1.z.string().default(''),
});
exports.activityGallerySchema = zod_1.z.object({
    events: zod_1.z.array(zod_1.z.object({
        title: zod_1.z.string(),
        images: zod_1.z.array(zod_1.z.string()).default([]),
    })).default([]),
});
exports.foreignVisitSchema = zod_1.z.object({
    emp_id: zod_1.z.string().optional().nullable(),
    faculty_email: zod_1.z.string().email().optional().nullable(),
    company: zod_1.z.string().optional().nullable(),
    purpose: zod_1.z.string().optional().nullable(),
    dfrom: zod_1.z.string().optional().nullable(),
    dto: zod_1.z.string().optional().nullable(),
    agency: zod_1.z.string().optional().nullable(),
    invitation: zod_1.z.string().optional().nullable(),
    certificate: zod_1.z.string().optional().nullable(),
});
exports.foreignVisitUpdateSchema = exports.foreignVisitSchema.partial();
exports.organizerSchema = zod_1.z.object({
    emp_id: zod_1.z.string().optional().nullable(),
    faculty_email: zod_1.z.string().email().optional().nullable(),
    T_role: zod_1.z.string().optional().nullable(),
    O_type: zod_1.z.string().optional().nullable(),
    Title: zod_1.z.string().optional().nullable(),
    Date_f: zod_1.z.string().optional().nullable(),
    Date_t: zod_1.z.string().optional().nullable(),
    Level: zod_1.z.string().optional().nullable(),
    Role: zod_1.z.string().optional().nullable(),
    Org: zod_1.z.string().optional().nullable(),
    Org_Address: zod_1.z.string().optional().nullable(),
    local: zod_1.z.string().optional().nullable(),
    outstation: zod_1.z.string().optional().nullable(),
    Amount: zod_1.z.string().optional().nullable(),
    letter: zod_1.z.string().optional().nullable(),
    Sanctioned: zod_1.z.string().optional().nullable(),
    Utilized: zod_1.z.string().optional().nullable(),
    uc: zod_1.z.string().optional().nullable(),
    report: zod_1.z.string().optional().nullable(),
    photo1: zod_1.z.string().optional().nullable(),
    photo2: zod_1.z.string().optional().nullable(),
    photo3: zod_1.z.string().optional().nullable(),
    photo4: zod_1.z.string().optional().nullable(),
});
exports.organizerUpdateSchema = exports.organizerSchema.partial();
exports.publicationSchema = zod_1.z.object({
    emp_id: zod_1.z.string().optional().nullable(),
    faculty_email: zod_1.z.string().email().optional().nullable(),
    P_type: zod_1.z.string().optional().nullable(),
    Title: zod_1.z.string().optional().nullable(),
    P_Name: zod_1.z.string().optional().nullable(),
    P_Level: zod_1.z.string().optional().nullable(),
    Author_1: zod_1.z.string().optional().nullable(),
    Author_2: zod_1.z.string().optional().nullable(),
    Author_3: zod_1.z.string().optional().nullable(),
    Volume: zod_1.z.string().optional().nullable(),
    Issue: zod_1.z.string().optional().nullable(),
    Page_from: zod_1.z.string().optional().nullable(),
    Page_to: zod_1.z.string().optional().nullable(),
    Impact_F: zod_1.z.string().optional().nullable(),
    Indexing: zod_1.z.string().optional().nullable(),
    Publisher: zod_1.z.string().optional().nullable(),
    P_year: zod_1.z.string().optional().nullable(),
    P_month: zod_1.z.string().optional().nullable(),
    DOI: zod_1.z.string().optional().nullable(),
    Webpage: zod_1.z.string().optional().nullable(),
    Paper: zod_1.z.string().optional().nullable(),
    UPDATED: zod_1.z.string().optional().nullable(),
});
exports.publicationUpdateSchema = exports.publicationSchema.partial();
