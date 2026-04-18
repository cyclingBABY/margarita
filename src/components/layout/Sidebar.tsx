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
import { GuestDashboardView } from '@/src/user/views/GuestDashboardView';
import { RoomsView } from '@/src/admin/views/RoomsView';

export const Sidebar = ({ activeTab, setActiveTab, role }: { activeTab: string, setActiveTab: (t: string) => void, role: string }) => {
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

