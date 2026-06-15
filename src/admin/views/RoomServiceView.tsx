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
  EyeOff,
  ChefHat,
  Truck,
  DollarSign
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Room, Reservation, Feedback, UserProfile } from '@/src/types';
import { format } from 'date-fns';
import { toast, Toaster } from 'sonner';
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

interface RoomServiceOrder {
  id: string;
  guestId: string;
  guestName: string;
  roomNumber: string;
  reservationId: string;
  items: any[];
  totalAmount: number;
  status: string;
  paymentStatus: string;
  specialInstructions: string;
  estimatedDeliveryTime: string;
  createdAt: string;
  updatedAt: string;
  daysRemaining: number;
}

export const RoomServiceView = ({ role }: { role: string }) => {
  const [roomServiceOrders, setRoomServiceOrders] = useState<RoomServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string | null>('all');

  const fetchRoomServiceOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/staff/room-service', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.error("Your session has expired. Please log in again.");
        window.location.href = '/login';
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setRoomServiceOrders(data);
      }
    } catch (error) {
      console.error("Error fetching room service orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomServiceOrders();
  }, []);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/staff/room-service/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.error("Your session has expired. Please log in again.");
        window.location.href = '/login';
        return;
      }

      if (!response.ok) throw new Error("Failed to update status");

      toast.success(`Order status updated to ${newStatus}`);
      fetchRoomServiceOrders();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handlePaymentStatusUpdate = async (orderId: string, paymentStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/staff/room-service/${orderId}/payment-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ paymentStatus }),
      });

      if (response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.error("Your session has expired. Please log in again.");
        window.location.href = '/login';
        return;
      }

      if (!response.ok) throw new Error("Failed to update payment status");

      toast.success(`Payment marked as ${paymentStatus}`);
      fetchRoomServiceOrders();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none rounded-none font-bold uppercase text-[10px]">Pending</Badge>;
      case 'preparing': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none rounded-none font-bold uppercase text-[10px]">Preparing</Badge>;
      case 'ready': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none rounded-none font-bold uppercase text-[10px]">Ready</Badge>;
      case 'delivered': return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-none rounded-none font-bold uppercase text-[10px]">Delivered</Badge>;
      case 'cancelled': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none rounded-none font-bold uppercase text-[10px]">Cancelled</Badge>;
      default: return <Badge className="rounded-none font-bold uppercase text-[10px]">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (ps?: string) => {
    if (ps === 'paid') return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none rounded-none font-bold uppercase text-[10px]"><DollarSign className="h-3 w-3 mr-1" /> Paid</Badge>;
    if (ps === 'refunded') return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-none rounded-none font-bold uppercase text-[10px]"><Check className="h-3 w-3 mr-1" /> Refunded</Badge>;
    return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none rounded-none font-bold uppercase text-[10px]"><Clock className="h-3 w-3 mr-1" /> Unpaid</Badge>;
  };

  const filteredOrders = (filterStatus === 'all' || filterStatus === null)
    ? roomServiceOrders
    : roomServiceOrders.filter(order => order.status === filterStatus);

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b border-hotel-blue/5 pb-6">
        <div>
          <CardTitle className="text-2xl font-serif flex items-center gap-2">
            <Utensils className="h-6 w-6" /> Room Service Orders
          </CardTitle>
          <CardDescription>Manage guest room service requests</CardDescription>
        </div>
        <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value ?? 'all')}>
          <SelectTrigger className="w-40 rounded-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-none">
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="preparing">Preparing</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="p-6 bg-hotel-sand/20">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-hotel-blue/40">
            <Clock className="h-12 w-12 mb-4 animate-spin-slow opacity-20" />
            <p className="font-bold uppercase tracking-widest text-xs">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-hotel-blue/40">
            <Utensils className="h-12 w-12 mb-4 opacity-20" />
            <p className="font-bold uppercase tracking-widest text-xs">No room service orders found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredOrders.map((order) => (
              <motion.div key={order.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group bg-white">
                  <div className={`h-2 w-full ${order.status === 'pending' ? 'bg-orange-500' : order.status === 'preparing' ? 'bg-blue-500' : order.status === 'ready' ? 'bg-green-500' : 'bg-hotel-gold'}`} />

                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-hotel-sand flex items-center justify-center text-hotel-blue font-bold text-lg">
                          <Utensils className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-hotel-blue text-lg leading-none mb-1">{order.guestName}</h3>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <Bed className="h-3 w-3" /> Room {order.roomNumber}
                          </p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                            {order.daysRemaining} days remaining
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        {getStatusBadge(order.status)}
                        {getPaymentStatusBadge(order.paymentStatus)}
                      </div>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="p-3 bg-hotel-sand/30 rounded-lg">
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Ordered Items</p>
                        <div className="space-y-1">
                          {order.items.map((item: any, index: number) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{item.name} × {item.quantity}</span>
                              <span className="font-medium">UGX {(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {order.specialInstructions && (
                        <div className="p-3 border border-hotel-blue/5 rounded-lg">
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Special Instructions</p>
                          <p className="text-sm text-hotel-blue">{order.specialInstructions}</p>
                        </div>
                      )}

                      {order.estimatedDeliveryTime && (
                        <div className="p-3 border border-hotel-blue/5 rounded-lg">
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Preferred Delivery Time</p>
                          <p className="text-sm text-hotel-blue">{order.estimatedDeliveryTime}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between p-3 bg-hotel-blue text-white rounded-lg">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-hotel-sand">Total Amount</span>
                        <span className="font-bold text-lg text-hotel-gold">UGX {Number(order.totalAmount || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end mt-4 pt-4 border-t border-hotel-blue/5 flex-wrap">
                      {order.status === 'pending' && (
                        <Button
                          onClick={() => handleStatusUpdate(order.id, 'preparing')}
                          className="flex-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border-none rounded-md font-bold uppercase text-[10px] tracking-widest"
                        >
                          <ChefHat className="h-4 w-4 mr-2" /> Start Preparing
                        </Button>
                      )}
                      {order.status === 'preparing' && (
                        <Button
                          onClick={() => handleStatusUpdate(order.id, 'ready')}
                          className="flex-1 bg-green-50 text-green-700 hover:bg-green-100 border-none rounded-md font-bold uppercase text-[10px] tracking-widest"
                        >
                          <Check className="h-4 w-4 mr-2" /> Mark Ready
                        </Button>
                      )}
                      {order.status === 'ready' && (
                        <Button
                          onClick={() => handleStatusUpdate(order.id, 'delivered')}
                          className="flex-1 bg-slate-50 text-slate-700 hover:bg-slate-100 border-none rounded-md font-bold uppercase text-[10px] tracking-widest"
                        >
                          <Truck className="h-4 w-4 mr-2" /> Mark Delivered
                        </Button>
                      )}
                      {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <Button
                          onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                          className="flex-1 bg-red-50 text-red-700 hover:bg-red-100 border-none rounded-md font-bold uppercase text-[10px] tracking-widest"
                        >
                          <X className="h-4 w-4 mr-2" /> Cancel
                        </Button>
                      )}
                      {role === 'admin' && order.paymentStatus !== 'paid' && order.status !== 'cancelled' && (
                        <Button
                          onClick={() => handlePaymentStatusUpdate(order.id, 'paid')}
                          className="flex-1 bg-green-600 text-white hover:bg-green-700 border-none rounded-md font-bold uppercase text-[10px] tracking-widest"
                        >
                          <DollarSign className="h-4 w-4 mr-2" /> Mark Paid
                        </Button>
                      )}
                      {role === 'admin' && order.paymentStatus === 'paid' && (
                        <Button
                          onClick={() => handlePaymentStatusUpdate(order.id, 'pending')}
                          variant="outline"
                          className="flex-1 border-orange-200 text-orange-700 hover:bg-orange-50 rounded-md font-bold uppercase text-[10px] tracking-widest"
                        >
                          <Clock className="h-4 w-4 mr-2" /> Mark Unpaid
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};