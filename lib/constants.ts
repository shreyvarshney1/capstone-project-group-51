// API Base Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// FastAPI Backend Endpoints (example URLs - assuming backend structure)
export const API_ENDPOINTS = {
    // Authentication
    AUTH: {
        REGISTER: '/auth/register',
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
        RESET_PASSWORD: '/auth/reset-password',
        VERIFY_OTP: '/auth/verify-otp',
    },
    // Complaints
    COMPLAINTS: {
        LIST: '/complaints',
        CREATE: '/complaints',
        DETAIL: (id: string) => `/complaints/${id}`,
        UPDATE: (id: string) => `/complaints/${id}`,
        DELETE: (id: string) => `/complaints/${id}`,
        ESCALATE: (id: string) => `/complaints/${id}/escalate`,
        RESOLVE: (id: string) => `/complaints/${id}/resolve`,
        HISTORY: (id: string) => `/complaints/${id}/history`,
        NEARBY: '/complaints/nearby',
        SIMILAR: (id: string) => `/complaints/similar/${id}`,
        DUPLICATE_CHECK: '/complaints/duplicate-check',
        EXPORT: '/complaints/export',
        TRENDING: '/complaints/trending',
        HEATMAP: '/complaints/heatmap',
    },
    // Community
    COMMUNITY: {
        COMMENTS: (id: string) => `/complaints/${id}/comments`,
        ADD_COMMENT: (id: string) => `/complaints/${id}/comments`,
        DELETE_COMMENT: (commentId: string) => `/comments/${commentId}`,
        VOTE: (id: string) => `/complaints/${id}/vote`,
        SHARE: (id: string) => `/complaints/${id}/share`,
    },
    // Analytics
    ANALYTICS: {
        DASHBOARD: '/analytics/dashboard',
        BY_CATEGORY: '/analytics/by-category',
        BY_LOCATION: '/analytics/by-location',
        BY_OFFICER: '/analytics/by-officer',
        TRENDS: '/analytics/trends',
        PREDICTIONS: '/analytics/predictions',
        REPORT: '/analytics/report',
    },
    // User
    USER: {
        PROFILE: '/users/me',
        UPDATE_PROFILE: '/users/me',
        UPLOAD_AVATAR: '/users/me/avatar',
        NOTIFICATIONS: '/users/me/notifications',
        MARK_READ: (id: string) => `/notifications/${id}/read`,
    },
    // Officers
    OFFICERS: {
        LIST: '/officers',
        DETAIL: (id: string) => `/officers/${id}`,
        UPDATE_WORKLOAD: (id: string) => `/officers/${id}/workload`,
    },
    // Admin
    ADMIN: {
        USERS: '/admin/users',
        UPDATE_ROLE: (id: string) => `/admin/users/${id}/role`,
        CATEGORIES: '/admin/categories',
        SYSTEM_CONFIG: '/admin/system-config',
        AUDIT_LOGS: '/admin/audit-logs',
        BROADCAST: '/admin/broadcast',
    },
    // File Upload
    FILES: {
        UPLOAD: '/files/upload',
    },
};

// Complaint Categories
export const COMPLAINT_CATEGORIES = [
    { id: 'service_delivery', label: 'Service Delivery', icon: '🛠️' },
    { id: 'infrastructure', label: 'Infrastructure', icon: '🏗️' },
    { id: 'public_welfare', label: 'Public Welfare Schemes', icon: '🤝' },
    { id: 'administrative', label: 'Administrative Issues', icon: '📋' },
    { id: 'utilities', label: 'Utilities (Water/Power)', icon: '💡' },
    { id: 'health_sanitation', label: 'Health & Sanitation', icon: '🏥' },
    { id: 'education', label: 'Education', icon: '📚' },
    { id: 'transport', label: 'Transport', icon: '🚌' },
    { id: 'environment', label: 'Environment', icon: '🌳' },
    { id: 'police', label: 'Police & Law Enforcement', icon: '👮' },
    { id: 'corruption', label: 'Corruption', icon: '⚖️' },
    { id: 'rural_development', label: 'Rural Development', icon: '🌾' },
    { id: 'taxation', label: 'Taxation', icon: '💰' },
    { id: 'housing', label: 'Housing', icon: '🏠' },
    { id: 'other', label: 'Other', icon: '📌' },
] as const;

// Complaint Status
export const COMPLAINT_STATUS = {
    SUBMITTED: 'submitted',
    ACKNOWLEDGED: 'acknowledged',
    IN_PROGRESS: 'in_progress',
    RESOLVED: 'resolved',
    ESCALATED: 'escalated',
    CLOSED: 'closed',
    REJECTED: 'rejected',
} as const;

// Status Labels and Colors
export const STATUS_CONFIG = {
    submitted: { label: 'Submitted', color: 'bg-blue-500', textColor: 'text-blue-700', bgColor: 'bg-blue-50' },
    acknowledged: { label: 'Acknowledged', color: 'bg-yellow-500', textColor: 'text-yellow-700', bgColor: 'bg-yellow-50' },
    in_progress: { label: 'In Progress', color: 'bg-purple-500', textColor: 'text-purple-700', bgColor: 'bg-purple-50' },
    resolved: { label: 'Resolved', color: 'bg-green-500', textColor: 'text-green-700', bgColor: 'bg-green-50' },
    escalated: { label: 'Escalated', color: 'bg-red-500', textColor: 'text-red-700', bgColor: 'bg-red-50' },
    closed: { label: 'Closed', color: 'bg-gray-500', textColor: 'text-gray-700', bgColor: 'bg-gray-50' },
    rejected: { label: 'Rejected', color: 'bg-orange-500', textColor: 'text-orange-700', bgColor: 'bg-orange-50' },
} as const;

// User Roles
export const USER_ROLES = {
    CITIZEN: 'citizen',
    WARD_OFFICER: 'ward_officer',
    DISTRICT_ADMIN: 'district_admin',
    STATE_ADMIN: 'state_admin',
} as const;

// Priority Levels
export const PRIORITY_LEVELS = {
    LOW: 0,
    MEDIUM: 50,
    HIGH: 100,
    CRITICAL: 200,
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
    COMPLAINT_CREATED: 'complaint_created',
    COMPLAINT_UPDATED: 'complaint_updated',
    COMPLAINT_RESOLVED: 'complaint_resolved',
    COMPLAINT_ESCALATED: 'complaint_escalated',
    COMMENT_ADDED: 'comment_added',
    NEW_VOTE: 'new_vote',
} as const;

// Language Options (10 Indian Languages)
export const LANGUAGE_OPTIONS = [
    { code: 'en', label: 'English', nativeLabel: 'English' },
    { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
    { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी' },
    { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ' },
    { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்' },
    { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు' },
    { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা' },
    { code: 'gu', label: 'Gujarati', nativeLabel: 'ગુજરાતી' },
    { code: 'pa', label: 'Punjabi', nativeLabel: 'ਪੰਜਾਬੀ' },
    { code: 'ml', label: 'Malayalam', nativeLabel: 'മലയാളം' },
] as const;

// Map Configuration
export const MAP_CONFIG = {
    DEFAULT_CENTER: { lat: 23.2599, lng: 77.4126 }, // Bhopal, India
    DEFAULT_ZOOM: 12,
    MAX_ZOOM: 18,
    MIN_ZOOM: 5,
};

// File Upload Limits
export const FILE_LIMITS = {
    MAX_IMAGES: 5,
    MAX_IMAGE_SIZE: 2 * 1024 * 1024, // 2MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
};

// Pagination
export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 20,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
};

// WebSocket Events
export const WS_EVENTS = {
    COMPLAINT_UPDATE: 'complaint_update',
    NEW_COMMENT: 'new_comment',
    NEW_VOTE: 'new_vote',
    STATUS_CHANGE: 'status_change',
};

// Chart Colors
export const CHART_COLORS = [
    '#3B82F6', // blue
    '#EF4444', // red
    '#10B981', // green
    '#F59E0B', // yellow
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#14B8A6', // teal
    '#F97316', // orange
    '#6366F1', // indigo
    '#84CC16', // lime
];

// Time Ranges for Analytics
export const TIME_RANGES = [
    { label: 'Last 7 Days', value: '7d' },
    { label: 'Last 30 Days', value: '30d' },
    { label: 'Last 90 Days', value: '90d' },
    { label: 'Last 6 Months', value: '6m' },
    { label: 'Last Year', value: '1y' },
    { label: 'All Time', value: 'all' },
] as const;

// Escalation Levels
export const ESCALATION_LEVELS = {
    WARD: 0,
    BLOCK: 1,
    DISTRICT: 2,
    STATE: 3,
    CENTRAL: 4,
} as const;

// Auto-save interval (milliseconds)
export const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

// API Rate Limits (for UI display)
export const RATE_LIMITS = {
    COMPLAINTS_PER_MINUTE: 20,
    COMMENTS_PER_MINUTE: 30,
    API_CALLS_PER_MINUTE: 100,
};
