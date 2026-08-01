import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const sectionCreateSchema = z.object({
  dept_id: z.coerce.number().int().positive('dept_id must be a positive integer'),
  title: z.string().optional(),
  section_title: z.string().optional(),
  category: z.string().default('home'),
  content: z.string().default(''),
  order: z.coerce.number().int().optional(),
  order_index: z.coerce.number().int().optional(),
}).transform((data) => ({
  dept_id: data.dept_id,
  section_title: data.section_title || data.title || 'Untitled Section',
  category: data.category || 'home',
  content: data.content || '',
  order_index: data.order_index ?? data.order ?? 0,
}));

export const sectionUpdateSchema = z.object({
  title: z.string().optional(),
  section_title: z.string().optional(),
  category: z.string().optional(),
  content: z.string().optional(),
  order: z.coerce.number().int().optional(),
  order_index: z.coerce.number().int().optional(),
}).transform((data) => ({
  section_title: data.section_title || data.title,
  category: data.category,
  content: data.content,
  order_index: data.order_index ?? data.order,
}));

export const navLinkCreateSchema = z.object({
  dept_id: z.coerce.number().int().positive('dept_id must be a positive integer'),
  label: z.string().min(1, 'label is required'),
  url: z.string().min(1, 'url is required'),
  order: z.coerce.number().int().optional(),
  order_index: z.coerce.number().int().optional(),
}).transform((data) => ({
  dept_id: data.dept_id,
  label: data.label,
  url: data.url,
  order_index: data.order_index ?? data.order ?? 0,
}));

const facultyBaseSchema = z.object({
  dept_id: z.coerce.number().int().positive('dept_id must be a positive integer'),
  name: z.string().min(1, 'name is required'),
  designation: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  specialization: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  profile_url: z.string().optional().nullable(),
  is_former: z.coerce.number().int().default(0),
  order: z.coerce.number().int().optional(),
  order_index: z.coerce.number().int().optional(),
});

export const facultyCreateSchema = facultyBaseSchema.transform((data) => ({
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

export const facultyUpdateSchema = facultyBaseSchema.partial().omit({ dept_id: true }).transform((data) => ({
  name: data.name,
  designation: data.designation,
  email: data.email,
  specialization: data.specialization,
  image_url: data.image_url,
  profile_url: data.profile_url,
  is_former: data.is_former,
  order_index: data.order_index ?? data.order,
}));

export const alumniTableSaveSchema = z.object({
  columns: z.array(z.any()).default([]),
  rows: z.array(z.any()).default([]),
  meeting_title: z.string().optional().nullable(),
  meeting_images: z.array(z.string()).optional().nullable(),
});

export const placementTableSaveSchema = alumniTableSaveSchema;

const facilityBaseSchema = z.object({
  dept_id: z.coerce.number().int().positive('dept_id must be a positive integer'),
  title: z.string().min(1, 'title is required'),
  image_url: z.string().optional().nullable(),
  link_url: z.string().optional().nullable(),
  order: z.coerce.number().int().optional(),
  order_index: z.coerce.number().int().optional(),
});

export const facilityCreateSchema = facilityBaseSchema.transform((data) => ({
  dept_id: data.dept_id,
  title: data.title,
  image_url: data.image_url,
  link_url: data.link_url,
  order_index: data.order_index ?? data.order ?? 0,
}));

export const facilityUpdateSchema = facilityBaseSchema.partial().omit({ dept_id: true }).transform((data) => ({
  title: data.title,
  image_url: data.image_url,
  link_url: data.link_url,
  order_index: data.order_index ?? data.order,
}));

export const facilitiesConfigSchema = z.object({
  facilities_req_title: z.string().optional().nullable(),
  facilities_req_file: z.string().optional().nullable(),
  facilities_btn_label: z.string().optional().nullable(),
  facilities_btn_url: z.string().optional().nullable(),
});

export const facilitiesTableSchema = z.object({
  columns: z.array(z.any()).default([]),
  rows: z.array(z.any()).default([]),
  table_title: z.string().default(''),
});

export const activityGallerySchema = z.object({
  events: z.array(
    z.object({
      title: z.string(),
      images: z.array(z.string()).default([]),
    })
  ).default([]),
});

export const foreignVisitSchema = z.object({
  emp_id: z.string().optional().nullable(),
  faculty_email: z.string().email().optional().nullable(),
  company: z.string().optional().nullable(),
  purpose: z.string().optional().nullable(),
  dfrom: z.string().optional().nullable(),
  dto: z.string().optional().nullable(),
  agency: z.string().optional().nullable(),
  invitation: z.string().optional().nullable(),
  certificate: z.string().optional().nullable(),
});

export const foreignVisitUpdateSchema = foreignVisitSchema.partial();

export const organizerSchema = z.object({
  emp_id: z.string().optional().nullable(),
  faculty_email: z.string().email().optional().nullable(),
  T_role: z.string().optional().nullable(),
  O_type: z.string().optional().nullable(),
  Title: z.string().optional().nullable(),
  Date_f: z.string().optional().nullable(),
  Date_t: z.string().optional().nullable(),
  Level: z.string().optional().nullable(),
  Role: z.string().optional().nullable(),
  Org: z.string().optional().nullable(),
  Org_Address: z.string().optional().nullable(),
  local: z.string().optional().nullable(),
  outstation: z.string().optional().nullable(),
  Amount: z.string().optional().nullable(),
  letter: z.string().optional().nullable(),
  Sanctioned: z.string().optional().nullable(),
  Utilized: z.string().optional().nullable(),
  uc: z.string().optional().nullable(),
  report: z.string().optional().nullable(),
  photo1: z.string().optional().nullable(),
  photo2: z.string().optional().nullable(),
  photo3: z.string().optional().nullable(),
  photo4: z.string().optional().nullable(),
});

export const organizerUpdateSchema = organizerSchema.partial();

export const publicationSchema = z.object({
  emp_id: z.string().optional().nullable(),
  faculty_email: z.string().email().optional().nullable(),
  P_type: z.string().optional().nullable(),
  Title: z.string().optional().nullable(),
  P_Name: z.string().optional().nullable(),
  P_Level: z.string().optional().nullable(),
  Author_1: z.string().optional().nullable(),
  Author_2: z.string().optional().nullable(),
  Author_3: z.string().optional().nullable(),
  Volume: z.string().optional().nullable(),
  Issue: z.string().optional().nullable(),
  Page_from: z.string().optional().nullable(),
  Page_to: z.string().optional().nullable(),
  Impact_F: z.string().optional().nullable(),
  Indexing: z.string().optional().nullable(),
  Publisher: z.string().optional().nullable(),
  P_year: z.string().optional().nullable(),
  P_month: z.string().optional().nullable(),
  DOI: z.string().optional().nullable(),
  Webpage: z.string().optional().nullable(),
  Paper: z.string().optional().nullable(),
  UPDATED: z.string().optional().nullable(),
});

export const publicationUpdateSchema = publicationSchema.partial();
