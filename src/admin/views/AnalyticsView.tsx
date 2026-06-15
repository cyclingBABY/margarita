import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { CreditCard, Bed, Users, TrendingUp, Loader2, Star, DollarSign, Calendar, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

// Fixes TypeScript "never[]" error
interface ReservationTrend {
  date: string;
  count: number;
}

interface AnalyticsData {
  totalRevenue: number;
  occupancyRate: number;
  totalBookings: number;
  avgRating: number;
  totalFeedback: number;
  totalGuests: number;
  activeReservations: number;
  monthlyRevenue: number;
  trends: ReservationTrend[];
  serviceRevenue: any[];
}

export const AnalyticsView = () => {
  const [loading, setLoading] = useState(true);
  // Explicitly define types to avoid "never" issues
  const [stats, setStats] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        // Fetch data individually to avoid one failure breaking all
        const [occRes, revRes] = await Promise.all([
          fetch('/api/admin/analytics/occupancy', { headers }),
          fetch('/api/admin/analytics/revenue', { headers })
        ]);

        if (!occRes.ok || !revRes.ok) {
          throw new Error('Failed to load basic analytics data');
        }

        const occData = await occRes.json();
        const revData = await revRes.json();

        // Try to fetch satisfaction data (optional)
        let satData = { avgRating: 0, totalFeedback: 0 };
        try {
          const satRes = await fetch('/api/admin/analytics/satisfaction', { headers });
          if (satRes.ok) {
            satData = await satRes.json();
          }
        } catch (err) {
          console.warn('Could not fetch satisfaction data:', err);
        }

        // Try to fetch dashboard data (optional)
        let dashData = { 
          overview: { totalGuests: 0, activeReservations: 0, monthlyRevenue: 0 },
          services: { roomServiceOrders: 0, spaBookings: 0 },
          activity: { recentReservations: 0, recentFeedback: 0 },
          trends: { occupancy: [], serviceRevenue: [] }
        };
        try {
          const dashRes = await fetch('/api/admin/analytics/dashboard', { headers });
          if (dashRes.ok) {
            dashData = await dashRes.json();
          }
        } catch (err) {
          console.warn('Could not fetch dashboard data:', err);
        }

        setStats({
          totalRevenue: revData.totalPaid || 0,
          occupancyRate: occData.occupancyRate || 0,
          totalBookings: occData.currentlyOccupied || 0,
          avgRating: satData.avgRating || 0,
          totalFeedback: satData.totalFeedback || 0,
          totalGuests: dashData.overview?.totalGuests || 0,
          activeReservations: dashData.overview?.activeReservations || 0,
          monthlyRevenue: dashData.overview?.monthlyRevenue || 0,
          trends: occData.reservationsByDay?.map((d: any) => ({
            date: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
            count: d.count
          })) || [],
          serviceRevenue: revData.serviceRevenue || []
        });
      } catch (err) {
        console.error('Analytics fetch error:', err);
        toast.error("Failed to load analytics data. Some metrics may be unavailable.");
        
        // Set fallback data
        setStats({
          totalRevenue: 0,
          occupancyRate: 0,
          totalBookings: 0,
          avgRating: 0,
          totalFeedback: 0,
          totalGuests: 0,
          activeReservations: 0,
          monthlyRevenue: 0,
          trends: [],
          serviceRevenue: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin inline mr-2"/> Loading Analytics...</div>;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Revenue" value={`UGX ${stats?.totalRevenue.toLocaleString()}`} icon={CreditCard} trend={`+UGX ${stats?.monthlyRevenue.toLocaleString()} this month`} />
        <KPICard title="Occupancy Rate" value={`${stats?.occupancyRate}%`} icon={Bed} trend={`${stats?.activeReservations} active bookings`} />
        <KPICard title="Total Guests" value={stats?.totalGuests.toLocaleString()} icon={Users} trend={`${stats?.totalFeedback} reviews`} />
        <KPICard title="Customer Rating" value={`${stats?.avgRating}/5`} icon={Star} trend={`${stats?.totalFeedback} total feedback`} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Trends */}
        <Card className="border-none shadow-sm">
          <CardHeader><CardTitle className="font-serif flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Booking Trends</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.trends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#1e3a8a" fill="#1e3a8a" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Service Revenue Breakdown */}
        <Card className="border-none shadow-sm">
          <CardHeader><CardTitle className="font-serif flex items-center gap-2"><DollarSign className="h-5 w-5" /> Revenue by Service</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.serviceRevenue}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="paid"
                  label={({ name, value }) => `${name}: UGX ${value?.toLocaleString()}`}
                >
                  {stats?.serviceRevenue.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#1e3a8a', '#3b82f6', '#60a5fa'][index % 3]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`UGX ${value?.toLocaleString()}`, 'Revenue']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg text-green-900"><Activity className="w-5 h-5" /></div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Active Reservations</p>
                <h3 className="text-lg font-bold">{stats?.activeReservations}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg text-blue-900"><Calendar className="w-5 h-5" /></div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Monthly Revenue</p>
                <h3 className="text-lg font-bold">UGX {stats?.monthlyRevenue.toLocaleString()}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg text-purple-900"><Star className="w-5 h-5" /></div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Avg Rating</p>
                <h3 className="text-lg font-bold">{stats?.avgRating}/5.0</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const KPICard = ({ title, value, icon: Icon, trend }: any) => (
  <Card className="border-none shadow-sm">
    <CardContent className="p-6 flex items-center gap-4">
      <div className="p-3 bg-slate-100 rounded-lg text-blue-900"><Icon className="w-5 h-5" /></div>
      <div className="flex-1">
        <p className="text-[10px] uppercase font-bold text-slate-400">{title}</p>
        <h3 className="text-lg font-bold">{value}</h3>
        {trend && <p className="text-[9px] text-slate-500 mt-1">{trend}</p>}
      </div>
    </CardContent>
  </Card>
);