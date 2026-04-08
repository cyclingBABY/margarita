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
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { collection, query, onSnapshot, addDoc, updateDoc, setDoc, deleteDoc, doc, serverTimestamp, where, orderBy, limit } from 'firebase/firestore';
import { useAuth } from './AuthContext';
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
import { Room, Reservation, Feedback } from './types';
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
const COLORS = {
  blue: '#002B45',
  gold: '#C5A059',
  sand: '#F5F2ED',
  white: '#FFFFFF',
  green: '#10B981',
  red: '#EF4444',
  orange: '#F97316',
  slate: '#64748B'
};

// --- Layout Components ---

const Sidebar = ({ activeTab, setActiveTab, role }: { activeTab: string, setActiveTab: (t: string) => void, role: string }) => {
  const isStaff = ['admin', 'staff', 'housekeeping'].includes(role);
  
  const menuItems = [
    { id: 'home', label: isStaff ? 'Admin Dashboard' : 'User Dashboard', icon: Hotel, roles: ['admin', 'staff', 'housekeeping', 'guest'] },
    { id: 'welcome', label: 'Welcome Page', icon: Star, roles: ['guest'] },
    { id: 'users', label: 'User Management', icon: Users, roles: ['admin'] },
    { id: 'rooms', label: 'Room Inventory', icon: Bed, roles: ['admin', 'staff'] },
    { id: 'reservations', label: 'Reservations', icon: CalendarIcon, roles: ['admin', 'staff', 'guest'] },
    { id: 'housekeeping', label: 'Housekeeping', icon: Bed, roles: ['admin', 'staff', 'housekeeping'] },
    { id: 'events', label: 'Events', icon: Utensils, roles: ['admin', 'staff'] },
    { id: 'messages', label: 'Messages', icon: MessageSquare, roles: ['admin', 'staff', 'guest'] },
    { id: 'feedback', label: 'Feedback', icon: Star, roles: ['admin', 'staff', 'guest'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['admin', 'staff', 'guest'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(role));

  return (
    <div className="hidden lg:flex w-64 bg-hotel-blue text-white h-screen flex-col fixed left-0 top-0 z-50">
      <div className="p-8 flex items-center gap-3 border-b border-white/10">
        <div className="bg-hotel-gold p-2 rounded-sm shadow-lg">
          <Hotel className="h-6 w-6 text-hotel-blue" />
        </div>
        <span className="font-serif font-bold text-2xl tracking-widest text-hotel-sand">MARGARITA</span>
      </div>
      
      <nav className="flex-1 p-6 space-y-3 overflow-y-auto">
        {filteredItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-none transition-all duration-300 border-l-2 ${
              activeTab === item.id 
                ? 'border-hotel-gold bg-white/5 text-hotel-gold' 
                : 'border-transparent text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium tracking-wide uppercase text-xs">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-white/10">
        <button 
          onClick={() => signOut(auth)}
          className="w-full flex items-center gap-4 px-5 py-4 text-white/60 hover:text-white transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium tracking-wide uppercase text-xs">Logout</span>
        </button>
      </div>
    </div>
  );
};

const BottomNav = ({ activeTab, setActiveTab, role }: { activeTab: string, setActiveTab: (t: string) => void, role: string }) => {
  const isStaff = ['admin', 'staff', 'housekeeping'].includes(role);
  
  const menuItems = [
    { id: 'home', label: isStaff ? 'Admin' : 'Dashboard', icon: Hotel, roles: ['admin', 'staff', 'housekeeping', 'guest'] },
    { id: 'reservations', label: 'Book', icon: CalendarIcon, roles: ['admin', 'staff', 'guest'] },
    { id: 'messages', label: 'Chat', icon: MessageSquare, roles: ['admin', 'staff', 'guest'] },
    { id: 'settings', label: 'More', icon: Menu, roles: ['admin', 'staff', 'guest'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(role));

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-hotel-blue text-white h-16 flex items-center justify-around z-50 border-t border-white/10 px-2">
      {filteredItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${
            activeTab === item.id ? 'text-hotel-gold' : 'text-white/50'
          }`}
        >
          <item.icon className="h-5 w-5" />
          <span className="text-[10px] uppercase tracking-tighter font-medium">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

const Header = ({ title, user, isAdminMode, setIsAdminMode, isStaff }: { title: string, user: any, isAdminMode: boolean, setIsAdminMode: (v: boolean) => void, isStaff: boolean }) => {
  return (
    <header className="h-20 bg-white border-b border-hotel-blue/5 flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center gap-6">
        <h2 className="text-2xl font-serif font-semibold text-hotel-blue capitalize tracking-tight">{title}</h2>
        {isStaff && (
          <Button 
            onClick={() => setIsAdminMode(!isAdminMode)}
            variant="outline" 
            size="sm" 
            className="h-9 rounded-none border-hotel-gold/20 bg-hotel-gold/5 text-hotel-blue hover:bg-hotel-gold/10 text-[10px] uppercase font-bold tracking-widest flex items-center gap-2"
          >
            {isAdminMode ? (
              <>
                <Users className="h-3.5 w-3.5 text-hotel-gold" />
                View as Guest
              </>
            ) : (
              <>
                <Shield className="h-3.5 w-3.5 text-hotel-gold" />
                View as Admin
              </>
            )}
          </Button>
        )}
      </div>
      
      <div className="flex items-center gap-8">
        <div className="relative hidden sm:block">
          <Bell className="h-5 w-5 text-hotel-blue/40 cursor-pointer hover:text-hotel-blue transition-colors" />
          <span className="absolute -top-1 -right-1 bg-hotel-gold text-hotel-blue text-[10px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white font-bold">2</span>
        </div>
        
        <div className="flex items-center gap-4 pl-8 border-l border-hotel-blue/5">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-hotel-blue tracking-tight">{user?.displayName}</p>
            <p className="text-[10px] text-hotel-gold uppercase font-bold tracking-widest">{user?.role || 'Guest'}</p>
          </div>
          <img 
            src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName}&background=002B45&color=fff`} 
            alt="Avatar" 
            className="h-10 w-10 rounded-full border-2 border-hotel-sand shadow-sm"
          />
        </div>
      </div>
    </header>
  );
};

// --- View Components ---

const HousekeepingView = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'rooms'), orderBy('number', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roomsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Room));
      setRooms(roomsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'rooms');
    });

    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (roomId: string, newStatus: string) => {
    try {
      const roomRef = doc(db, 'rooms', roomId);
      await updateDoc(roomRef, { status: newStatus });
      toast.success(`Room status updated to ${newStatus}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `rooms/${roomId}`);
    }
  };

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b border-hotel-blue/5 pb-6">
        <div>
          <CardTitle className="text-2xl font-serif">Housekeeping</CardTitle>
          <CardDescription>Monitor and update room cleanliness and maintenance status</CardDescription>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Dirty</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Clean</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12 text-slate-400 font-medium">Loading rooms...</div>
          ) : rooms.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-400 font-medium italic">No rooms found.</div>
          ) : (
            rooms.map((room) => (
              <motion.div 
                key={room.id}
                whileHover={{ scale: 1.02 }}
                className={`p-6 border-2 flex flex-col items-center justify-center gap-3 transition-all duration-300 ${
                  room.status === 'dirty' ? 'border-red-100 bg-red-50/30' : 
                  room.status === 'available' ? 'border-green-100 bg-green-50/30' : 
                  room.status === 'maintenance' ? 'border-orange-100 bg-orange-50/30' : 'border-blue-100 bg-blue-50/30'
                }`}
              >
                <Bed className={`h-8 w-8 ${
                  room.status === 'dirty' ? 'text-red-400' : 
                  room.status === 'available' ? 'text-green-400' : 
                  room.status === 'maintenance' ? 'text-orange-400' : 'text-blue-400'
                }`} />
                <div className="text-center">
                  <p className="text-lg font-bold text-hotel-blue">Room {room.number}</p>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{room.type}</p>
                </div>
                <select 
                  value={room.status} 
                  onChange={(e) => handleStatusChange(room.id, e.target.value)}
                  className="w-full mt-2 bg-white border border-hotel-blue/5 text-[10px] font-bold uppercase tracking-widest p-2 focus:ring-hotel-gold focus:border-hotel-gold cursor-pointer"
                >
                  <option value="available">Clean / Available</option>
                  <option value="dirty">Dirty</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const ReservationsView = ({ role }: { role: string }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const isStaff = ['admin', 'staff'].includes(role);

  useEffect(() => {
    let q;
    if (isStaff) {
      q = query(collection(db, 'reservations'), orderBy('createdAt', 'desc'));
    } else {
      q = query(collection(db, 'reservations'), where('guestId', '==', auth.currentUser?.uid), orderBy('createdAt', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const resData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reservation));
      setReservations(resData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'reservations');
    });

    return () => unsubscribe();
  }, [isStaff]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none rounded-none font-bold uppercase text-[10px]">Confirmed</Badge>;
      case 'pending': return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none rounded-none font-bold uppercase text-[10px]">Pending</Badge>;
      case 'checked-in': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none rounded-none font-bold uppercase text-[10px]">Checked In</Badge>;
      case 'checked-out': return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-none rounded-none font-bold uppercase text-[10px]">Checked Out</Badge>;
      case 'cancelled': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none rounded-none font-bold uppercase text-[10px]">Cancelled</Badge>;
      default: return <Badge className="rounded-none font-bold uppercase text-[10px]">{status}</Badge>;
    }
  };

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b border-hotel-blue/5 pb-6">
        <div>
          <CardTitle className="text-2xl font-serif">Reservations</CardTitle>
          <CardDescription>{isStaff ? 'Manage all guest bookings' : 'Your booking history'}</CardDescription>
        </div>
        {!isStaff && (
          <Button className="bg-hotel-gold hover:bg-hotel-gold/90 text-hotel-blue font-bold uppercase tracking-widest text-[10px] rounded-none">
            <Plus className="h-4 w-4 mr-2" /> New Booking
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-hotel-blue/5">
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-slate-400">Guest</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-slate-400">Room</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-slate-400">Dates</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-slate-400">Amount</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-slate-400">Status</TableHead>
              <TableHead className="text-right font-bold uppercase text-[10px] tracking-widest text-slate-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-12 text-slate-400 font-medium">Loading reservations...</TableCell></TableRow>
            ) : reservations.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-12 text-slate-400 font-medium italic">No reservations found.</TableCell></TableRow>
            ) : (
              reservations.map((res) => (
                <TableRow key={res.id} className="hover:bg-hotel-sand/30 border-hotel-blue/5">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-hotel-blue">{res.guestName || 'Guest'}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-medium">ID: {res.guestId.slice(0, 8)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-hotel-blue">Room {res.roomNumber}</TableCell>
                  <TableCell>
                    <div className="flex flex-col text-[10px] uppercase font-bold tracking-tight">
                      <span className="text-hotel-gold">In: {format(new Date(res.checkInDate), 'MMM dd, yyyy')}</span>
                      <span className="text-hotel-blue">Out: {format(new Date(res.checkOutDate), 'MMM dd, yyyy')}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-hotel-blue">UGX {res.totalAmount?.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(res.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {isStaff && (
                        <Button variant="ghost" size="sm" className="text-hotel-blue hover:bg-hotel-sand">
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="text-slate-400 hover:bg-hotel-sand">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const UsersView = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });

    return () => unsubscribe();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { role: newRole });
      toast.success(`Role updated to ${newRole}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  };

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b border-hotel-blue/5 pb-6">
        <div>
          <CardTitle className="text-2xl font-serif">User Management</CardTitle>
          <CardDescription>Manage user accounts and assign roles</CardDescription>
        </div>
        <Button className="bg-hotel-gold hover:bg-hotel-gold/90 text-hotel-blue font-bold uppercase tracking-widest text-[10px] rounded-none">
          <UserPlus className="h-4 w-4 mr-2" /> Invite New User
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-hotel-blue/5">
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-slate-400">User</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-slate-400">Email</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-slate-400">Role</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-slate-400">Joined</TableHead>
              <TableHead className="text-right font-bold uppercase text-[10px] tracking-widest text-slate-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-12 text-slate-400 font-medium">Loading users...</TableCell></TableRow>
            ) : users.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-12 text-slate-400 font-medium italic">No users found.</TableCell></TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id} className="hover:bg-hotel-sand/30 border-hotel-blue/5">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img 
                        src={u.photoURL || `https://ui-avatars.com/api/?name=${u.displayName || u.email}&background=random`} 
                        className="w-8 h-8 rounded-full" 
                        alt="" 
                      />
                      <span className="font-bold text-hotel-blue">{u.displayName || 'Unnamed User'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500 text-xs">{u.email}</TableCell>
                  <TableCell>
                    <select 
                      value={u.role} 
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="bg-transparent border-none text-[10px] font-bold uppercase tracking-widest text-hotel-gold focus:ring-0 cursor-pointer"
                    >
                      <option value="admin">Admin</option>
                      <option value="staff">Staff</option>
                      <option value="housekeeping">Housekeeping</option>
                      <option value="guest">Guest</option>
                    </select>
                  </TableCell>
                  <TableCell className="text-slate-400 text-[10px] uppercase font-medium">
                    {u.createdAt ? format(new Date(u.createdAt), 'MMM dd, yyyy') : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const PublicNavbar = ({ activePage, setActivePage }: { activePage: string, setActivePage: (p: string) => void }) => {
  const navItems = [
    { id: 'welcome', label: 'Welcome' },
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'blog', label: 'Blog' },
    { id: 'contact', label: 'Contact Us' }
  ];

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 h-24 flex items-center justify-between px-8 md:px-16 bg-gradient-to-b from-black/50 to-transparent">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActivePage('welcome')}>
        <div className="bg-hotel-gold p-1.5 rounded-sm">
          <Hotel className="h-5 w-5 text-hotel-blue" />
        </div>
        <span className="font-serif font-bold text-xl tracking-[0.2em] text-white">MARGARITA</span>
      </div>
      
      <div className="hidden lg:flex items-center gap-10">
        {navItems.map((item) => (
          <button 
            key={item.id} 
            onClick={() => setActivePage(item.id)}
            className={`text-[10px] uppercase font-bold tracking-[0.2em] transition-colors ${
              activePage === item.id ? 'text-hotel-gold' : 'text-white/80 hover:text-hotel-gold'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          className="text-white hover:text-hotel-gold hover:bg-white/5 font-bold uppercase text-[10px] tracking-widest hidden sm:flex"
          onClick={() => setActivePage('home')}
        >
          Sign In
        </Button>
        <Button 
          className="bg-hotel-gold hover:bg-hotel-gold/90 text-hotel-blue font-bold uppercase tracking-widest text-[10px] rounded-none px-6"
          onClick={() => setActivePage('home')}
        >
          Sign Up
        </Button>
      </div>
    </nav>
  );
};

const AboutView = () => (
  <div className="pt-24 bg-hotel-sand min-h-screen">
    <section className="py-20 px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}>
          <p className="text-hotel-gold font-bold uppercase tracking-[0.3em] text-[10px] mb-4">Our Story</p>
          <h2 className="text-5xl font-serif font-bold text-hotel-blue mb-8 leading-tight">A Legacy of Tropical <br/>Sophistication</h2>
          <div className="space-y-6 text-slate-600 leading-relaxed font-light">
            <p>Founded in 1985, Margarita Hotel began as a small boutique retreat on the pristine shores of the Caribbean. Our vision was simple: to create a sanctuary where luxury meets the raw beauty of nature.</p>
            <p>Over the decades, we have evolved into a world-class destination, yet our commitment to personalized service and environmental stewardship remains unchanged. Every corner of our hotel tells a story of craftsmanship, culture, and the pursuit of excellence.</p>
          </div>
        </motion.div>
        <div className="relative">
          <img src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=1000" className="w-full h-[600px] object-cover shadow-2xl" alt="Hotel History" />
          <div className="absolute -bottom-8 -left-8 bg-hotel-blue text-white p-10 hidden md:block">
            <p className="text-4xl font-serif font-bold mb-2">40+</p>
            <p className="text-[10px] uppercase tracking-widest font-bold text-hotel-gold">Years of Excellence</p>
          </div>
        </div>
      </div>
    </section>

    <section className="py-20 bg-white px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        {[
          { title: 'The Azure Spa', desc: 'Indulge in ancient healing rituals and modern wellness treatments.', img: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=600' },
          { title: 'Olympus Gym', desc: 'State-of-the-art equipment with panoramic ocean views.', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=600' },
          { title: 'Margarita Grill', desc: 'A culinary journey through local spices and fresh catches.', img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=600' },
        ].map((item, i) => (
          <div key={i} className="group cursor-pointer">
            <div className="overflow-hidden mb-6 h-80">
              <img src={item.img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={item.title} />
            </div>
            <h3 className="text-2xl font-serif font-bold text-hotel-blue mb-3">{item.title}</h3>
            <p className="text-sm text-slate-500 font-light leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="py-20 bg-hotel-blue text-white px-8">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-hotel-gold font-bold uppercase tracking-[0.3em] text-[10px] mb-4">Events & Celebrations</p>
        <h2 className="text-4xl md:text-5xl font-serif font-bold mb-12">Host Your Moments with Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          <div className="p-10 bg-white/5 border border-white/10">
            <h3 className="text-2xl font-serif font-bold mb-4 text-hotel-sand">Corporate Excellence</h3>
            <p className="text-sm text-white/60 mb-6">Our conference halls are equipped with the latest technology to ensure your business events are seamless and professional.</p>
            <Button variant="outline" className="border-hotel-gold text-hotel-gold hover:bg-hotel-gold hover:text-hotel-blue rounded-none uppercase text-[10px] tracking-widest font-bold">Inquire Now</Button>
          </div>
          <div className="p-10 bg-white/5 border border-white/10">
            <h3 className="text-2xl font-serif font-bold mb-4 text-hotel-sand">Dream Weddings</h3>
            <p className="text-sm text-white/60 mb-6">From beachfront ceremonies to grand ballroom receptions, we make your special day truly unforgettable.</p>
            <Button variant="outline" className="border-hotel-gold text-hotel-gold hover:bg-hotel-gold hover:text-hotel-blue rounded-none uppercase text-[10px] tracking-widest font-bold">Plan Your Wedding</Button>
          </div>
        </div>
      </div>
    </section>
  </div>
);

const GalleryView = () => {
  const [filter, setFilter] = useState('all');
  const items = [
    { id: 1, category: 'rooms', img: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=800' },
    { id: 2, category: 'amenities', img: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&q=80&w=800' },
    { id: 3, category: 'events', img: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800' },
    { id: 4, category: 'rooms', img: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=800' },
    { id: 5, category: 'amenities', img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800' },
    { id: 6, category: 'events', img: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=800' },
  ];

  const filteredItems = filter === 'all' ? items : items.filter(i => i.category === filter);

  return (
    <div className="pt-24 bg-hotel-sand min-h-screen">
      <section className="py-20 px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-hotel-gold font-bold uppercase tracking-[0.3em] text-[10px] mb-4">Visual Journey</p>
          <h2 className="text-5xl font-serif font-bold text-hotel-blue mb-8">Our Gallery</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {['all', 'rooms', 'amenities', 'events'].map((cat) => (
              <Button 
                key={cat}
                onClick={() => setFilter(cat)}
                variant={filter === cat ? 'default' : 'outline'}
                className={`rounded-none uppercase text-[10px] tracking-widest font-bold ${
                  filter === cat ? 'bg-hotel-blue text-white' : 'border-hotel-blue/10 text-hotel-blue'
                }`}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="relative aspect-square overflow-hidden group cursor-pointer"
              >
                <img src={item.img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Gallery" />
                <div className="absolute inset-0 bg-hotel-blue/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Plus className="text-white h-10 w-10" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-20 p-12 bg-hotel-blue text-center text-white">
          <h3 className="text-3xl font-serif font-bold mb-4">Experience it Virtually</h3>
          <p className="text-white/60 mb-8 max-w-2xl mx-auto">Take a 360° tour of our premises and explore every detail of Margarita Hotel from the comfort of your home.</p>
          <Button className="bg-hotel-gold text-hotel-blue font-bold uppercase tracking-widest text-[10px] rounded-none px-10 h-14">Start Virtual Tour</Button>
        </div>
      </section>
    </div>
  );
};

const BlogView = () => (
  <div className="pt-24 bg-hotel-sand min-h-screen">
    <section className="py-20 px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <p className="text-hotel-gold font-bold uppercase tracking-[0.3em] text-[10px] mb-4">Insights & Updates</p>
        <h2 className="text-5xl font-serif font-bold text-hotel-blue mb-8">The Margarita Blog</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {[
          { title: 'Top 5 Local Festivals This Summer', date: 'Oct 12, 2025', cat: 'Local Events', img: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=800' },
          { title: 'Why Business Travelers Choose Margarita', date: 'Oct 08, 2025', cat: 'Business', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800' },
          { title: 'New Seasonal Menu at Margarita Grill', date: 'Sep 28, 2025', cat: 'Dining', img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800' },
        ].map((post, i) => (
          <div key={i} className="bg-white shadow-sm hover:shadow-xl transition-all duration-500 group cursor-pointer">
            <div className="h-64 overflow-hidden">
              <img src={post.img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={post.title} />
            </div>
            <div className="p-8">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-[10px] uppercase font-bold text-hotel-gold tracking-widest">{post.cat}</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{post.date}</span>
              </div>
              <h3 className="text-2xl font-serif font-bold text-hotel-blue mb-4 group-hover:text-hotel-gold transition-colors">{post.title}</h3>
              <Button variant="link" className="p-0 text-hotel-blue font-bold uppercase text-[10px] tracking-widest">Read More <ChevronRight className="h-3 w-3 ml-1" /></Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  </div>
);

const ContactView = () => (
  <div className="pt-24 bg-hotel-sand min-h-screen">
    <section className="py-20 px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        <div>
          <p className="text-hotel-gold font-bold uppercase tracking-[0.3em] text-[10px] mb-4">Get in Touch</p>
          <h2 className="text-5xl font-serif font-bold text-hotel-blue mb-8">Contact Us</h2>
          <p className="text-slate-500 font-light mb-12 leading-relaxed">Have a special request or planning an event? Our team is here to assist you with every detail of your stay.</p>
          
          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="w-12 h-12 bg-white flex items-center justify-center shadow-sm">
                <Clock className="h-5 w-5 text-hotel-gold" />
              </div>
              <div>
                <h4 className="font-bold text-hotel-blue uppercase text-[10px] tracking-widest mb-1">Reception</h4>
                <p className="text-slate-600">+1 (555) 123-4567</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="w-12 h-12 bg-white flex items-center justify-center shadow-sm">
                <CalendarIcon className="h-5 w-5 text-hotel-gold" />
              </div>
              <div>
                <h4 className="font-bold text-hotel-blue uppercase text-[10px] tracking-widest mb-1">Reservations</h4>
                <p className="text-slate-600">reservations@margaritahotel.com</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="w-12 h-12 bg-white flex items-center justify-center shadow-sm">
                <Search className="h-5 w-5 text-hotel-gold" />
              </div>
              <div>
                <h4 className="font-bold text-hotel-blue uppercase text-[10px] tracking-widest mb-1">Location</h4>
                <p className="text-slate-600">123 Tropical Way, Paradise Island</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-12 shadow-2xl">
          <h3 className="text-3xl font-serif font-bold text-hotel-blue mb-8">Send an Inquiry</h3>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Full Name</label>
                <Input className="rounded-none border-slate-200 focus:border-hotel-gold focus:ring-0" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Email Address</label>
                <Input className="rounded-none border-slate-200 focus:border-hotel-gold focus:ring-0" placeholder="john@example.com" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Subject</label>
              <Input className="rounded-none border-slate-200 focus:border-hotel-gold focus:ring-0" placeholder="Event Inquiry" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Message</label>
              <textarea className="w-full min-h-[150px] p-4 rounded-none border border-slate-200 focus:border-hotel-gold focus:outline-none text-sm" placeholder="How can we help you?"></textarea>
            </div>
            <Button className="w-full bg-hotel-blue hover:bg-hotel-blue/90 text-white font-bold uppercase tracking-widest text-[10px] h-14 rounded-none">Send Message</Button>
          </form>
        </div>
      </div>

      <div className="mt-20 h-[400px] bg-slate-200 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest">
          Google Maps Integration Placeholder
        </div>
        <img src="https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover opacity-20" alt="Map" />
      </div>
    </section>
  </div>
);

const GuestLandingView = ({ activePage, setActivePage, onReturnToAdmin }: { activePage: string, setActivePage: (p: string) => void, onReturnToAdmin?: () => void }) => {
  const renderPage = () => {
    switch (activePage) {
      case 'home': return (
        <div className="space-y-0 -m-8">
          {onReturnToAdmin && (
            <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60]">
              <Button 
                onClick={onReturnToAdmin}
                className="bg-hotel-gold hover:bg-hotel-gold/90 text-hotel-blue font-bold rounded-none px-8 h-12 shadow-2xl border border-white/20 uppercase tracking-[0.2em] text-[10px]"
              >
                Return to Admin Panel
              </Button>
            </div>
          )}
          {/* Hero Section */}
          <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=2070" 
                alt="Margarita Hotel" 
                className="w-full h-full object-cover brightness-50"
              />
            </div>
            
            <div className="relative z-10 text-center text-white px-4 max-w-4xl">
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-7xl font-serif font-bold mb-6 tracking-tight"
              >
                Luxury Reimagined. <br />
                <span className="text-hotel-gold italic">Your Escape Starts Here.</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-lg md:text-xl text-hotel-sand/80 font-light tracking-widest uppercase mb-10"
              >
                Experience the pinnacle of tropical sophistication
              </motion.p>
              
              {/* Quick Booking Bar */}
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/95 backdrop-blur-md p-2 rounded-none shadow-2xl flex flex-col md:flex-row items-center gap-2 max-w-5xl mx-auto"
              >
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2 w-full">
                  <div className="flex flex-col items-start px-6 py-3 border-r border-hotel-blue/5">
                    <label className="text-[10px] uppercase font-bold text-hotel-gold tracking-widest mb-1">Check In</label>
                    <input type="date" className="bg-transparent border-none text-hotel-blue font-medium focus:ring-0 w-full" defaultValue={format(new Date(), 'yyyy-MM-dd')} />
                  </div>
                  <div className="flex flex-col items-start px-6 py-3 border-r border-hotel-blue/5">
                    <label className="text-[10px] uppercase font-bold text-hotel-gold tracking-widest mb-1">Check Out</label>
                    <input type="date" className="bg-transparent border-none text-hotel-blue font-medium focus:ring-0 w-full" defaultValue={format(new Date(Date.now() + 86400000), 'yyyy-MM-dd')} />
                  </div>
                  <div className="flex flex-col items-start px-6 py-3">
                    <label className="text-[10px] uppercase font-bold text-hotel-gold tracking-widest mb-1">Guests</label>
                    <select className="bg-transparent border-none text-hotel-blue font-medium focus:ring-0 w-full">
                      <option>2 Adults, 0 Children</option>
                      <option>1 Adult, 0 Children</option>
                      <option>2 Adults, 1 Child</option>
                      <option>2 Adults, 2 Children</option>
                    </select>
                  </div>
                </div>
                <Button className="bg-hotel-blue hover:bg-hotel-blue/90 text-white px-10 h-16 rounded-none font-bold uppercase tracking-widest text-xs w-full md:w-auto">
                  Check Availability
                </Button>
              </motion.div>
            </div>
          </section>

          {/* Amenities Snapshot */}
          <section className="py-20 bg-white px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-serif font-bold text-hotel-blue mb-4">World-Class Amenities</h2>
                <div className="w-20 h-1 bg-hotel-gold mx-auto"></div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                {[
                  { icon: Wifi, label: 'High-Speed Wi-Fi', desc: 'Stay connected anywhere' },
                  { icon: Waves, label: 'Infinity Pool', desc: 'Overlooking the ocean' },
                  { icon: Spade, label: 'Luxury Spa', desc: 'Rejuvenate your soul' },
                  { icon: Utensils, label: 'Fine Dining', desc: 'Exquisite local flavors' },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center text-center group">
                    <div className="w-16 h-16 rounded-full bg-hotel-sand flex items-center justify-center mb-6 group-hover:bg-hotel-gold transition-colors duration-500">
                      <item.icon className="h-8 w-8 text-hotel-blue group-hover:text-white transition-colors duration-500" />
                    </div>
                    <h3 className="font-serif font-bold text-xl text-hotel-blue mb-2">{item.label}</h3>
                    <p className="text-sm text-slate-500 font-light">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Featured Rooms */}
          <section className="py-20 bg-hotel-sand px-8 overflow-hidden">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-end justify-between mb-12">
                <div>
                  <p className="text-hotel-gold font-bold uppercase tracking-[0.3em] text-[10px] mb-2">Exclusive Offers</p>
                  <h2 className="text-4xl font-serif font-bold text-hotel-blue">Featured Rooms</h2>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="rounded-full border-hotel-blue/10"><ChevronLeft className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" className="rounded-full border-hotel-blue/10"><ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { title: 'Presidential Suite', price: 'UGX 3,400,000', img: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=800', tag: 'VVIP' },
                  { title: 'Deluxe Ocean View', price: 'UGX 1,700,000', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800', tag: 'Best Seller' },
                  { title: 'Executive Suite', price: 'UGX 2,300,000', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800', tag: 'Luxury' },
                ].map((pkg, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ y: -10 }}
                    className="bg-white group cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-500"
                  >
                    <div className="relative h-64 overflow-hidden">
                      <img src={pkg.img} alt={pkg.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <Badge className="absolute top-4 right-4 bg-hotel-gold text-hotel-blue font-bold rounded-none border-none">{pkg.tag}</Badge>
                    </div>
                    <div className="p-8">
                      <h3 className="font-serif font-bold text-2xl text-hotel-blue mb-2">{pkg.title}</h3>
                      <div className="flex items-center justify-between">
                        <p className="text-hotel-gold font-bold text-lg">{pkg.price}</p>
                        <Button variant="link" className="text-hotel-blue p-0 font-bold uppercase text-[10px] tracking-widest">Book Now <ChevronRight className="h-3 w-3 ml-1" /></Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Guest Feedback Snippets */}
          <section className="py-20 bg-hotel-blue text-white px-8">
            <div className="max-w-4xl mx-auto text-center">
              <Star className="h-10 w-10 text-hotel-gold mx-auto mb-8 fill-hotel-gold" />
              <Carousel className="w-full">
                <CarouselContent>
                  {[
                    { quote: "The most incredible stay of my life. The attention to detail is unmatched.", author: "Sarah Miller", role: "Business Traveler" },
                    { quote: "Margarita Hotel is a true gem. The staff treated us like royalty.", author: "James Bond", role: "Leisure Guest" },
                    { quote: "Exquisite dining and world-class spa. We will be back every year.", author: "Lara Croft", role: "Adventure Seeker" }
                  ].map((item, i) => (
                    <CarouselItem key={i}>
                      <div className="space-y-6">
                        <p className="text-3xl md:text-4xl font-serif font-light italic leading-relaxed">"{item.quote}"</p>
                        <div>
                          <p className="font-bold text-hotel-gold uppercase tracking-widest text-xs">{item.author}</p>
                          <p className="text-white/40 text-[10px] uppercase tracking-widest mt-1">{item.role}</p>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          </section>

          {/* Chat Widget */}
          <div className="fixed bottom-8 right-8 z-50">
            <Button className="w-14 h-14 rounded-full bg-hotel-blue hover:bg-hotel-blue/90 shadow-2xl flex items-center justify-center p-0">
              <MessageSquare className="h-6 w-6 text-white" />
            </Button>
          </div>
        </div>
      );
      case 'about': return <AboutView />;
      case 'gallery': return <GalleryView />;
      case 'blog': return <BlogView />;
      case 'contact': return <ContactView />;
      default: return null;
    }
  };

  return (
    <div className="space-y-0 -m-8">
      <PublicNavbar activePage={activePage} setActivePage={setActivePage} />
      <AnimatePresence mode="wait">
        <motion.div
          key={activePage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const AdminDashboardView = ({ onSwitchToGuest, onSwitchToLanding }: { onSwitchToGuest: () => void, onSwitchToLanding: () => void }) => {
  const stats = [
    { label: 'Occupancy Rate', value: 85, suffix: '%', icon: Bed, color: COLORS.orange },
    { label: "Today's Arrivals", value: 14, suffix: '', icon: CheckCircle2, color: COLORS.green },
    { label: 'Revenue Today', value: 16150000, suffix: 'UGX', icon: BarChart3, color: COLORS.blue },
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
          <Button 
            onClick={onSwitchToLanding}
            variant="outline" 
            className="h-10 rounded-none border-hotel-blue/10 text-[10px] uppercase font-bold tracking-widest flex items-center gap-2"
          >
            <Star className="h-3 w-3" />
            Landing Site
          </Button>
          <Button 
            onClick={onSwitchToGuest}
            variant="outline" 
            className="h-10 rounded-none border-hotel-blue/10 text-[10px] uppercase font-bold tracking-widest flex items-center gap-2"
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
              {Array.from({ length: 40 }).map((_, i) => {
                const statuses = ['bg-green-500', 'bg-blue-500', 'bg-red-500', 'bg-orange-500'];
                const status = statuses[Math.floor(Math.random() * statuses.length)];
                return (
                  <motion.div 
                    key={i}
                    whileHover={{ scale: 1.1 }}
                    className={`aspect-square rounded-lg ${status} flex items-center justify-center text-white font-bold text-xs shadow-md cursor-pointer relative group`}
                  >
                    {101 + i}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-hotel-blue text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      Room {101 + i} - {status.includes('green') ? 'Available' : status.includes('blue') ? 'Occupied' : 'Pending'}
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
              {[
                { name: 'Alice Johnson', room: '204', status: 'Paid', date: 'Today' },
                { name: 'Robert Wilson', room: '105', status: 'Pending', date: 'Today' },
                { name: 'Elena Gilbert', room: '302', status: 'Paid', date: 'Yesterday' },
                { name: 'Damon Salvatore', room: '401', status: 'Paid', date: 'Yesterday' },
                { name: 'Stefan Salvatore', room: '402', status: 'Failed', date: '2 days ago' },
              ].map((booking, i) => (
                <div key={i} className="p-4 hover:bg-hotel-sand/50 transition-colors flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-hotel-blue">{booking.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-medium">Room {booking.room} • {booking.date}</p>
                  </div>
                  <Badge className={`rounded-none border-none font-bold text-[10px] uppercase ${
                    booking.status === 'Paid' ? 'bg-green-100 text-green-700' : 
                    booking.status === 'Pending' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {booking.status}
                  </Badge>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full h-12 text-hotel-gold font-bold uppercase text-[10px] tracking-widest hover:bg-hotel-sand">View All Reservations</Button>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

        {/* Feedback Feed */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-serif">Guest Feedback</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[300px]">
              <div className="p-6 space-y-6">
                {[
                  { name: 'Sarah Miller', rating: 5, comment: 'Absolutely stunning view and the staff was so helpful!', time: '2h ago' },
                  { name: 'James Bond', rating: 4, comment: 'Great martini, but the room service took a bit long.', time: '5h ago' },
                  { name: 'Lara Croft', rating: 5, comment: 'The spa is world-class. Will definitely be back.', time: '1d ago' },
                  { name: 'Tony Stark', rating: 3, comment: 'Wi-Fi could be faster. I have a lot of data to sync.', time: '2d ago' },
                ].map((feedback, i) => (
                  <div key={i} className="flex gap-4">
                    <img src={`https://ui-avatars.com/api/?name=${feedback.name}&background=random`} className="w-10 h-10 rounded-full" alt="" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="text-sm font-bold text-hotel-blue">{feedback.name}</h4>
                        <span className="text-[10px] text-slate-400 uppercase">{feedback.time}</span>
                      </div>
                      <div className="flex gap-0.5 mb-2">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star key={j} className={`h-3 w-3 ${j < feedback.rating ? 'text-hotel-gold fill-hotel-gold' : 'text-slate-200'}`} />
                        ))}
                      </div>
                      <p className="text-xs text-slate-500 italic">"{feedback.comment}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const GuestDashboardView = ({ user }: { user: any }) => {
  // Mock data for guest
  const upcomingReservations = [
    { id: '1', room: '302', checkIn: '2026-04-10', checkOut: '2026-04-15', status: 'Confirmed' }
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <Card className="flex-1 border-none shadow-sm bg-hotel-blue text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-hotel-gold/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          <CardHeader className="relative z-10">
            <CardTitle className="text-3xl font-serif text-hotel-sand">Welcome back, {user?.displayName?.split(' ')[0]}!</CardTitle>
            <CardDescription className="text-white/60">Your tropical escape awaits. How can we assist you today?</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10 flex gap-4 mt-4">
            <Button className="bg-hotel-gold text-hotel-blue hover:bg-hotel-gold/90 font-bold uppercase tracking-widest text-[10px] rounded-none">Book New Stay</Button>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-none uppercase text-[10px] tracking-widest font-bold">View History</Button>
          </CardContent>
        </Card>

        <Card className="w-full md:w-80 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-serif">Loyalty Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-xs font-bold text-hotel-gold uppercase tracking-widest">Gold Member</span>
              <span className="text-2xl font-bold text-hotel-blue">2,450 <span className="text-[10px] text-slate-400">pts</span></span>
            </div>
            <Progress value={65} className="h-2 bg-hotel-sand" />
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">550 points until Platinum status</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader className="border-b border-hotel-blue/5">
            <CardTitle className="text-xl font-serif">Your Upcoming Stay</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {upcomingReservations.length > 0 ? (
              upcomingReservations.map((res) => (
                <div key={res.id} className="p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex gap-6">
                    <div className="w-20 h-20 bg-hotel-sand flex items-center justify-center rounded-lg">
                      <Hotel className="h-10 w-10 text-hotel-gold" />
                    </div>
                    <div>
                      <h4 className="text-xl font-serif font-bold text-hotel-blue">Deluxe Ocean View</h4>
                      <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mt-1">Room {res.room} • {res.status}</p>
                      <div className="flex gap-4 mt-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-hotel-gold tracking-widest">Check In</span>
                          <span className="text-sm font-bold text-hotel-blue">{format(new Date(res.checkIn), 'MMM dd, yyyy')}</span>
                        </div>
                        <div className="w-px h-8 bg-hotel-blue/5" />
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-hotel-gold tracking-widest">Check Out</span>
                          <span className="text-sm font-bold text-hotel-blue">{format(new Date(res.checkOut), 'MMM dd, yyyy')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 w-full md:w-auto">
                    <Button className="bg-hotel-blue text-white rounded-none uppercase text-[10px] tracking-widest font-bold">Manage Booking</Button>
                    <Button variant="outline" className="border-hotel-blue/10 text-hotel-blue rounded-none uppercase text-[10px] tracking-widest font-bold">Get Directions</Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-slate-400 italic">No upcoming reservations.</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-serif">Quick Services</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-hotel-blue/5">
              {[
                { icon: Utensils, label: 'Order Room Service', desc: 'Browse our gourmet menu' },
                { icon: Spade, label: 'Book Spa Session', desc: 'Relax and rejuvenate' },
                { icon: Wifi, label: 'Wi-Fi Access', desc: 'Get your connection codes' },
                { icon: MessageSquare, label: 'Contact Concierge', desc: 'We are here to help' },
              ].map((service, i) => (
                <button key={i} className="w-full p-6 flex items-center gap-4 hover:bg-hotel-sand/50 transition-colors text-left group">
                  <div className="w-10 h-10 bg-hotel-sand flex items-center justify-center rounded-full group-hover:bg-hotel-gold transition-colors">
                    <service.icon className="h-5 w-5 text-hotel-blue group-hover:text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-hotel-blue">{service.label}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-medium">{service.desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 ml-auto text-slate-300" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const { user, profile, loading, isAuthReady } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [activePage, setActivePage] = useState('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(true);

  // New Guest Info State
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [nationality, setNationality] = useState('');
  const [idType, setIdType] = useState('Passport');
  const [idNumber, setIdNumber] = useState('');

  const handleGoogleLogin = async () => {
    try {
      setAuthLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Login failed. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setAuthLoading(true);
      if (isSignUp) {
        if (!fullName || !phoneNumber || !dateOfBirth || !nationality || !idNumber) {
          toast.error("Please fill in all required fields");
          setAuthLoading(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Update Auth Profile
        await updateProfile(userCredential.user, {
          displayName: fullName
        });

        // Save Additional Info to Firestore
        const userRef = doc(db, 'users', userCredential.user.uid);
        await setDoc(userRef, {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: fullName,
          phoneNumber,
          dateOfBirth,
          nationality,
          idType,
          idNumber,
          role: 'guest', // Default role for external sign-ups
          createdAt: new Date().toISOString()
        });

        toast.success("Account created successfully!");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Logged in successfully!");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      let message = "Authentication failed";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        message = "Invalid email or password";
      } else if (error.code === 'auth/email-already-in-use') {
        message = "Email already in use";
      } else if (error.code === 'auth/weak-password') {
        message = "Password should be at least 6 characters";
      }
      toast.error(message);
    } finally {
      setAuthLoading(false);
    }
  };

  if (!isAuthReady || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-hotel-sand">
        <div className="flex flex-col items-center gap-6">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-hotel-gold border-t-transparent rounded-full shadow-xl"
          />
          <div className="text-center">
            <h2 className="font-serif text-2xl font-bold text-hotel-blue tracking-widest">MARGARITA</h2>
            <p className="text-hotel-gold text-[10px] uppercase tracking-[0.4em] font-bold mt-1">Luxury Reimagined</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-hotel-sand relative overflow-hidden">
        <Toaster position="top-center" richColors />
        <PublicNavbar activePage={activePage} setActivePage={setActivePage} />
        
        <AnimatePresence mode="wait">
          {activePage === 'home' ? (
            <motion.div 
              key="login"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex items-center justify-center relative bg-hotel-blue min-h-screen"
            >
              {/* Background Accents */}
              <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-hotel-gold rounded-full blur-[150px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-400 rounded-full blur-[150px]" />
              </div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-white/95 backdrop-blur-xl rounded-none shadow-2xl p-12 z-10 border border-white/20"
              >
                <div className="flex flex-col items-center text-center mb-12">
                  <div className="bg-hotel-gold p-5 rounded-none shadow-xl mb-8">
                    <Hotel className="h-12 w-12 text-hotel-blue" />
                  </div>
                  <h1 className="text-4xl font-serif font-bold text-hotel-blue tracking-tight">MARGARITA</h1>
                  <p className="text-hotel-gold text-[10px] uppercase tracking-[0.5em] font-bold mt-2">Hotel Management System</p>
                </div>

                <div className="space-y-6">
                  <form onSubmit={handleEmailAuth} className="space-y-4">
                    {isSignUp && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold text-hotel-blue/60 tracking-widest ml-1">Full Name</label>
                          <Input 
                            placeholder="John Doe" 
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="h-12 rounded-none border-hotel-blue/10 focus:border-hotel-gold focus:ring-hotel-gold"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold text-hotel-blue/60 tracking-widest ml-1">Phone Number</label>
                          <Input 
                            placeholder="+256 700 000000" 
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="h-12 rounded-none border-hotel-blue/10 focus:border-hotel-gold focus:ring-hotel-gold"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold text-hotel-blue/60 tracking-widest ml-1">Date of Birth</label>
                          <Input 
                            type="date" 
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                            className="h-12 rounded-none border-hotel-blue/10 focus:border-hotel-gold focus:ring-hotel-gold"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold text-hotel-blue/60 tracking-widest ml-1">Nationality</label>
                          <Input 
                            placeholder="Ugandan" 
                            value={nationality}
                            onChange={(e) => setNationality(e.target.value)}
                            className="h-12 rounded-none border-hotel-blue/10 focus:border-hotel-gold focus:ring-hotel-gold"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold text-hotel-blue/60 tracking-widest ml-1">ID Type</label>
                          <select 
                            value={idType}
                            onChange={(e) => setIdType(e.target.value)}
                            className="w-full h-12 rounded-none border border-hotel-blue/10 focus:border-hotel-gold focus:ring-hotel-gold bg-white px-3 text-sm"
                            required
                          >
                            <option value="Passport">Passport</option>
                            <option value="National ID">National ID</option>
                            <option value="Driver's License">Driver's License</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold text-hotel-blue/60 tracking-widest ml-1">ID Number</label>
                          <Input 
                            placeholder="ID Number" 
                            value={idNumber}
                            onChange={(e) => setIdNumber(e.target.value)}
                            className="h-12 rounded-none border-hotel-blue/10 focus:border-hotel-gold focus:ring-hotel-gold"
                            required
                          />
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-hotel-blue/60 tracking-widest ml-1">Email Address</label>
                      <Input 
                        type="email" 
                        placeholder="your@email.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 rounded-none border-hotel-blue/10 focus:border-hotel-gold focus:ring-hotel-gold"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-hotel-blue/60 tracking-widest ml-1">Password</label>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12 rounded-none border-hotel-blue/10 focus:border-hotel-gold focus:ring-hotel-gold"
                        required
                      />
                    </div>
                    <Button 
                      type="submit"
                      disabled={authLoading}
                      className="w-full h-14 bg-hotel-blue hover:bg-hotel-blue/90 text-white font-bold rounded-none uppercase tracking-widest text-xs shadow-lg mt-2"
                    >
                      {authLoading ? "Processing..." : (isSignUp ? "Create Account" : "Sign In")}
                    </Button>
                  </form>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase font-bold">
                      <span className="bg-white px-4 text-hotel-blue/40 tracking-widest">Or continue with</span>
                    </div>
                  </div>

                  <Button 
                    onClick={handleGoogleLogin}
                    variant="outline"
                    disabled={authLoading}
                    className="w-full h-14 border-hotel-blue/10 hover:bg-hotel-sand text-hotel-blue font-bold rounded-none flex items-center justify-center gap-4 uppercase tracking-widest text-xs"
                  >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                    Google Account
                  </Button>

                  <div className="text-center mt-4">
                    <button 
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="text-[10px] uppercase font-bold text-hotel-gold hover:text-hotel-blue transition-colors tracking-widest"
                    >
                      {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key={activePage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1"
            >
              {activePage === 'welcome' && <GuestLandingView activePage="home" setActivePage={setActivePage} />}
              {activePage === 'about' && <AboutView />}
              {activePage === 'gallery' && <GalleryView />}
              {activePage === 'blog' && <BlogView />}
              {activePage === 'contact' && <ContactView />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  const role = user?.email === 'stuartdonsms@gmail.com' ? 'admin' : (profile?.role || 'guest');
  const isStaff = ['admin', 'staff', 'housekeeping'].includes(role);
  const effectiveIsStaff = isStaff && isAdminMode;

  const renderContent = () => {
    if (activeTab === 'home') {
      return effectiveIsStaff ? (
        <AdminDashboardView 
          onSwitchToGuest={() => setIsAdminMode(false)} 
          onSwitchToLanding={() => setActiveTab('welcome')} 
        />
      ) : (
        <div className="space-y-6">
          {isStaff && (
            <div className="bg-hotel-gold/10 p-4 border border-hotel-gold/20 flex items-center justify-between">
              <p className="text-xs font-bold text-hotel-blue uppercase tracking-widest">You are viewing as a Guest</p>
              <Button 
                onClick={() => setIsAdminMode(true)}
                variant="outline" 
                size="sm" 
                className="h-8 rounded-none border-hotel-blue/20 text-[10px] uppercase font-bold"
              >
                Return to Admin Panel
              </Button>
            </div>
          )}
          <GuestDashboardView user={profile || user} />
        </div>
      );
    }

    if (activeTab === 'welcome') {
      return (
        <GuestLandingView 
          activePage={activePage} 
          setActivePage={setActivePage} 
          onReturnToAdmin={isStaff ? () => {
            setIsAdminMode(true);
            setActiveTab('home');
          } : undefined}
        />
      );
    }

    switch (activeTab) {
      case 'rooms': return <RoomsView />;
      default: return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-slate-300">
          <Clock className="h-20 w-20 mb-6 opacity-10" />
          <h3 className="text-2xl font-serif font-medium text-hotel-blue/40">Module Under Development</h3>
          <p className="text-xs uppercase tracking-widest font-bold mt-2">The {activeTab} module is coming soon</p>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-hotel-sand">
      <Toaster position="top-center" richColors />
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} role={role} />
      
      <main className="lg:ml-64 min-h-screen flex flex-col pb-20 lg:pb-0">
        <Header 
          title={activeTab === 'home' ? (isStaff ? 'Dashboard' : 'Welcome') : activeTab} 
          user={{ ...(profile || {}), displayName: user.displayName, role, photoURL: user.photoURL }} 
          isAdminMode={isAdminMode}
          setIsAdminMode={setIsAdminMode}
          isStaff={isStaff}
        />
        
        <div className="p-8 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} role={role} />
    </div>
  );
}

// --- Placeholder for RoomsView (already defined in previous turn, keeping it for completeness) ---
const RoomsView = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'rooms'), orderBy('number', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roomsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Room));
      setRooms(roomsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'rooms');
    });

    return () => unsubscribe();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none rounded-none font-bold uppercase text-[10px]">Available</Badge>;
      case 'occupied': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none rounded-none font-bold uppercase text-[10px]">Occupied</Badge>;
      case 'dirty': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none rounded-none font-bold uppercase text-[10px]">Dirty</Badge>;
      case 'maintenance': return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none rounded-none font-bold uppercase text-[10px]">Maintenance</Badge>;
      default: return <Badge className="rounded-none font-bold uppercase text-[10px]">{status}</Badge>;
    }
  };

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b border-hotel-blue/5 pb-6">
        <div>
          <CardTitle className="text-2xl font-serif">Room Inventory</CardTitle>
          <CardDescription>Manage and monitor room statuses</CardDescription>
        </div>
        <Button className="bg-hotel-gold hover:bg-hotel-gold/90 text-hotel-blue font-bold uppercase tracking-widest text-[10px] rounded-none">
          <Plus className="h-4 w-4 mr-2" /> Add New Room
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-hotel-blue/5">
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-slate-400">Room No.</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-slate-400">Type</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-slate-400">Floor</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-slate-400">Price</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-slate-400">Status</TableHead>
              <TableHead className="text-right font-bold uppercase text-[10px] tracking-widest text-slate-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-12 text-slate-400 font-medium">Loading rooms...</TableCell></TableRow>
            ) : rooms.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-12 text-slate-400 font-medium italic">No rooms found in the inventory.</TableCell></TableRow>
            ) : (
              rooms.map((room) => (
                <TableRow key={room.id} className="border-hotel-blue/5 hover:bg-hotel-sand/30 transition-colors">
                  <TableCell className="font-bold text-hotel-blue">{room.number}</TableCell>
                  <TableCell className="capitalize text-slate-600">{room.type}</TableCell>
                  <TableCell className="text-slate-600">{room.floor}</TableCell>
                  <TableCell className="font-bold text-hotel-gold">UGX {room.pricePerNight?.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(room.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-hotel-blue hover:text-hotel-gold font-bold uppercase text-[10px] tracking-widest">Edit</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
