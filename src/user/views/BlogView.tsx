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
import { ContactView } from '@/src/user/views/ContactView';
import { GuestLandingView } from '@/src/user/views/GuestLandingView';
import { AdminDashboardView } from '@/src/admin/views/AdminDashboardView';
import { GuestDashboardView } from '@/src/user/views/GuestDashboardView';
import { RoomsView } from '@/src/admin/views/RoomsView';

export const BlogView = () => (
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

