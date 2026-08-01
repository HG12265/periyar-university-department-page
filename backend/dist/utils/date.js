"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDateToMonthYear = parseDateToMonthYear;
exports.safeIntYear = safeIntYear;
exports.extractYearFromText = extractYearFromText;
exports.safeStrStrip = safeStrStrip;
const dayjs_1 = __importDefault(require("dayjs"));
function parseDateToMonthYear(d) {
    if (!d)
        return ['', ''];
    const dStr = String(d).trim();
    if (dStr === '' || dStr === '0000-00-00' || dStr === '1970-01-01') {
        return ['', ''];
    }
    // Handle standard Date object
    if (d instanceof Date) {
        const dj = (0, dayjs_1.default)(d);
        return [dj.format('MMMM'), dj.format('YYYY')];
    }
    // Parse string
    const dj = (0, dayjs_1.default)(dStr);
    if (dj.isValid()) {
        return [dj.format('MMMM'), dj.format('YYYY')];
    }
    return ['', ''];
}
function safeIntYear(val) {
    if (val === undefined || val === null)
        return 0;
    if (typeof val === 'number')
        return Math.floor(val);
    const digits = String(val).replace(/\D/g, '');
    if (digits.length === 0)
        return 0;
    const parsed = parseInt(digits, 10);
    return isNaN(parsed) ? 0 : parsed;
}
function extractYearFromText(val) {
    if (!val)
        return 0;
    const match = String(val).match(/\b(19\d\d|20\d\d)\b/);
    if (match) {
        const year = parseInt(match[1], 10);
        return isNaN(year) ? 0 : year;
    }
    return 0;
}
function safeStrStrip(val) {
    if (val === undefined || val === null)
        return '';
    if (val instanceof Date) {
        return (0, dayjs_1.default)(val).format('YYYY-MM-DD');
    }
    return String(val).trim();
}
