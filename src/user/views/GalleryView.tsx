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
import { BlogView } from '@/src/user/views/BlogView';
import { ContactView } from '@/src/user/views/ContactView';
import { GuestLandingView } from '@/src/user/views/GuestLandingView';
import { AdminDashboardView } from '@/src/admin/views/AdminDashboardView';
import { GuestDashboardView } from '@/src/user/views/GuestDashboardView';
import { RoomsView } from '@/src/admin/views/RoomsView';

export const GalleryView = () => {
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

