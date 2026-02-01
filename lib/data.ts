// Comprehensive mock data for CivicConnect Platform

export const mockUsers = [
  {
    id: "user_1",
    name: "Rajesh Kumar",
    email: "rajesh.kumar@example.com",
    phone: "+91 98765 43210",
    role: "CITIZEN" as const,
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh",
    createdAt: new Date("2024-01-15").toISOString(),
    updatedAt: new Date("2024-01-15").toISOString(),
  },
  {
    id: "user_2",
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    phone: "+91 98765 43211",
    role: "CITIZEN" as const,
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
    createdAt: new Date("2024-02-10").toISOString(),
    updatedAt: new Date("2024-02-10").toISOString(),
  },
  {
    id: "user_3",
    name: "Amit Patel",
    email: "amit.patel@example.com",
    phone: "+91 98765 43212",
    role: "CITIZEN" as const,
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amit",
    createdAt: new Date("2024-03-05").toISOString(),
    updatedAt: new Date("2024-03-05").toISOString(),
  },
  {
    id: "admin_1",
    name: "Administrator",
    email: "admin@civicconnect.com",
    role: "ADMIN" as const,
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
    createdAt: new Date("2023-01-01").toISOString(),
    updatedAt: new Date("2023-01-01").toISOString(),
  },
];

export const mockCategories = [
  {
    id: "cat_1",
    name: "Roads & Infrastructure",
    description: "Issues related to roads, bridges, and infrastructure",
    createdAt: new Date("2023-01-01").toISOString(),
    updatedAt: new Date("2023-01-01").toISOString(),
  },
  {
    id: "cat_2",
    name: "Water Supply",
    description: "Water supply and drainage issues",
    createdAt: new Date("2023-01-01").toISOString(),
    updatedAt: new Date("2023-01-01").toISOString(),
  },
  {
    id: "cat_3",
    name: "Street Lighting",
    description: "Street lights and public lighting issues",
    createdAt: new Date("2023-01-01").toISOString(),
    updatedAt: new Date("2023-01-01").toISOString(),
  },
  {
    id: "cat_4",
    name: "Waste Management",
    description: "Garbage collection and waste disposal",
    createdAt: new Date("2023-01-01").toISOString(),
    updatedAt: new Date("2023-01-01").toISOString(),
  },
  {
    id: "cat_5",
    name: "Parks & Recreation",
    description: "Public parks and recreational facilities",
    createdAt: new Date("2023-01-01").toISOString(),
    updatedAt: new Date("2023-01-01").toISOString(),
  },
  {
    id: "cat_6",
    name: "Public Safety",
    description: "Safety and security concerns",
    createdAt: new Date("2023-01-01").toISOString(),
    updatedAt: new Date("2023-01-01").toISOString(),
  },
  {
    id: "cat_7",
    name: "Health & Sanitation",
    description: "Health and sanitation issues",
    createdAt: new Date("2023-01-01").toISOString(),
    updatedAt: new Date("2023-01-01").toISOString(),
  },
  {
    id: "cat_8",
    name: "Traffic & Parking",
    description: "Traffic management and parking issues",
    createdAt: new Date("2023-01-01").toISOString(),
    updatedAt: new Date("2023-01-01").toISOString(),
  },
];

export const mockIssues = [
  {
    id: "issue_1",
    title: "Pothole on MG Road causing traffic hazard",
    description: "Large pothole near the intersection of MG Road and 5th Cross. Multiple vehicles have been damaged. Urgent repair needed.",
    status: "SUBMITTED" as const,
    categoryId: "cat_1",
    latitude: 12.9716,
    longitude: 77.5946,
    address: "MG Road, Bangalore, Karnataka 560001",
    imageUrl: "https://images.unsplash.com/photo-1599684658866-5f26101f8e87?w=400",
    userId: "user_1",
    createdAt: new Date("2024-11-15").toISOString(),
    updatedAt: new Date("2024-11-15").toISOString(),
  },
  {
    id: "issue_2",
    title: "Water leakage on Brigade Road",
    description: "Continuous water leakage from main pipeline causing wastage and slippery road conditions.",
    status: "ACKNOWLEDGED" as const,
    categoryId: "cat_2",
    latitude: 12.9698,
    longitude: 77.6025,
    address: "Brigade Road, Bangalore, Karnataka 560025",
    imageUrl: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400",
    userId: "user_2",
    createdAt: new Date("2024-11-12").toISOString(),
    updatedAt: new Date("2024-11-18").toISOString(),
  },
  {
    id: "issue_3",
    title: "Street light not working on Residency Road",
    description: "Several street lights are non-functional, making the area unsafe during night hours.",
    status: "IN_PROGRESS" as const,
    categoryId: "cat_3",
    latitude: 12.9763,
    longitude: 77.6053,
    address: "Residency Road, Bangalore, Karnataka 560025",
    imageUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400",
    userId: "user_3",
    createdAt: new Date("2024-11-10").toISOString(),
    updatedAt: new Date("2024-11-19").toISOString(),
  },
  {
    id: "issue_4",
    title: "Garbage pile-up near Cubbon Park",
    description: "Accumulated garbage not collected for several days. Creating unhygienic conditions.",
    status: "RESOLVED" as const,
    categoryId: "cat_4",
    latitude: 12.9762,
    longitude: 77.5929,
    address: "Cubbon Park Road, Bangalore, Karnataka 560001",
    imageUrl: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=400",
    userId: "user_1",
    createdAt: new Date("2024-11-05").toISOString(),
    updatedAt: new Date("2024-11-16").toISOString(),
  },
  {
    id: "issue_5",
    title: "Broken footpath on Commercial Street",
    description: "Damaged footpath tiles creating obstacles for pedestrians and senior citizens.",
    status: "SUBMITTED" as const,
    categoryId: "cat_1",
    latitude: 12.9824,
    longitude: 77.6085,
    address: "Commercial Street, Bangalore, Karnataka 560007",
    imageUrl: "https://images.unsplash.com/photo-1584861858752-f0587a38a60e?w=400",
    userId: "user_2",
    createdAt: new Date("2024-11-18").toISOString(),
    updatedAt: new Date("2024-11-18").toISOString(),
  },
  {
    id: "issue_6",
    title: "Drainage overflow in Indiranagar",
    description: "Blocked drainage causing water overflow during rain. Mosquito breeding concern.",
    status: "IN_PROGRESS" as const,
    categoryId: "cat_2",
    latitude: 12.9719,
    longitude: 77.6412,
    address: "Indiranagar 12th Main Road, Bangalore, Karnataka 560038",
    imageUrl: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400",
    userId: "user_3",
    createdAt: new Date("2024-11-14").toISOString(),
    updatedAt: new Date("2024-11-19").toISOString(),
  },
  {
    id: "issue_7",
    title: "Park maintenance needed at Lalbagh",
    description: "Playground equipment needs repair and painting. Garden paths require cleaning.",
    status: "ACKNOWLEDGED" as const,
    categoryId: "cat_5",
    latitude: 12.9507,
    longitude: 77.5848,
    address: "Lalbagh Botanical Garden, Bangalore, Karnataka 560004",
    imageUrl: "https://images.unsplash.com/photo-1585933646398-e5d5840e4d5c?w=400",
    userId: "user_1",
    createdAt: new Date("2024-11-11").toISOString(),
    updatedAt: new Date("2024-11-17").toISOString(),
  },
  {
    id: "issue_8",
    title: "Traffic signal malfunction at Richmond Circle",
    description: "Traffic signal not working properly causing congestion during peak hours.",
    status: "SUBMITTED" as const,
    categoryId: "cat_8",
    latitude: 12.9944,
    longitude: 77.5954,
    address: "Richmond Circle, Bangalore, Karnataka 560025",
    imageUrl: "https://images.unsplash.com/photo-1520052205864-92d242b3a76b?w=400",
    userId: "user_2",
    createdAt: new Date("2024-11-19").toISOString(),
    updatedAt: new Date("2024-11-19").toISOString(),
  },
  {
    id: "issue_9",
    title: "Stray dogs causing nuisance in Koramangala",
    description: "Pack of stray dogs creating safety concerns, especially during evening hours.",
    status: "SUBMITTED" as const,
    categoryId: "cat_6",
    latitude: 12.9352,
    longitude: 77.6245,
    address: "Koramangala 5th Block, Bangalore, Karnataka 560095",
    imageUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400",
    userId: "user_3",
    createdAt: new Date("2024-11-17").toISOString(),
    updatedAt: new Date("2024-11-17").toISOString(),
  },
  {
    id: "issue_10",
    title: "Public toilet maintenance at Majestic Bus Stand",
    description: "Public restrooms in poor condition. Cleaning and repair required urgently.",
    status: "RESOLVED" as const,
    categoryId: "cat_7",
    latitude: 12.9767,
    longitude: 77.5718,
    address: "Kempegowda Bus Station, Bangalore, Karnataka 560009",
    imageUrl: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400",
    userId: "user_1",
    createdAt: new Date("2024-11-08").toISOString(),
    updatedAt: new Date("2024-11-15").toISOString(),
  },
  {
    id: "issue_11",
    title: "Illegal parking blocking road in Jayanagar",
    description: "Vehicles parked illegally on main road causing traffic congestion.",
    status: "IN_PROGRESS" as const,
    categoryId: "cat_8",
    latitude: 12.9250,
    longitude: 77.5838,
    address: "Jayanagar 4th Block, Bangalore, Karnataka 560011",
    imageUrl: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=400",
    userId: "user_2",
    createdAt: new Date("2024-11-16").toISOString(),
    updatedAt: new Date("2024-11-20").toISOString(),
  },
  {
    id: "issue_12",
    title: "Tree branches overhanging on Bannerghatta Road",
    description: "Large tree branches hanging dangerously low over the road. Risk of falling.",
    status: "ACKNOWLEDGED" as const,
    categoryId: "cat_1",
    latitude: 12.8934,
    longitude: 77.5946,
    address: "Bannerghatta Road, Bangalore, Karnataka 560076",
    imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400",
    userId: "user_3",
    createdAt: new Date("2024-11-13").toISOString(),
    updatedAt: new Date("2024-11-18").toISOString(),
  },
  {
    id: "issue_13",
    title: "Manhole cover missing in HSR Layout",
    description: "Open manhole without cover poses serious safety hazard.",
    status: "SUBMITTED" as const,
    categoryId: "cat_6",
    latitude: 12.9082,
    longitude: 77.6476,
    address: "HSR Layout Sector 2, Bangalore, Karnataka 560102",
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
    userId: "user_1",
    createdAt: new Date("2024-11-20").toISOString(),
    updatedAt: new Date("2024-11-20").toISOString(),
  },
  {
    id: "issue_14",
    title: "Water supply disruption in Malleswaram",
    description: "No water supply for the past 3 days in the area.",
    status: "IN_PROGRESS" as const,
    categoryId: "cat_2",
    latitude: 13.0037,
    longitude: 77.5701,
    address: "Malleswaram 15th Cross, Bangalore, Karnataka 560055",
    imageUrl: "https://images.unsplash.com/photo-1597180159026-966488e9f298?w=400",
    userId: "user_2",
    createdAt: new Date("2024-11-17").toISOString(),
    updatedAt: new Date("2024-11-20").toISOString(),
  },
  {
    id: "issue_15",
    title: "Vandalism in public park at Whitefield",
    description: "Park benches and signboards vandalized. Security needed.",
    status: "ACKNOWLEDGED" as const,
    categoryId: "cat_5",
    latitude: 12.9698,
    longitude: 77.7499,
    address: "Whitefield Main Road, Bangalore, Karnataka 560066",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    userId: "user_3",
    createdAt: new Date("2024-11-09").toISOString(),
    updatedAt: new Date("2024-11-16").toISOString(),
  },
];

// Helper function to get issues with full category data
export function getIssuesWithCategories() {
  return mockIssues.map(issue => ({
    ...issue,
    category: mockCategories.find(cat => cat.id === issue.categoryId)!,
    user: mockUsers.find(user => user.id === issue.userId),
  }));
}

// Helper function to get issues by status
export function getIssuesByStatus(status: typeof mockIssues[0]['status']) {
  return getIssuesWithCategories().filter(issue => issue.status === status);
}

// Helper function to get issues by category
export function getIssuesByCategory(categoryId: string) {
  return getIssuesWithCategories().filter(issue => issue.categoryId === categoryId);
}

// Helper function to get issue by id
export function getIssueById(id: string) {
  const issue = mockIssues.find(issue => issue.id === id);
  if (!issue) return null;
  
  return {
    ...issue,
    category: mockCategories.find(cat => cat.id === issue.categoryId)!,
    user: mockUsers.find(user => user.id === issue.userId),
  };
}

// Dashboard metrics
export function getDashboardMetrics() {
  const total = mockIssues.length;
  const resolved = mockIssues.filter(i => i.status === 'RESOLVED').length;
  const inProgress = mockIssues.filter(i => i.status === 'IN_PROGRESS').length;
  const submitted = mockIssues.filter(i => i.status === 'SUBMITTED').length;
  const acknowledged = mockIssues.filter(i => i.status === 'ACKNOWLEDGED').length;

  return {
    totalComplaints: total,
    resolvedComplaints: resolved,
    pendingComplaints: submitted + acknowledged,
    inProgressComplaints: inProgress,
    avgResolutionTime: 4.5,
    resolutionRate: Math.round((resolved / total) * 100),
    activeUsers: mockUsers.length,
    complaintsToday: 3,
    complaintsThisWeek: 8,
    complaintsThisMonth: 15,
  };
}

// Category statistics
export function getCategoryStats() {
  return mockCategories.map(category => {
    const categoryIssues = mockIssues.filter(i => i.categoryId === category.id);
    const resolved = categoryIssues.filter(i => i.status === 'RESOLVED').length;
    const pending = categoryIssues.filter(i => i.status === 'SUBMITTED' || i.status === 'ACKNOWLEDGED').length;

    return {
      category: category.name,
      count: categoryIssues.length,
      resolved,
      pending,
      avgResolutionTime: 4.2,
    };
  });
}

// Location statistics
export function getLocationStats() {
  const locationMap = new Map<string, { count: number; lat: number; lng: number }>();

  mockIssues.forEach(issue => {
    const location = issue.address?.split(',')[1]?.trim() || 'Unknown';
    const existing = locationMap.get(location) || { count: 0, lat: issue.latitude, lng: issue.longitude };
    locationMap.set(location, {
      count: existing.count + 1,
      lat: issue.latitude,
      lng: issue.longitude,
    });
  });

  return Array.from(locationMap.entries()).map(([location, data]) => ({
    city: location,
    state: 'Karnataka',
    count: data.count,
    coordinates: { lat: data.lat, lng: data.lng },
  }));
}

// Time series data for analytics
export function getTimeSeriesData() {
  const days = 7;
  const data = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      submitted: Math.floor(Math.random() * 5) + 1,
      resolved: Math.floor(Math.random() * 4) + 1,
      inProgress: Math.floor(Math.random() * 3) + 1,
    });
  }
  
  return data;
}

// Export all mock data
export const mockData = {
  users: mockUsers,
  categories: mockCategories,
  issues: mockIssues,
  getIssuesWithCategories,
  getIssuesByStatus,
  getIssuesByCategory,
  getIssueById,
  getDashboardMetrics,
  getCategoryStats,
  getLocationStats,
  getTimeSeriesData,
};

// Mock officers and performance helper
export const mockOfficers = [
  {
    officer_id: 'officer_1',
    officer_name: 'Officer R. Singh',
    department: 'Public Works',
    total_assigned: 24,
    total_resolved: 18,
    total_pending: 6,
    avg_resolution_time: 3.4,
    resolution_rate: 75,
    current_workload: 6,
    rating: 4.2,
  },
  {
    officer_id: 'officer_2',
    officer_name: 'Officer M. Rao',
    department: 'Sanitation',
    total_assigned: 18,
    total_resolved: 12,
    total_pending: 6,
    avg_resolution_time: 4.8,
    resolution_rate: 66,
    current_workload: 5,
    rating: 3.9,
  },
  {
    officer_id: 'officer_3',
    officer_name: 'Officer S. Iyer',
    department: 'Traffic',
    total_assigned: 30,
    total_resolved: 25,
    total_pending: 5,
    avg_resolution_time: 2.1,
    resolution_rate: 83,
    current_workload: 4,
    rating: 4.6,
  },
];

export function getOfficerPerformance(limit = 10) {
  return mockOfficers.slice(0, limit);
}
