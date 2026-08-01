-- 1. Create All Tables (Schema-aligned with Node.js / MySQL models)
CREATE TABLE IF NOT EXISTS audit_logs (
	id INT AUTO_INCREMENT PRIMARY KEY, 
	timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
	request_id VARCHAR(36) NOT NULL, 
	user_id INT, 
	ip_address VARCHAR(100), 
	user_agent TEXT, 
	action VARCHAR(255) NOT NULL, 
	resource VARCHAR(255) NOT NULL, 
	status VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS departments (
	id INT AUTO_INCREMENT PRIMARY KEY, 
	name VARCHAR(255) NOT NULL, 
	slug VARCHAR(255) UNIQUE NOT NULL, 
	title VARCHAR(255), 
	banner_image TEXT, 
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
	facilities_req_title VARCHAR(255), 
	facilities_req_file TEXT, 
	facilities_btn_label VARCHAR(255), 
	facilities_btn_url TEXT, 
	facilities_table TEXT
);

CREATE TABLE IF NOT EXISTS jti_blacklist (
	id INT AUTO_INCREMENT PRIMARY KEY, 
	jti VARCHAR(255) NOT NULL, 
	expires_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
	id INT AUTO_INCREMENT PRIMARY KEY, 
	username VARCHAR(255) UNIQUE NOT NULL, 
	hashed_password VARCHAR(255) NOT NULL, 
	role VARCHAR(100) DEFAULT 'admin', 
	failed_login_attempts INT NOT NULL DEFAULT 0, 
	locked_until TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS activity_galleries (
	id INT AUTO_INCREMENT PRIMARY KEY, 
	dept_id INT UNIQUE, 
	events TEXT, 
	FOREIGN KEY(dept_id) REFERENCES departments (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS alumni_tables (
	id INT AUTO_INCREMENT PRIMARY KEY, 
	dept_id INT UNIQUE, 
	`columns` TEXT NOT NULL, 
	`rows` TEXT NOT NULL, 
	meeting_title VARCHAR(255), 
	meeting_images TEXT, 
	FOREIGN KEY(dept_id) REFERENCES departments (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS department_nav_links (
	id INT AUTO_INCREMENT PRIMARY KEY, 
	dept_id INT, 
	label VARCHAR(100) NOT NULL, 
	url VARCHAR(255) NOT NULL, 
	order_index INT DEFAULT 0, 
	FOREIGN KEY(dept_id) REFERENCES departments (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS department_sections (
	id INT AUTO_INCREMENT PRIMARY KEY, 
	dept_id INT, 
	section_title VARCHAR(255) NOT NULL, 
	category VARCHAR(100) DEFAULT 'home', 
	content TEXT NOT NULL, 
	order_index INT DEFAULT 0, 
	FOREIGN KEY(dept_id) REFERENCES departments (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS facilities (
	id INT AUTO_INCREMENT PRIMARY KEY, 
	dept_id INT, 
	title VARCHAR(255) NOT NULL, 
	image_url TEXT, 
	link_url TEXT, 
	order_index INT DEFAULT 0, 
	FOREIGN KEY(dept_id) REFERENCES departments (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS faculties (
	id INT AUTO_INCREMENT PRIMARY KEY, 
	dept_id INT, 
	name VARCHAR(255) NOT NULL, 
	designation VARCHAR(255), 
	email VARCHAR(255), 
	specialization TEXT, 
	image_url TEXT, 
	profile_url TEXT, 
	is_former INT DEFAULT 0, 
	order_index INT DEFAULT 0, 
	emp_id VARCHAR(20) DEFAULT NULL,
	FOREIGN KEY(dept_id) REFERENCES departments (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS journals (
	id INT AUTO_INCREMENT PRIMARY KEY, 
	dept_id INT, 
	title VARCHAR(255) NOT NULL, 
	pdf_url VARCHAR(255), 
	order_index INT DEFAULT 0, 
	FOREIGN KEY(dept_id) REFERENCES departments (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS placement_tables (
	id INT AUTO_INCREMENT PRIMARY KEY, 
	dept_id INT UNIQUE, 
	`columns` TEXT NOT NULL, 
	`rows` TEXT NOT NULL, 
	meeting_title VARCHAR(255), 
	meeting_images TEXT, 
	FOREIGN KEY(dept_id) REFERENCES departments (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
	id INT AUTO_INCREMENT PRIMARY KEY, 
	user_id INT, 
	token_hash VARCHAR(64) NOT NULL UNIQUE, 
	jti VARCHAR(255) NOT NULL UNIQUE, 
	expires_at TIMESTAMP NOT NULL, 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Stamp Alembic head version so migrations are synced
CREATE TABLE IF NOT EXISTS alembic_version (
    version_num VARCHAR(32) PRIMARY KEY
);
INSERT IGNORE INTO alembic_version (version_num) VALUES ('951040a1033e');

-- 2. Clear existing records for clean seeding
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM department_sections;
DELETE FROM department_nav_links;
DELETE FROM faculties;
DELETE FROM alumni_tables;
DELETE FROM activity_galleries;
DELETE FROM placement_tables;
DELETE FROM facilities;
DELETE FROM journals;
DELETE FROM departments;
SET FOREIGN_KEY_CHECKS = 1;

-- 3. Seed only the 27 Departments
INSERT INTO departments (id, name, slug, title, banner_image) VALUES
(1, 'Biochemistry', 'biochemistry', 'DEPARTMENT OF BIOCHEMISTRY', '/logo.JPG'),
(2, 'Biotechnology', 'biotechnology', 'DEPARTMENT OF BIOTECHNOLOGY', '/logo.JPG'),
(3, 'Microbiology', 'microbiology', 'DEPARTMENT OF MICROBIOLOGY', '/logo.JPG'),
(4, 'Computer Science', 'computer-science', 'DEPARTMENT OF COMPUTER SCIENCE', '/logo.JPG'),
(5, 'Library and Information Science', 'library-and-information-science', 'DEPARTMENT OF LIBRARY AND INFORMATION SCIENCE', '/logo.JPG'),
(6, 'Mathematics', 'mathematics', 'DEPARTMENT OF MATHEMATICS', '/logo.JPG'),
(7, 'Statistics', 'statistics', 'DEPARTMENT OF STATISTICS', '/logo.JPG'),
(8, 'Physics', 'physics', 'DEPARTMENT OF PHYSICS', '/logo.JPG'),
(9, 'Chemistry', 'chemistry', 'DEPARTMENT OF CHEMISTRY', '/logo.JPG'),
(10, 'Geology', 'geology', 'DEPARTMENT OF GEOLOGY', '/logo.JPG'),
(11, 'Commerce', 'commerce', 'DEPARTMENT OF COMMERCE', '/logo.JPG'),
(12, 'Economics', 'economics', 'DEPARTMENT OF ECONOMICS', '/logo.JPG'),
(13, 'Management Studies', 'management-studies', 'DEPARTMENT OF MANAGEMENT STUDIES', '/logo.JPG'),
(14, 'English', 'english', 'DEPARTMENT OF ENGLISH', '/logo.JPG'),
(15, 'Tamil', 'tamil', 'DEPARTMENT OF TAMIL', '/logo.JPG'),
(16, 'Education', 'education', 'DEPARTMENT OF EDUCATION', '/logo.JPG'),
(17, 'Food Science and Nutrition', 'food-science-and-nutrition', 'DEPARTMENT OF FOOD SCIENCE AND NUTRITION', '/logo.JPG'),
(18, 'Textiles and Apparel Design', 'textiles-and-apparel-design', 'DEPARTMENT OF TEXTILES AND APPAREL DESIGN', '/logo.JPG'),
(19, 'Sociology', 'sociology', 'DEPARTMENT OF SOCIOLOGY', '/logo.JPG'),
(20, 'Psychology', 'psychology', 'DEPARTMENT OF PSYCHOLOGY', '/logo.JPG'),
(21, 'Journalism and Mass Communication', 'journalism-and-mass-communication', 'DEPARTMENT OF JOURNALISM AND MASS COMMUNICATION', '/logo.JPG'),
(22, 'History', 'history', 'DEPARTMENT OF HISTORY', '/logo.JPG'),
(23, 'Botany', 'botany', 'DEPARTMENT OF BOTANY', '/logo.JPG'),
(24, 'Zoology', 'zoology', 'DEPARTMENT OF ZOOLOGY', '/logo.JPG'),
(25, 'Nutrition and Dietetics', 'nutrition-and-dietetics', 'DEPARTMENT OF NUTRITION AND DIETETICS', '/logo.JPG'),
(26, 'Energy Science and Technology', 'energy-science-and-technology', 'DEPARTMENT OF ENERGY SCIENCE AND TECHNOLOGY', '/logo.JPG'),
(27, 'Environmental Science', 'environmental-science', 'DEPARTMENT OF ENVIRONMENTAL SCIENCE', '/logo.JPG');


-- 4. Seed precisely ordered dynamic navigation sections for all 27 departments
INSERT INTO department_nav_links (dept_id, label, url, order_index) VALUES
-- 1. Biochemistry
(1, 'Home', '#home', 1),
(1, 'Programmes Offered', '#programmes', 2),
(1, 'Syllabus', '#syllabus', 3),
(1, 'Faculty', '#faculty', 4),
(1, 'Activities', '#activities', 5),
(1, 'Facilities', '#facilities', 6),
(1, 'Funded Projects', '#projects', 7),
(1, 'PDF', '#pdf', 8),
(1, 'Alumni', '#alumni', 9),
(1, 'Contact', '#contact', 10),

-- 2. Biotechnology
(2, 'Home', '#home', 1),
(2, 'Programmes Offered', '#programmes', 2),
(2, 'Syllabus', '#syllabus', 3),
(2, 'Faculty', '#faculty', 4),
(2, 'Activities', '#activities', 5),
(2, 'Facilities', '#facilities', 6),
(2, 'Funded Projects', '#projects', 7),
(2, 'UGC-MRP', '#ugc-mrp', 8),
(2, 'Alumni', '#alumni', 9),
(2, 'Contact', '#contact', 10),

-- 3. Microbiology
(3, 'Home', '#home', 1),
(3, 'Programmes Offered', '#programmes', 2),
(3, 'Syllabus', '#syllabus', 3),
(3, 'Faculty', '#faculty', 4),
(3, 'PDF', '#pdf', 5),
(3, 'Activities', '#activities', 6),
(3, 'Facilities', '#facilities', 7),
(3, 'Funded Project', '#projects', 8),
(3, 'Journal', '#journal', 9),
(3, 'Alumni', '#alumni', 10),
(3, 'Contact', '#contact', 11),

-- 4. Computer Science
(4, 'Home', '#home', 1),
(4, 'Programmes Offered', '#programmes', 2),
(4, 'Syllabus', '#syllabus', 3),
(4, 'Faculty', '#faculty', 4),
(4, 'Conference', '#conference', 5),
(4, 'Activities', '#activities', 6),
(4, 'Facilities', '#facilities', 7),
(4, 'Funded Projects', '#projects', 8),
(4, 'Journal', '#journal', 9),
(4, 'Alumni', '#alumni', 10),
(4, 'Contact', '#contact', 11),

-- 5. Library and Information Science
(5, 'Home', '#home', 1),
(5, 'Programmes Offered', '#programmes', 2),
(5, 'Syllabus', '#syllabus', 3),
(5, 'Faculty', '#faculty', 4),
(5, 'Visiting Faculty', '#visiting-faculty', 5),
(5, 'Activities', '#activities', 6),
(5, 'Facilities', '#facilities', 7),
(5, 'Funded Project', '#projects', 8),
(5, 'Alumni', '#alumni', 9),
(5, 'Contact', '#contact', 10),

-- 6. Mathematics
(6, 'Home', '#home', 1),
(6, 'Programmes Offered', '#programmes', 2),
(6, 'Syllabus', '#syllabus', 3),
(6, 'Faculty', '#faculty', 4),
(6, 'Activities', '#activities', 5),
(6, 'PhD Awarded', '#phd-awarded', 6),
(6, 'Facilities', '#facilities', 7),
(6, 'Funded Project', '#projects', 8),
(6, 'PDF', '#pdf', 9),
(6, 'Alumni', '#alumni', 10),
(6, 'Contact', '#contact', 11),

-- 7. Statistics
(7, 'Home', '#home', 1),
(7, 'Programmes Offered', '#programmes', 2),
(7, 'Syllabus', '#syllabus', 3),
(7, 'Faculty', '#faculty', 4),
(7, 'Activities', '#activities', 5),
(7, 'Facilities', '#facilities', 6),
(7, 'Funded Project', '#projects', 7),
(7, 'Alumni', '#alumni', 8),
(7, 'Contact', '#contact', 9),

-- 8. Physics
(8, 'Home', '#home', 1),
(8, 'Programmes Offered', '#programmes', 2),
(8, 'Syllabus', '#syllabus', 3),
(8, 'Faculty', '#faculty', 4),
(8, 'Former Faculty', '#former-faculty', 5),
(8, 'Activities', '#activities', 6),
(8, 'Facilities', '#facilities', 7),
(8, 'Funded Project', '#projects', 8),
(8, 'Alumni', '#alumni', 9),
(8, 'Contact', '#contact', 10),

-- 9. Chemistry
(9, 'Home', '#home', 1),
(9, 'Programmes Offered', '#programmes', 2),
(9, 'Syllabus', '#syllabus', 3),
(9, 'Faculty', '#faculty', 4),
(9, 'DST-Faculty', '#dst-faculty', 5),
(9, 'Activities', '#activities', 6),
(9, 'Facilities', '#facilities', 7),
(9, 'Funded Project', '#projects', 8),
(9, 'Alumni', '#alumni', 9),
(9, 'Contact', '#contact', 10),

-- 10. Geology
(10, 'Home', '#home', 1),
(10, 'Programmes Offered', '#programmes', 2),
(10, 'Syllabus', '#syllabus', 3),
(10, 'Faculty', '#faculty', 4),
(10, 'PDF', '#pdf', 5),
(10, 'Activities', '#activities', 6),
(10, 'Facilities', '#facilities', 7),
(10, 'UGC-MRP', '#ugc-mrp', 8),
(10, 'Funded Project', '#projects', 9),
(10, 'Museum', '#museum', 10),
(10, 'Alumni', '#alumni', 11),
(10, 'Contact', '#contact', 12),

-- 11. Commerce
(11, 'Home', '#home', 1),
(11, 'Programmes Offered', '#programmes', 2),
(11, 'Syllabus', '#syllabus', 3),
(11, 'Faculty', '#faculty', 4),
(11, 'Activities', '#activities', 5),
(11, 'Facilities', '#facilities', 6),
(11, 'Research Projects', '#projects', 7),
(11, 'Alumni', '#alumni', 8),
(11, 'Contact', '#contact', 9),

-- 12. Economics
(12, 'Home', '#home', 1),
(12, 'Programmes Offered', '#programmes', 2),
(12, 'Syllabus', '#syllabus', 3),
(12, 'Faculty', '#faculty', 4),
(12, 'Activities', '#activities', 5),
(12, 'Facilities', '#facilities', 6),
(12, 'Funded Project', '#projects', 7),
(12, 'Alumni', '#alumni', 8),
(12, 'Contact', '#contact', 9),

-- 13. Management Studies
(13, 'Home', '#home', 1),
(13, 'Programmes Offered', '#programmes', 2),
(13, 'Syllabus', '#syllabus', 3),
(13, 'Faculty', '#faculty', 4),
(13, 'PDF', '#pdf', 5),
(13, 'Activities', '#activities', 6),
(13, 'Facilities', '#facilities', 7),
(13, 'Funded Project', '#projects', 8),
(13, 'Alumni', '#alumni', 9),
(13, 'Contact', '#contact', 10),

-- 14. English
(14, 'Home', '#home', 1),
(14, 'Programmes Offered', '#programmes', 2),
(14, 'Syllabus', '#syllabus', 3),
(14, 'Faculty', '#faculty', 4),
(14, 'Activities', '#activities', 5),
(14, 'Facilities', '#facilities', 6),
(14, 'Funded Project', '#projects', 7),
(14, 'Best Practices', '#best-practices', 8),
(14, 'Alumni', '#alumni', 9),
(14, 'Contact', '#contact', 10),

-- 15. Tamil
(15, 'Home', '#home', 1),
(15, 'Programmes Offered', '#programmes', 2),
(15, 'Syllabus', '#syllabus', 3),
(15, 'Faculty', '#faculty', 4),
(15, 'Activities', '#activities', 5),
(15, 'Facilities', '#facilities', 6),
(15, 'Funded Project', '#projects', 7),
(15, 'Alumni', '#alumni', 8),
(15, 'Contact', '#contact', 9),

-- 16. Education
(16, 'Home', '#home', 1),
(16, 'Programmes Offered', '#programmes', 2),
(16, 'Syllabus', '#syllabus', 3),
(16, 'Faculty', '#faculty', 4),
(16, 'Activities', '#activities', 5),
(16, 'Student Details', '#student-details', 6),
(16, 'Fees Details', '#fees-details', 7),
(16, 'Finance Details', '#finance-details', 8),
(16, 'Facilities', '#facilities', 9),
(16, 'Funded Project', '#projects', 10),
(16, 'Affidavit', '#affidavit', 11),
(16, 'Contact', '#contact', 12),

-- 17. Food Science and Nutrition
(17, 'Home', '#home', 1),
(17, 'Programmes Offered', '#programmes', 2),
(17, 'Syllabus', '#syllabus', 3),
(17, 'Faculty', '#faculty', 4),
(17, 'GuestFaculty', '#guestfaculty', 5),
(17, 'Visting Professor', '#visting-professor', 6),
(17, 'Activities', '#activities', 7),
(17, 'Facilities', '#facilities', 8),
(17, 'Funded Project', '#projects', 9),
(17, 'Alumni', '#alumni', 10),
(17, 'Contact', '#contact', 11),

-- 18. Textiles and Apparel Design
(18, 'Home', '#home', 1),
(18, 'Programmes Offered', '#programmes', 2),
(18, 'Syllabus', '#syllabus', 3),
(18, 'Faculty', '#faculty', 4),
(18, 'GuestFaculty', '#guestfaculty', 5),
(18, 'Activities', '#activities', 6),
(18, 'Facilities', '#facilities', 7),
(18, 'Funded Project', '#projects', 8),
(18, 'Alumni', '#alumni', 9),
(18, 'Contact', '#contact', 10),

-- 19. Sociology
(19, 'Home', '#home', 1),
(19, 'Programmes Offered', '#programmes', 2),
(19, 'Syllabus', '#syllabus', 3),
(19, 'Faculty', '#faculty', 4),
(19, 'Activities', '#activities', 5),
(19, 'Facilities', '#facilities', 6),
(19, 'Funded Project', '#projects', 7),
(19, 'Alumni', '#alumni', 8),
(19, 'Contact', '#contact', 9),

-- 20. Psychology
(20, 'Home', '#home', 1),
(20, 'Programmes Offered', '#programmes', 2),
(20, 'Syllabus', '#syllabus', 3),
(20, 'Faculty', '#faculty', 4),
(20, 'Activities', '#activities', 5),
(20, 'Facilities', '#facilities', 6),
(20, 'Funded Project', '#projects', 7),
(20, 'JOURNAL', '#journal', 8),
(20, 'Alumni', '#alumni', 9),
(20, 'Contact', '#contact', 10),

-- 21. Journalism and Mass Communication
(21, 'Home', '#home', 1),
(21, 'Programmes Offered', '#programmes', 2),
(21, 'Syllabus', '#syllabus', 3),
(21, 'Faculty', '#faculty', 4),
(21, 'Activities', '#activities', 5),
(21, 'Facilities', '#facilities', 6),
(21, 'Funded Project', '#projects', 7),
(21, 'Alumni', '#alumni', 8),
(21, 'Contact', '#contact', 9),

-- 22. History
(22, 'Home', '#home', 1),
(22, 'Programmes Offered', '#programmes', 2),
(22, 'Syllabus', '#syllabus', 3),
(22, 'Faculty', '#faculty', 4),
(22, 'Activities', '#activities', 5),
(22, 'Facilities', '#facilities', 6),
(22, 'Alumni', '#alumni', 7),
(22, 'Contact', '#contact', 8),

-- 23. Botany
(23, 'Home', '#home', 1),
(23, 'Programmes Offered', '#programmes', 2),
(23, 'Syllabus', '#syllabus', 3),
(23, 'Faculty', '#faculty', 4),
(23, 'Activities', '#activities', 5),
(23, 'Facilities', '#facilities', 6),
(23, 'Funded Project', '#projects', 7),
(23, 'Alumni', '#alumni', 8),
(23, 'Contact', '#contact', 9),

-- 24. Zoology
(24, 'Home', '#home', 1),
(24, 'Programmes Offered', '#programmes', 2),
(24, 'Syllabus', '#syllabus', 3),
(24, 'Faculty', '#faculty', 4),
(24, 'Activities', '#activities', 5),
(24, 'Facilities', '#facilities', 6),
(24, 'Museum', '#museum', 7),
(24, 'Funded Project', '#projects', 8),
(24, 'Alumni', '#alumni', 9),
(24, 'Contact', '#contact', 10),

-- 25. Nutrition and Dietetics
(25, 'Home', '#home', 1),
(25, 'Programmes Offered', '#programmes', 2),
(25, 'Syllabus', '#syllabus', 3),
(25, 'Faculty', '#faculty', 4),
(25, 'Activities', '#activities', 5),
(25, 'Facilities', '#facilities', 6),
(25, 'Funded Project', '#projects', 7),
(25, 'Alumni', '#alumni', 8),
(25, 'Contact', '#contact', 9),

-- 26. Energy Science and Technology
(26, 'Home', '#home', 1),
(26, 'Programmes Offered', '#programmes', 2),
(26, 'Syllabus', '#syllabus', 3),
(26, 'Faculty', '#faculty', 4),
(26, 'Guest Faculty', '#guest-faculty', 5),
(26, 'Activities', '#activities', 6),
(26, 'Facilities', '#facilities', 7),
(26, 'Funded Project', '#projects', 8),
(26, 'AICTE', '#aicte', 9),
(26, 'Gallery', '#gallery', 10),
(26, 'Energy and Environment Park', '#energy-environment-park', 11),
(26, 'Student\'s Project', '#student-project', 12),
(26, 'Placement', '#placement', 13),
(26, 'Alumni', '#alumni', 14),
(26, 'Contact', '#contact', 15),

-- 27. Environmental Science
(27, 'Home', '#home', 1),
(27, 'Programmes Offered', '#programmes', 2),
(27, 'Syllabus', '#syllabus', 3),
(27, 'Faculty', '#faculty', 4),
(27, 'Activities', '#activities', 5),
(27, 'Facilities', '#facilities', 6),
(27, 'Funded Project', '#projects', 7),
(27, 'Alumni', '#alumni', 8),
(27, 'Contact', '#contact', 9);
