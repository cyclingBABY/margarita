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
import { AdminDashboardView } from '@/src/admin/views/AdminDashboardView';
import { RoomsView } from '@/src/admin/views/RoomsView';

export const GuestDashboardView = ({ user }: { user: any }) => {
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

