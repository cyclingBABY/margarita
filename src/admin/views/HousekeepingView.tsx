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

export const HousekeepingView = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms');
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleStatusChange = async (roomId: string, newStatus: string) => {
    try {
      await fetch(`/api/rooms/${roomId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      toast.success(`Room status updated to ${newStatus}`);
      fetchRooms();
    } catch (error) {
      console.error("Error updating room:", error);
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

