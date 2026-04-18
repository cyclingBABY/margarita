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
import { GalleryView } from '@/src/user/views/GalleryView';
import { BlogView } from '@/src/user/views/BlogView';
import { ContactView } from '@/src/user/views/ContactView';
import { GuestLandingView } from '@/src/user/views/GuestLandingView';
import { AdminDashboardView } from '@/src/admin/views/AdminDashboardView';
import { GuestDashboardView } from '@/src/user/views/GuestDashboardView';
import { RoomsView } from '@/src/admin/views/RoomsView';

export const AboutView = () => (
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

