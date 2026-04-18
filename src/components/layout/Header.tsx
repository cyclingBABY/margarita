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

export const Header = ({ title, user, isAdminMode, setIsAdminMode, isStaff }: { title: string, user: any, isAdminMode: boolean, setIsAdminMode: (v: boolean) => void, isStaff: boolean }) => {
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

