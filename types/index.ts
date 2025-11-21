// Type definitions for CivicConnect Platform

export type ComplaintStatus = 'submitted' | 'acknowledged' | 'in_progress' | 'resolved' | 'escalated' | 'closed' | 'rejected';

export type UserRole = 'citizen' | 'ward_officer' | 'district_admin' | 'state_admin';

export type ComplaintCategory =
    | 'service_delivery'
    | 'infrastructure'
    | 'public_welfare'
    | 'administrative'
    | 'utilities'
    | 'health_sanitation'
    | 'education'
    | 'transport'
    | 'environment'
    | 'police'
    | 'corruption'
    | 'rural_development'
    | 'taxation'
    | 'housing'
    | 'other';

export interface User {
    user_id: string;
    email: string;
    phone?: string;
    name: string;
    role: UserRole;
    avatar?: string;
    location?: {
        lat: number;
        lng: number;
    };
    created_at: string;
    updated_at?: string;
    preferences?: {
        language: string;
        notifications: {
            email: boolean;
            sms: boolean;
            push: boolean;
        };
        theme: 'light' | 'dark' | 'system';
    };
}

export interface Location {
    lat: number;
    lng: number;
    address?: {
        street?: string;
        city: string;
        state: string;
        pincode: string;
        country?: string;
    };
    landmark?: string;
}

export interface Complaint {
    complaint_id: string;
    user_id: string;
    user?: User;
    title: string;
    description: string;
    category: ComplaintCategory;
    sub_category?: string;
    location: Location;
    images?: string[];
    status: ComplaintStatus;
    priority: number;
    assigned_officer_id?: string;
    assigned_officer?: Officer;
    escalation_level: number;
    is_public: boolean;
    is_urgent: boolean;
    metadata?: Record<string, any>;
    created_at: string;
    updated_at?: string;
    acknowledged_at?: string;
    resolved_at?: string;
    resolution_notes?: string;
    votes_count?: number;
    comments_count?: number;
    has_voted?: boolean; // For current user
}

export interface Officer {
    officer_id: string;
    name: string;
    designation: string;
    department: string;
    contact: string;
    email?: string;
    location?: Location;
    current_workload: number;
    max_workload: number;
    status: 'active' | 'inactive' | 'on_leave';
    jurisdiction: {
        level: 'ward' | 'block' | 'district' | 'state';
        area: string;
        categories: ComplaintCategory[];
    };
    performance?: {
        total_assigned: number;
        total_resolved: number;
        avg_resolution_time: number; // in days
        rating: number; // 0-5
    };
}

export interface Comment {
    comment_id: string;
    complaint_id: string;
    user_id: string;
    user?: User;
    content: string;
    is_officer: boolean;
    created_at: string;
    updated_at?: string;
}

export interface Vote {
    vote_id: string;
    complaint_id: string;
    user_id: string;
    vote_type: 'priority' | 'similar_issue';
    created_at: string;
}

export interface Escalation {
    escalation_id: string;
    complaint_id: string;
    from_officer_id?: string;
    to_officer_id: string;
    from_officer?: Officer;
    to_officer?: Officer;
    reason: string;
    escalation_level: number;
    created_at: string;
}

export interface Notification {
    notification_id: string;
    user_id: string;
    type: string;
    title: string;
    message: string;
    data?: Record<string, any>;
    is_read: boolean;
    created_at: string;
}

export interface ActivityLog {
    log_id: string;
    complaint_id: string;
    user_id?: string;
    user?: User;
    action: 'created' | 'updated' | 'escalated' | 'resolved' | 'commented' | 'voted';
    old_value?: any;
    new_value?: any;
    ip_address?: string;
    user_agent?: string;
    created_at: string;
}

// Analytics Types
export interface DashboardMetrics {
    total_complaints: number;
    resolved_complaints: number;
    pending_complaints: number;
    in_progress_complaints: number;
    avg_resolution_time: number; // in days
    resolution_rate: number; // percentage
    active_users: number;
    complaints_today: number;
    complaints_this_week: number;
    complaints_this_month: number;
}

export interface CategoryStats {
    category: ComplaintCategory;
    count: number;
    resolved: number;
    pending: number;
    avg_resolution_time: number;
}

export interface LocationStats {
    city: string;
    state: string;
    count: number;
    coordinates: {
        lat: number;
        lng: number;
    };
}

export interface OfficerPerformance {
    officer_id: string;
    officer_name: string;
    department: string;
    total_assigned: number;
    total_resolved: number;
    total_pending: number;
    avg_resolution_time: number;
    resolution_rate: number;
    current_workload: number;
    rating: number;
}

export interface TrendData {
    date: string;
    complaints: number;
    resolved: number;
    pending: number;
}

export interface HeatmapPoint {
    complaint_id: string;
    lat: number;
    lng: number;
    category: ComplaintCategory;
    status: ComplaintStatus;
    priority: number;
    title: string;
    created_at: string;
}

// Form Types
export interface ComplaintFormData {
    title: string;
    description: string;
    category: ComplaintCategory;
    sub_category?: string;
    location: {
        lat: number;
        lng: number;
    };
    address?: {
        street?: string;
        city: string;
        state: string;
        pincode: string;
    };
    landmark?: string;
    images?: File[];
    is_urgent: boolean;
    is_public: boolean;
}

export interface LoginFormData {
    email: string;
    password: string;
}

export interface RegisterFormData {
    email: string;
    password: string;
    confirm_password: string;
    name: string;
    phone: string;
    agree_terms: boolean;
}

export interface ProfileUpdateData {
    name?: string;
    phone?: string;
    email?: string;
    avatar?: File;
    preferences?: {
        language?: string;
        notifications?: {
            email?: boolean;
            sms?: boolean;
            push?: boolean;
        };
        theme?: 'light' | 'dark' | 'system';
    };
}

// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        message: string;
        code?: string;
        details?: any;
    };
    meta?: {
        timestamp: string;
        request_id: string;
        pagination?: {
            page: number;
            limit: number;
            total: number;
            total_pages: number;
        };
    };
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
    };
}

// Filter Types
export interface ComplaintFilters {
    status?: ComplaintStatus | ComplaintStatus[];
    category?: ComplaintCategory | ComplaintCategory[];
    priority?: 'low' | 'medium' | 'high' | 'critical';
    date_from?: string;
    date_to?: string;
    location?: {
        lat: number;
        lng: number;
        radius: number; // in kilometers
    };
    search?: string;
    assigned_officer_id?: string;
    user_id?: string;
    is_public?: boolean;
    is_urgent?: boolean;
    escalation_level?: number;
}

export interface ComplaintSort {
    sort_by?: 'created_at' | 'updated_at' | 'priority' | 'votes_count';
    order?: 'asc' | 'desc';
}

// WebSocket Types
export interface WebSocketMessage {
    event: string;
    data: any;
    timestamp: string;
}

export interface ComplaintUpdateMessage {
    complaint_id: string;
    field: string;
    old_value: any;
    new_value: any;
    updated_by: string;
}

// Export/Report Types
export interface ExportOptions {
    format: 'pdf' | 'excel' | 'csv';
    filters?: ComplaintFilters;
    columns?: string[];
    date_range?: {
        from: string;
        to: string;
    };
}

// Chart Data Types
export interface ChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor?: string | string[];
        borderColor?: string | string[];
        fill?: boolean;
    }[];
}
