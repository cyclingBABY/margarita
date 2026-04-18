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
import { AboutView } from '@/src/user/views/AboutView';
import { GalleryView } from '@/src/user/views/GalleryView';
import { BlogView } from '@/src/user/views/BlogView';
import { ContactView } from '@/src/user/views/ContactView';
import { GuestLandingView } from '@/src/user/views/GuestLandingView';
import { AdminDashboardView } from '@/src/admin/views/AdminDashboardView';
import { GuestDashboardView } from '@/src/user/views/GuestDashboardView';
import { RoomsView } from '@/src/admin/views/RoomsView';

export const PublicNavbar = ({ activePage, setActivePage }: { activePage: string, setActivePage: (p: string) => void }) => {
  const navItems = [
    { id: 'welcome', label: 'Welcome' },
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

