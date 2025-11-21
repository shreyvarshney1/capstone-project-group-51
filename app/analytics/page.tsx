'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { API_ENDPOINTS, CHART_COLORS } from '@/lib/constants';
import { getDashboardMetrics, getCategoryStats, getTimeSeriesData, getOfficerPerformance } from '@/lib/data';
import { DashboardMetrics, CategoryStats, TrendData, OfficerPerformance } from '@/types';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    AlertCircle,
    CheckCircle2,
    Clock,
    Users,
    Download,
    Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AnalyticsPage() {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
    const [trendData, setTrendData] = useState<TrendData[]>([]);
    const [officerPerformance, setOfficerPerformance] = useState<OfficerPerformance[]>([]);
    const [timeRange, setTimeRange] = useState('30d');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchAnalyticsData();
    }, [timeRange]);

    // Helpers to read metrics that may come in snake_case or camelCase from mocks
    const getMetricValue = (snakeKey: string, camelKey?: string) => {
        const m = metrics as any;
        if (!m) return 0;
        const v = m[snakeKey];
        if (v !== undefined && v !== null) return v;
        if (camelKey) {
            const v2 = m[camelKey];
            if (v2 !== undefined && v2 !== null) return v2;
        }
        return 0;
    };

    const formatNumber = (v: any) => {
        const n = Number(v ?? 0);
        return n.toLocaleString();
    };

    const formatFixed = (v: any, digits = 1) => {
        const n = Number(v ?? 0);
        return n.toFixed(digits);
    };

    const fetchAnalyticsData = async () => {
        setIsLoading(true);
        try {
            // Use local mock data instead of calling backend
            const metricsData = getDashboardMetrics();
            setMetrics(metricsData as any);

            const categories = getCategoryStats();
            setCategoryStats(categories as any);

            const trends = getTimeSeriesData();
            // adapt trend shape if necessary
            setTrendData(trends.map(t => ({ date: t.date, complaints: t.submitted || 0, resolved: t.resolved || 0, pending: t.inProgress || 0 })) as any);

            const officers = getOfficerPerformance(10);
            setOfficerPerformance(officers as any);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = async (format: 'pdf' | 'excel') => {
        try {
            const response = await api.post(API_ENDPOINTS.ANALYTICS.REPORT, {
                format,
                time_range: timeRange,
            }) as any;

            // Handle download
            if (response.success && response.data.download_url) {
                window.open(response.data.download_url, '_blank');
            }
        } catch (error) {
            console.error('Export failed:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                        <p className="text-gray-600 mt-2">Comprehensive insights into grievance resolution</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Select value={timeRange} onValueChange={setTimeRange}>
                            <SelectTrigger className="w-40">
                                <Calendar className="mr-2 h-4 w-4" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7d">Last 7 Days</SelectItem>
                                <SelectItem value="30d">Last 30 Days</SelectItem>
                                <SelectItem value="90d">Last 90 Days</SelectItem>
                                <SelectItem value="1y">Last Year</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button variant="outline" onClick={() => handleExport('pdf')}>
                            <Download className="mr-2 h-4 w-4" />
                            Export PDF
                        </Button>

                        <Button variant="outline" onClick={() => handleExport('excel')}>
                            <Download className="mr-2 h-4 w-4" />
                            Export Excel
                        </Button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Total Complaints</p>
                                <p className="text-3xl font-bold mt-2">{formatNumber(getMetricValue('total_complaints', 'totalComplaints'))}</p>
                                <div className="flex items-center gap-2 mt-2 text-green-600">
                                    <TrendingUp className="h-4 w-4" />
                                    <span className="text-sm">+12% from last period</span>
                                </div>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <AlertCircle className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Resolution Rate</p>
                                <p className="text-3xl font-bold mt-2">{formatFixed(getMetricValue('resolution_rate','resolutionRate'))}%</p>
                                <div className="flex items-center gap-2 mt-2 text-green-600">
                                    <TrendingUp className="h-4 w-4" />
                                    <span className="text-sm">+3% improvement</span>
                                </div>
                            </div>
                            <div className="bg-green-100 p-3 rounded-lg">
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Avg. Resolution Time</p>
                                <p className="text-3xl font-bold mt-2">{formatFixed(getMetricValue('avg_resolution_time','avgResolutionTime'))} days</p>
                                <div className="flex items-center gap-2 mt-2 text-green-600">
                                    <TrendingDown className="h-4 w-4" />
                                    <span className="text-sm">-15% faster</span>
                                </div>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-lg">
                                <Clock className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Active Users</p>
                                <p className="text-3xl font-bold mt-2">{formatNumber(getMetricValue('active_users','activeUsers'))}</p>
                                <div className="flex items-center gap-2 mt-2 text-green-600">
                                    <TrendingUp className="h-4 w-4" />
                                    <span className="text-sm">+8% growth</span>
                                </div>
                            </div>
                            <div className="bg-yellow-100 p-3 rounded-lg">
                                <Users className="h-6 w-6 text-yellow-600" />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Charts */}
                <div className="grid lg:grid-cols-2 gap-8 mb-8">
                    {/* Trend Line Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                    >
                        <h3 className="text-lg font-semibold mb-6">Complaints Over Time</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="complaints" stroke={CHART_COLORS[0]} strokeWidth={2} name="Total" />
                                <Line type="monotone" dataKey="resolved" stroke={CHART_COLORS[2]} strokeWidth={2} name="Resolved" />
                                <Line type="monotone" dataKey="pending" stroke={CHART_COLORS[3]} strokeWidth={2} name="Pending" />
                            </LineChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* Category Bar Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                    >
                        <h3 className="text-lg font-semibold mb-6">Category-wise Distribution</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={categoryStats.slice(0, 8)}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="category" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill={CHART_COLORS[0]} name="Total" />
                                <Bar dataKey="resolved" fill={CHART_COLORS[2]} name="Resolved" />
                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>
                </div>

                {/* Officer Performance Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                >
                    <h3 className="text-lg font-semibold mb-6">Officer Performance</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Officer Name</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Department</th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Assigned</th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Resolved</th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Resolution Rate</th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Avg. Time</th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Rating</th>
                                </tr>
                            </thead>
                            <tbody>
                                {officerPerformance.map((officer, index) => (
                                    <tr key={officer.officer_id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4">{officer.officer_name}</td>
                                        <td className="py-3 px-4 text-gray-600">{officer.department}</td>
                                        <td className="py-3 px-4 text-center">{officer.total_assigned}</td>
                                        <td className="py-3 px-4 text-center">{officer.total_resolved}</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${officer.resolution_rate >= 90 ? 'bg-green-100 text-green-700' :
                                                    officer.resolution_rate >= 75 ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                                                }`}>
                                                {officer.resolution_rate.toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center">{officer.avg_resolution_time.toFixed(1)} days</td>
                                        <td className="py-3 px-4 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <span className="text-yellow-500">★</span>
                                                <span className="font-medium">{officer.rating.toFixed(1)}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
