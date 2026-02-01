'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { api } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { IssueListItem, DashboardAnalytics } from '@/types';

import {
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Plus,
  Search,
  Filter,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { STATUS_CONFIG } from '@/lib/constants';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [metrics, setMetrics] = useState<DashboardAnalytics | null>(null);
  const [complaints, setComplaints] = useState<IssueListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch metrics
      const metricsResponse = await api.get(API_ENDPOINTS.ANALYTICS.DASHBOARD) as DashboardAnalytics;
      if (metricsResponse) {
        setMetrics(metricsResponse);
      }

      // Fetch user's complaints
      // API call structure depends on your client. Assuming api.get returns the data payload.
      // If api.get returns { data: ..., pagination: ... }, we need to handle that.
      // Based on route.ts: NextResponse.json({ data: issues, pagination: ... })
      const complaintsResponse = await api.get(API_ENDPOINTS.COMPLAINTS.LIST, {
        params: { limit: 10 }, // You might need to change 'limit' to 'pageSize' as per route.ts
      }) as any;

      if (complaintsResponse.data) {
        setComplaints(complaintsResponse.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredComplaints = complaints.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name || 'Citizen'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Here's an overview of your grievances</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Complaints</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {complaints.length}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <AlertCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Resolved</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {complaints.filter(c => c.status === 'RESOLVED').length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">In Progress</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {complaints.filter(c => c.status === 'IN_PROGRESS' || c.status === 'ACKNOWLEDGED').length}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {complaints.filter(c => c.status === 'SUBMITTED').length}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8 flex flex-wrap gap-4"
        >
          <Button size="lg" asChild className="group">
            <Link href="/report">
              <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform" />
              Submit New Complaint
            </Link>
          </Button>

          <Button size="lg" variant="outline" asChild>
            <Link href="/map">
              <MapPin className="mr-2 h-5 w-5" />
              View Heat Map
            </Link>
          </Button>

          <Button size="lg" variant="outline" asChild>
            <Link href="/issues">
              <Search className="mr-2 h-5 w-5" />
              Browse All Issues
            </Link>
          </Button>
        </motion.div>

        {/* Recent Complaints */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Recent Complaints</h2>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search complaints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>

          {filteredComplaints.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No complaints found</p>
              <Button className="mt-4" asChild>
                <Link href="/report">Submit Your First Complaint</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredComplaints.map((complaint, index) => (
                <motion.div
                  key={complaint.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white dark:bg-gray-900/50"
                  onClick={() => window.location.href = `/issues/${complaint.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{complaint.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[complaint.status.toLowerCase() as keyof typeof STATUS_CONFIG]?.bgColor} ${STATUS_CONFIG[complaint.status.toLowerCase() as keyof typeof STATUS_CONFIG]?.textColor}`}>
                          {STATUS_CONFIG[complaint.status.toLowerCase() as keyof typeof STATUS_CONFIG]?.label || complaint.status}
                        </span>
                      </div>

                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">
                        {complaint.description}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {complaint.address || 'Unknown Location'}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(complaint.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        {complaint.voteCount > 0 && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-blue-600">
                              <TrendingUp className="h-4 w-4" />
                              {complaint.voteCount} votes
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="ml-4">
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
