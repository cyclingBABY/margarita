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

export const ReservationsView = ({ role }: { role: string }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const isStaff = ['admin', 'staff'].includes(role);

  const fetchReservations = async () => {
    try {
      const url = isStaff ? '/api/reservations' : `/api/reservations?guestId=${auth.currentUser?.uid}`;
      const response = await fetch(url);
      const data = await response.json();
      setReservations(data);
    } catch (error) {
      console.error("Error fetching reservations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [isStaff]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none rounded-none font-bold uppercase text-[10px]">Confirmed</Badge>;
      case 'pending': return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none rounded-none font-bold uppercase text-[10px]">Pending</Badge>;
      case 'checked-in': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none rounded-none font-bold uppercase text-[10px]">Checked In</Badge>;
      case 'checked-out': return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-none rounded-none font-bold uppercase text-[10px]">Checked Out</Badge>;
      case 'cancelled': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none rounded-none font-bold uppercase text-[10px]">Cancelled</Badge>;
      default: return <Badge className="rounded-none font-bold uppercase text-[10px]">{status}</Badge>;
    }
  };

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b border-hotel-blue/5 pb-6">
        <div>
          <CardTitle className="text-2xl font-serif">Reservations</CardTitle>
          <CardDescription>{isStaff ? 'Manage all guest bookings' : 'Your booking history'}</CardDescription>
        </div>
        {!isStaff && (
          <Button className="bg-hotel-gold hover:bg-hotel-gold/90 text-hotel-blue font-bold uppercase tracking-widest text-[10px] rounded-none">
            <Plus className="h-4 w-4 mr-2" /> New Booking
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-hotel-blue/5">
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-slate-400">Guest</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-slate-400">Room</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-slate-400">Dates</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-slate-400">Amount</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-slate-400">Status</TableHead>
              <TableHead className="text-right font-bold uppercase text-[10px] tracking-widest text-slate-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-12 text-slate-400 font-medium">Loading reservations...</TableCell></TableRow>
            ) : reservations.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-12 text-slate-400 font-medium italic">No reservations found.</TableCell></TableRow>
            ) : (
              reservations.map((res) => (
                <TableRow key={res.id} className="hover:bg-hotel-sand/30 border-hotel-blue/5">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-hotel-blue">{res.guestName || 'Guest'}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-medium">ID: {res.guestId.slice(0, 8)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-hotel-blue">Room {res.roomNumber}</TableCell>
                  <TableCell>
                    <div className="flex flex-col text-[10px] uppercase font-bold tracking-tight">
                      <span className="text-hotel-gold">In: {format(new Date(res.checkInDate), 'MMM dd, yyyy')}</span>
                      <span className="text-hotel-blue">Out: {format(new Date(res.checkOutDate), 'MMM dd, yyyy')}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-hotel-blue">UGX {res.totalAmount?.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(res.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {isStaff && (
                        <Button variant="ghost" size="sm" className="text-hotel-blue hover:bg-hotel-sand">
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="text-slate-400 hover:bg-hotel-sand">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
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

