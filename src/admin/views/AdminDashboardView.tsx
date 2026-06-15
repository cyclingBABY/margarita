import React, { useState, useEffect } from 'react';
import { 
  Hotel, 
  Calendar as CalendarIcon, 
  Users, 
  Bed, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Star,
  Wifi,
  Waves,
  Spade,
  Utensils,
  ChevronRight,
  ChevronLeft,
  Plus,
  Filter,
  Send,
  Trash2,
  Edit,
  Save,
  UserPlus,
  Shield,
  FileText,
  Database,
  Activity,
  Tag,
  Link,
  CreditCard,
  MapPin,
  Check,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Autoplay from "embla-carousel-autoplay";
import { auth, db, handleFirestoreError, OperationType } from '@/src/firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { collection, query, onSnapshot, addDoc, updateDoc, setDoc, deleteDoc, doc, serverTimestamp, where, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '@/src/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Room, Reservation, Feedback } from '@/src/types';
import { format } from 'date-fns';
import { toast, Toaster } from 'sonner';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
// --- Theme Constants ---
import { COLORS } from '@/src/constants/theme';
import { Sidebar } from '@/src/components/layout/Sidebar';
import { BottomNav } from '@/src/components/layout/BottomNav';
import { Header } from '@/src/components/layout/Header';
import { HousekeepingView } from '@/src/admin/views/HousekeepingView';
import { ReservationsView } from '@/src/admin/views/ReservationsView';
import { UsersView } from '@/src/admin/views/UsersView';
import { PublicNavbar } from '@/src/components/layout/PublicNavbar';
import { AboutView } from '@/src/user/views/AboutView';
import { GalleryView } from '@/src/user/views/GalleryView';
import { BlogView } from '@/src/user/views/BlogView';
import { ContactView } from '@/src/user/views/ContactView';
import { GuestLandingView } from '@/src/user/views/GuestLandingView';
import { GuestDashboardView } from '@/src/user/views/GuestDashboardView';
import { RoomsView } from '@/src/admin/views/RoomsView';

export const AdminDashboardView = ({ role, onSwitchToGuest, onSwitchToLanding }: { role: string, onSwitchToGuest: () => void, onSwitchToLanding: () => void }) => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [feedbackList, setFeedbackList] = useState<any[]>([]);

  // State for creating new admin
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminFormData, setAdminFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isAdminSubmitting, setIsAdminSubmitting] = useState(false);

  // State for creating new staff
  const [isStaffDialogOpen, setIsStaffDialogOpen] = useState(false);
  const [showStaffPassword, setShowStaffPassword] = useState(false);
  const [staffFormData, setStaffFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'staff',
    department: '',
  });
  const [isStaffSubmitting, setIsStaffSubmitting] = useState(false);

  // Lists for messages & events
  const [messagesList, setMessagesList] = useState<any[]>([]);
  const [eventsList, setEventsList] = useState<any[]>([]);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffFormData.displayName || !staffFormData.email || !staffFormData.password || !staffFormData.confirmPassword || !staffFormData.role) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (staffFormData.password !== staffFormData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (staffFormData.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setIsStaffSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          displayName: staffFormData.displayName,
          email: staffFormData.email,
          password: staffFormData.password,
          role: staffFormData.role,
          department: staffFormData.department || null,
          accountStatus: 'Active'
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create staff member');
      }
      toast.success("Staff member created successfully!");
      setIsStaffDialogOpen(false);
      setStaffFormData({
        displayName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'staff',
        department: '',
      });
    } catch (error: any) {
      console.error("Error creating staff:", error);
      toast.error(error.message || "An error occurred while creating staff member.");
    } finally {
      setIsStaffSubmitting(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminFormData.displayName || !adminFormData.email || !adminFormData.password || !adminFormData.confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (adminFormData.password !== adminFormData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (adminFormData.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setIsAdminSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          displayName: adminFormData.displayName,
          email: adminFormData.email,
          password: adminFormData.password,
          role: 'admin',
          accountStatus: 'Active'
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create admin');
      }
      toast.success("Admin created successfully!");
      setIsAdminDialogOpen(false);
      setAdminFormData({
        displayName: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      console.error("Error creating admin:", error);
      toast.error(error.message || "An error occurred while creating admin.");
    } finally {
      setIsAdminSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };
        
        // Fetch rooms
        const roomsRes = await fetch('/api/housekeeping/rooms', { headers, cache: 'no-store' });
        if (roomsRes.ok) setRooms(await roomsRes.json());
        
        // Fetch reservations
        const resRes = await fetch('/api/staff/reservations', { headers, cache: 'no-store' });
        if (resRes.ok) {
          const resData = await resRes.json();
          if (Array.isArray(resData)) {
            setReservations(resData.slice(0, 5)); // Latest 5
          } else {
            console.error("Invalid reservations data:", resData);
          }
        }

        // Fetch feedback
        const feedbackRes = await fetch('/api/admin/feedback', { headers, cache: 'no-store' });
        if (feedbackRes.ok) {
          const fbData = await feedbackRes.json();
          if (Array.isArray(fbData)) {
            setFeedbackList(fbData.slice(0, 10));
          }
        }

        // Fetch messages overview
        const messagesRes = await fetch('/api/admin/messages', { headers, cache: 'no-store' });
        if (messagesRes.ok) {
          const msgData = await messagesRes.json();
          if (Array.isArray(msgData)) {
            setMessagesList(msgData.slice(0, 10));
          }
        }

        // Fetch events
        const eventsRes = await fetch('/api/admin/events', { headers, cache: 'no-store' });
        if (eventsRes.ok) {
          const evData = await eventsRes.json();
          if (Array.isArray(evData)) {
            const scheduled = evData
              .filter((e: any) => e.status === 'scheduled')
              .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
            setEventsList(scheduled.slice(0, 5));
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/staff/reservations/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update status");
      }
      toast.success(`Reservation ${newStatus}`);
      
      // Refresh reservations
      const resRes = await fetch('/api/staff/reservations', { 
        headers: { 'Authorization': `Bearer ${token}` }, 
        cache: 'no-store' 
      });
      if (resRes.ok) {
        const resData = await resRes.json();
        if (Array.isArray(resData)) setReservations(resData.slice(0, 5));
      } else {
        console.error('Failed to fetch reservations after update');
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const stats = [
    { label: 'Occupancy Rate', value: rooms.length ? Math.round((rooms.filter(r => r.status === 'occupied').length / rooms.length) * 100) : 0, suffix: '%', icon: Bed, color: COLORS.orange },
    { label: "Pending Bookings", value: reservations.filter(r => r.status === 'pending').length, suffix: '', icon: CheckCircle2, color: COLORS.green },
    { label: 'Rooms Available', value: rooms.filter(r => r.status === 'available').length, suffix: '', icon: BarChart3, color: COLORS.blue },
    { label: 'Pending Requests', value: 8, suffix: '', icon: MessageSquare, color: COLORS.red },
  ];

  return (
    <div className="space-y-8">
      {/* Quick Switch Bar */}
      <div className="bg-white p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-hotel-gold/10 p-2">
            <Settings className="h-5 w-5 text-hotel-gold" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-hotel-blue uppercase tracking-tight">Admin Controls</h4>
            <p className="text-[10px] text-slate-400 font-medium">Switch between management and preview modes</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {role === 'admin' && (
            <>
              <Dialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="h-10 rounded-none bg-hotel-gold hover:bg-hotel-gold/90 text-hotel-blue font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 cursor-pointer"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Create Admin
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[450px] rounded-none border-hotel-blue/10 bg-white">
                  <DialogHeader className="border-b border-hotel-blue/5 pb-4">
                    <DialogTitle className="text-xl font-serif text-hotel-blue flex items-center gap-2">
                      <Shield className="h-5 w-5 text-hotel-gold" />
                      Create New Admin Account
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                      Create a new administrator credential. Admins have complete access to the HMS dashboard.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateAdmin} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="adminDisplayName" className="text-[10px] uppercase font-bold text-hotel-blue tracking-widest">Display Name *</Label>
                      <Input 
                        id="adminDisplayName"
                        required
                        placeholder="e.g. Jane Smith"
                        value={adminFormData.displayName}
                        onChange={(e) => setAdminFormData({...adminFormData, displayName: e.target.value})}
                        className="rounded-none border-hotel-blue/10 focus:border-hotel-gold h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="adminEmail" className="text-[10px] uppercase font-bold text-hotel-blue tracking-widest">Email Address *</Label>
                      <Input 
                        id="adminEmail"
                        type="email"
                        required
                        placeholder="e.g. admin@margaritahotel.com"
                        value={adminFormData.email}
                        onChange={(e) => setAdminFormData({...adminFormData, email: e.target.value})}
                        className="rounded-none border-hotel-blue/10 focus:border-hotel-gold h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="adminPassword" className="text-[10px] uppercase font-bold text-hotel-blue tracking-widest">Password *</Label>
                      <div className="relative">
                        <Input 
                          id="adminPassword"
                          type={showAdminPassword ? "text" : "password"}
                          required
                          placeholder="••••••••"
                          value={adminFormData.password}
                          onChange={(e) => setAdminFormData({...adminFormData, password: e.target.value})}
                          className="rounded-none border-hotel-blue/10 focus:border-hotel-gold h-10 pr-10"
                        />
                        <button 
                          type="button"
                          onClick={() => setShowAdminPassword(!showAdminPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-hotel-blue cursor-pointer bg-transparent border-none"
                        >
                          {showAdminPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="adminConfirmPassword" className="text-[10px] uppercase font-bold text-hotel-blue tracking-widest">Confirm Password *</Label>
                      <Input 
                        id="adminConfirmPassword"
                        type="password"
                        required
                        placeholder="••••••••"
                        value={adminFormData.confirmPassword}
                        onChange={(e) => setAdminFormData({...adminFormData, confirmPassword: e.target.value})}
                        className="rounded-none border-hotel-blue/10 focus:border-hotel-gold h-10"
                      />
                    </div>
                    <DialogFooter className="border-t border-hotel-blue/5 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsAdminDialogOpen(false)}
                        className="rounded-none text-[10px] uppercase font-bold tracking-widest border-hotel-blue/10 hover:bg-hotel-sand/50 h-11"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={isAdminSubmitting}
                        className="bg-hotel-blue text-white hover:bg-hotel-blue/90 rounded-none text-[10px] uppercase font-bold tracking-widest h-11 px-6"
                      >
                        {isAdminSubmitting ? "Creating..." : "Create Admin"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={isStaffDialogOpen} onOpenChange={setIsStaffDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="h-10 rounded-none bg-hotel-blue hover:bg-hotel-blue/90 text-white font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 cursor-pointer"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Create Staff
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[450px] rounded-none border-hotel-blue/10 bg-white">
                  <DialogHeader className="border-b border-hotel-blue/5 pb-4">
                    <DialogTitle className="text-xl font-serif text-hotel-blue flex items-center gap-2">
                      <Users className="h-5 w-5 text-hotel-gold" />
                      Create New Staff Member
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                      Create a new staff or housekeeping account. Staff have restricted access to reservations and housekeeping.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateStaff} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="staffDisplayName" className="text-[10px] uppercase font-bold text-hotel-blue tracking-widest">Display Name *</Label>
                      <Input 
                        id="staffDisplayName"
                        required
                        placeholder="e.g. John Doe"
                        value={staffFormData.displayName}
                        onChange={(e) => setStaffFormData({...staffFormData, displayName: e.target.value})}
                        className="rounded-none border-hotel-blue/10 focus:border-hotel-gold h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="staffEmail" className="text-[10px] uppercase font-bold text-hotel-blue tracking-widest">Email Address *</Label>
                      <Input 
                        id="staffEmail"
                        type="email"
                        required
                        placeholder="e.g. staff@margaritahotel.com"
                        value={staffFormData.email}
                        onChange={(e) => setStaffFormData({...staffFormData, email: e.target.value})}
                        className="rounded-none border-hotel-blue/10 focus:border-hotel-gold h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="staffPassword" className="text-[10px] uppercase font-bold text-hotel-blue tracking-widest">Password *</Label>
                      <div className="relative">
                        <Input 
                          id="staffPassword"
                          type={showStaffPassword ? "text" : "password"}
                          required
                          placeholder="••••••••"
                          value={staffFormData.password}
                          onChange={(e) => setStaffFormData({...staffFormData, password: e.target.value})}
                          className="rounded-none border-hotel-blue/10 focus:border-hotel-gold h-10 pr-10"
                        />
                        <button 
                          type="button"
                          onClick={() => setShowStaffPassword(!showStaffPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-hotel-blue cursor-pointer bg-transparent border-none font-normal"
                        >
                          {showStaffPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="staffConfirmPassword" className="text-[10px] uppercase font-bold text-hotel-blue tracking-widest">Confirm Password *</Label>
                      <Input 
                        id="staffConfirmPassword"
                        type="password"
                        required
                        placeholder="••••••••"
                        value={staffFormData.confirmPassword}
                        onChange={(e) => setStaffFormData({...staffFormData, confirmPassword: e.target.value})}
                        className="rounded-none border-hotel-blue/10 focus:border-hotel-gold h-10"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="staffRole" className="text-[10px] uppercase font-bold text-hotel-blue tracking-widest">Role *</Label>
                        <select 
                          id="staffRole"
                          value={staffFormData.role}
                          onChange={(e) => setStaffFormData({...staffFormData, role: e.target.value})}
                          className="w-full bg-white border border-hotel-blue/10 rounded-none h-10 px-3 text-sm focus:border-hotel-gold focus:outline-none focus:ring-0 cursor-pointer"
                          required
                        >
                          <option value="staff">Staff</option>
                          <option value="housekeeping">Housekeeping</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="staffDepartment" className="text-[10px] uppercase font-bold text-hotel-blue tracking-widest">Department *</Label>
                        <select 
                          id="staffDepartment"
                          value={staffFormData.department}
                          onChange={(e) => setStaffFormData({...staffFormData, department: e.target.value})}
                          className="w-full bg-white border border-hotel-blue/10 rounded-none h-10 px-3 text-sm focus:border-hotel-gold focus:outline-none focus:ring-0 cursor-pointer"
                          required
                        >
                          <option value="">Select Department...</option>
                          <option value="Management">Management</option>
                          <option value="Front Desk">Front Desk</option>
                          <option value="Housekeeping">Housekeeping</option>
                          <option value="Spa">Spa</option>
                          <option value="Food & Beverage">Food & Beverage</option>
                          <option value="Maintenance">Maintenance</option>
                        </select>
                      </div>
                    </div>
                    <DialogFooter className="border-t border-hotel-blue/5 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsStaffDialogOpen(false)}
                        className="rounded-none text-[10px] uppercase font-bold tracking-widest border-hotel-blue/10 hover:bg-hotel-sand/50 h-11"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={isStaffSubmitting}
                        className="bg-hotel-blue text-white hover:bg-hotel-blue/90 rounded-none text-[10px] uppercase font-bold tracking-widest h-11 px-6"
                      >
                        {isStaffSubmitting ? "Creating..." : "Create Staff"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </>
          )}
          <Button 
            onClick={onSwitchToLanding}
            variant="outline" 
            className="h-10 rounded-none border-hotel-blue/10 text-[10px] uppercase font-bold tracking-widest flex items-center gap-2 cursor-pointer"
          >
            <Star className="h-3 w-3" />
            Landing Site
          </Button>
          <Button 
            onClick={onSwitchToGuest}
            variant="outline" 
            className="h-10 rounded-none border-hotel-blue/10 text-[10px] uppercase font-bold tracking-widest flex items-center gap-2 cursor-pointer"
          >
            <Users className="h-3 w-3" />
            User Side
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm overflow-hidden group">
            <CardContent className="p-0">
              <div className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-bold text-hotel-blue">
                    {stat.suffix === 'UGX' ? `UGX ${stat.value.toLocaleString()}` : `${stat.value}${stat.suffix}`}
                  </h3>
                </div>
                <div className="relative w-16 h-16 flex items-center justify-center">
                  {stat.label === 'Occupancy Rate' ? (
                    <div className="relative w-full h-full">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-100" />
                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={175.9} strokeDashoffset={175.9 * (1 - stat.value / 100)} className="text-hotel-gold" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-hotel-blue">{stat.value}%</span>
                    </div>
                  ) : (
                    <div className="bg-hotel-sand p-3 rounded-xl group-hover:bg-hotel-gold transition-colors duration-300">
                      <stat.icon className="h-6 w-6 text-hotel-blue group-hover:text-white transition-colors duration-300" />
                    </div>
                  )}
                </div>
              </div>
              <div className="h-1 w-full bg-slate-50">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  className="h-full bg-hotel-gold/20"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Operations Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Room Status Grid */}
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b border-hotel-blue/5 pb-6">
            <div>
              <CardTitle className="text-xl font-serif">Room Status Overview</CardTitle>
              <CardDescription>Live monitoring of all hotel rooms</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-green-500"></div><span className="text-[10px] font-bold text-slate-400 uppercase">Available</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-500"></div><span className="text-[10px] font-bold text-slate-400 uppercase">Occupied</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500"></div><span className="text-[10px] font-bold text-slate-400 uppercase">Dirty</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-orange-500"></div><span className="text-[10px] font-bold text-slate-400 uppercase">Maint.</span></div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
              {rooms.length === 0 && <div className="col-span-full text-center text-slate-400">Loading rooms...</div>}
              {rooms.map((room, i) => {
                const statusColor = 
                  room.status === 'available' ? 'bg-green-500' :
                  room.status === 'occupied' ? 'bg-blue-500' :
                  room.status === 'dirty' ? 'bg-red-500' : 'bg-orange-500';
                return (
                  <motion.div 
                    key={room.id || i}
                    whileHover={{ scale: 1.1 }}
                    className={`aspect-square rounded-lg ${statusColor} flex items-center justify-center text-white font-bold text-xs shadow-md cursor-pointer relative group`}
                  >
                    {room.number}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-hotel-blue text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                      Room {room.number} - {room.status}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card className="border-none shadow-sm">
          <CardHeader className="border-b border-hotel-blue/5 pb-6">
            <CardTitle className="text-xl font-serif">Recent Bookings</CardTitle>
            <CardDescription>Latest 5 reservations</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-hotel-blue/5">
              {reservations.length === 0 && <div className="p-4 text-center text-slate-400 text-sm">No recent bookings found.</div>}
              {reservations.map((booking, i) => (
                <div key={booking.id || i} className="p-4 hover:bg-hotel-sand/50 transition-colors flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-hotel-blue">{booking.guestName}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-medium">Room {booking.roomNumber} • {new Date(booking.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`rounded-none border-none font-bold text-[10px] uppercase ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                      booking.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {booking.status}
                    </Badge>
                    {role === 'admin' && booking.status === 'pending' && (
                      <div className="flex gap-1 ml-2">
                        <Button 
                          onClick={() => handleStatusUpdate(booking.id, 'confirmed')} 
                          size="icon"
                          className="h-6 w-6 bg-green-50 text-green-700 hover:bg-green-100 border-none rounded-md"
                          title="Approve"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button 
                          onClick={() => handleStatusUpdate(booking.id, 'cancelled')} 
                          size="icon"
                          className="h-6 w-6 bg-red-50 text-red-700 hover:bg-red-100 border-none rounded-md"
                          title="Reject"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full h-12 text-hotel-gold font-bold uppercase text-[10px] tracking-widest hover:bg-hotel-sand">View All Reservations</Button>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Staff Notice Board & Upcoming Events */}
        <div className="space-y-8">
          {/* Staff Notice Board */}
          <Card className="border-none shadow-sm bg-hotel-blue text-white">
            <CardHeader>
              <CardTitle className="text-xl font-serif text-hotel-sand">Staff Notice Board</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { title: 'Conference in Hall A', time: '2:00 PM Today', desc: 'Prep catering for 50 guests.' },
                { title: 'VIP Arrival', time: 'Tomorrow', desc: 'Ambassador visiting. Ensure Suite 501 is pristine.' },
                { title: 'System Maintenance', time: 'Sunday 2 AM', desc: 'HMS will be offline for 1 hour.' },
              ].map((notice, i) => (
                <div key={i} className="p-4 bg-white/5 border-l-2 border-hotel-gold">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-sm text-hotel-sand">{notice.title}</h4>
                    <span className="text-[10px] font-bold text-hotel-gold uppercase">{notice.time}</span>
                  </div>
                  <p className="text-xs text-white/60">{notice.desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="border-b border-hotel-blue/5 pb-4">
              <CardTitle className="text-xl font-serif text-hotel-blue">Upcoming Events</CardTitle>
              <CardDescription>Scheduled hotel events and approved guest functions</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[250px]">
                <div className="p-6 divide-y divide-hotel-blue/5">
                  {eventsList.length === 0 && (
                    <div className="text-center text-slate-400 text-sm py-12 italic">No upcoming events scheduled.</div>
                  )}
                  {eventsList.map((event: any, i: number) => (
                    <div key={event.id || i} className="py-4 flex items-center justify-between first:pt-0 last:pb-0">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-hotel-blue">{event.title}</h4>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-3.5 w-3.5 text-hotel-gold shrink-0" />
                            <span>{format(new Date(event.date), 'MMM dd, yyyy')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-hotel-gold shrink-0" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800 rounded-none border-none font-bold uppercase text-[9px]">{event.status}</Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Guest Interactions (Tabbed Feedback & Messages) */}
        <Card className="border-none shadow-sm flex flex-col">
          <Tabs defaultValue="feedback" className="w-full flex-1 flex flex-col">
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-2 border-b border-hotel-blue/5">
              <div>
                <CardTitle className="text-xl font-serif text-hotel-blue">Guest Interactions</CardTitle>
                <CardDescription>View latest guest feedback and incoming messages</CardDescription>
              </div>
              <TabsList className="bg-hotel-sand/50 rounded-none p-1 border border-hotel-blue/5 mt-2 sm:mt-0">
                <TabsTrigger value="feedback" className="rounded-none text-[10px] uppercase font-bold tracking-wider data-[state=active]:bg-hotel-blue data-[state=active]:text-white data-[state=active]:shadow-none px-4 py-2">
                  Feedback
                </TabsTrigger>
                <TabsTrigger value="messages" className="rounded-none text-[10px] uppercase font-bold tracking-wider data-[state=active]:bg-hotel-blue data-[state=active]:text-white data-[state=active]:shadow-none px-4 py-2">
                  Messages
                </TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <TabsContent value="feedback" className="m-0 focus-visible:ring-0">
                <ScrollArea className="h-[450px]">
                  <div className="p-6 space-y-6">
                    {feedbackList.length === 0 && (
                      <div className="text-center text-slate-400 text-sm py-12">No feedback submitted yet.</div>
                    )}
                    {feedbackList.map((feedback: any, i: number) => (
                      <div key={feedback.id || i} className="flex gap-4 border-b border-hotel-blue/5 pb-4 last:border-0 last:pb-0">
                        <img src={`https://ui-avatars.com/api/?name=${feedback.guestDisplayName || feedback.guestName || 'Guest'}&background=random`} className="w-10 h-10 rounded-full" alt="" />
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <h4 className="text-sm font-bold text-hotel-blue">{feedback.guestDisplayName || feedback.guestName || 'Guest'}</h4>
                            <span className="text-[10px] text-slate-400 uppercase">{new Date(feedback.createdAt).toLocaleDateString()}</span>
                          </div>
                          <Badge className="rounded-none text-[10px] mb-1 bg-white border border-hotel-blue/10 text-hotel-blue">{feedback.serviceType || 'general'}</Badge>
                          <div className="flex gap-0.5 mb-2">
                            {Array.from({ length: 5 }).map((_: any, j: number) => (
                              <Star key={j} className={`h-3 w-3 ${j < feedback.rating ? 'text-hotel-gold fill-hotel-gold' : 'text-slate-200'}`} />
                            ))}
                          </div>
                          <p className="text-xs text-slate-500 italic">"{feedback.comment}"</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="messages" className="m-0 focus-visible:ring-0">
                <ScrollArea className="h-[450px]">
                  <div className="p-6 space-y-6">
                    {messagesList.length === 0 && (
                      <div className="text-center text-slate-400 text-sm py-12">No messages received yet.</div>
                    )}
                    {messagesList.map((msg: any, i: number) => (
                      <div key={msg.id || i} className="flex gap-4 border-b border-hotel-blue/5 pb-4 last:border-0 last:pb-0">
                        <img src={`https://ui-avatars.com/api/?name=${msg.senderName || 'Guest'}&background=random`} className="w-10 h-10 rounded-full" alt="" />
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <h4 className="text-sm font-bold text-hotel-blue">{msg.senderName || 'Guest'}</h4>
                            <span className="text-[10px] text-slate-400 uppercase">
                              {new Date(msg.timestamp).toLocaleDateString()} {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                            {msg.content}
                          </p>
                          {msg.readStatus === 0 && (
                            <Badge className="bg-hotel-gold text-hotel-blue rounded-none border-none font-bold uppercase text-[9px] mt-2">New</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

