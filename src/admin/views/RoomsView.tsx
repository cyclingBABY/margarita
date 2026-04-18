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
import { GuestDashboardView } from '@/src/user/views/GuestDashboardView';

export const RoomsView = () => {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none rounded-none font-bold uppercase text-[10px]">Available</Badge>;
      case 'occupied': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none rounded-none font-bold uppercase text-[10px]">Occupied</Badge>;
      case 'dirty': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none rounded-none font-bold uppercase text-[10px]">Dirty</Badge>;
      case 'maintenance': return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none rounded-none font-bold uppercase text-[10px]">Maintenance</Badge>;
      default: return <Badge className="rounded-none font-bold uppercase text-[10px]">{status}</Badge>;
    }
  };

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b border-hotel-blue/5 pb-6">
        <div>
          <CardTitle className="text-2xl font-serif">Room Inventory</CardTitle>
          <CardDescription>Manage and monitor room statuses</CardDescription>
        </div>
        <Button className="bg-hotel-gold hover:bg-hotel-gold/90 text-hotel-blue font-bold uppercase tracking-widest text-[10px] rounded-none">
          <Plus className="h-4 w-4 mr-2" /> Add New Room
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-hotel-blue/5">
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-slate-400">Room No.</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-slate-400">Type</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-slate-400">Floor</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-slate-400">Price</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-slate-400">Status</TableHead>
              <TableHead className="text-right font-bold uppercase text-[10px] tracking-widest text-slate-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-12 text-slate-400 font-medium">Loading rooms...</TableCell></TableRow>
            ) : rooms.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-12 text-slate-400 font-medium italic">No rooms found in the inventory.</TableCell></TableRow>
            ) : (
              rooms.map((room) => (
                <TableRow key={room.id} className="border-hotel-blue/5 hover:bg-hotel-sand/30 transition-colors">
                  <TableCell className="font-bold text-hotel-blue">{room.number}</TableCell>
                  <TableCell className="capitalize text-slate-600">{room.type}</TableCell>
                  <TableCell className="text-slate-600">{room.floor}</TableCell>
                  <TableCell className="font-bold text-hotel-gold">UGX {room.pricePerNight?.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(room.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-hotel-blue hover:text-hotel-gold font-bold uppercase text-[10px] tracking-widest">Edit</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
