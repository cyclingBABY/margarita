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

export const AdminDashboardView = ({ onSwitchToGuest, onSwitchToLanding }: { onSwitchToGuest: () => void, onSwitchToLanding: () => void }) => {
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

