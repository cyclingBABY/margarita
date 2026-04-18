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
import { GuestLandingView } from '@/src/user/views/GuestLandingView';
import { AdminDashboardView } from '@/src/admin/views/AdminDashboardView';
import { GuestDashboardView } from '@/src/user/views/GuestDashboardView';
import { RoomsView } from '@/src/admin/views/RoomsView';

export const ContactView = () => (
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

