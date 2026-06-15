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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { downloadReceipt } from '@/src/utils/receipt';
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
import { RoomServiceTracker } from '@/src/user/components/RoomServiceTracker';
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
import { RoomsView } from '@/src/admin/views/RoomsView';

export const GuestDashboardView = ({ user }: { user: any }) => {
  const [upcomingReservations, setUpcomingReservations] = useState<any[]>([]);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  const [notifications, setNotifications] = useState<any[]>([]);

  // Room Service State
  const [roomServiceItems, setRoomServiceItems] = useState<any[]>([]);
  const [roomServiceLoading, setRoomServiceLoading] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState('');

  // Quick Services Dialog States
  const [isRoomServiceDialogOpen, setIsRoomServiceDialogOpen] = useState(false);
  const [isSpaDialogOpen, setIsSpaDialogOpen] = useState(false);
  const [isWifiDialogOpen, setIsWifiDialogOpen] = useState(false);
  const [isConciergeDialogOpen, setIsConciergeDialogOpen] = useState(false);

  // Spa State
  const [spaBooking, setSpaBooking] = useState({ service: '', date: '', time: '', notes: '' });
  const [spaSubmitting, setSpaSubmitting] = useState(false);

  // Concierge State
  const [conciergeMessage, setConciergeMessage] = useState('');
  const [conciergeRoomNumber, setConciergeRoomNumber] = useState('');
  const [conciergeSending, setConciergeSending] = useState(false);

  // Room Service Menu Items
  const menuItems = [
    { id: 1, name: 'Continental Breakfast', category: 'Breakfast', price: 25000, description: 'Coffee, tea, toast, jam, butter, fruits' },
    { id: 2, name: 'Full English Breakfast', category: 'Breakfast', price: 45000, description: 'Eggs, bacon, sausage, toast, tomatoes, mushrooms' },
    { id: 3, name: 'Chicken Caesar Salad', category: 'Lunch', price: 35000, description: 'Grilled chicken, romaine lettuce, parmesan, croutons' },
    { id: 4, name: 'Grilled Salmon', category: 'Lunch', price: 65000, description: 'Fresh salmon with vegetables and rice' },
    { id: 5, name: 'Beef Burger', category: 'Lunch', price: 40000, description: 'Angus beef patty with fries and salad' },
    { id: 6, name: 'Margherita Pizza', category: 'Dinner', price: 50000, description: 'Tomato sauce, mozzarella, basil' },
    { id: 7, name: 'Grilled Ribeye Steak', category: 'Dinner', price: 75000, description: '12oz ribeye with mashed potatoes and vegetables' },
    { id: 8, name: 'Chocolate Cake', category: 'Dessert', price: 20000, description: 'Rich chocolate cake with vanilla ice cream' },
    { id: 9, name: 'Fresh Juice', category: 'Beverages', price: 15000, description: 'Orange, apple, or pineapple juice' },
    { id: 10, name: 'Mineral Water', category: 'Beverages', price: 5000, description: 'Sparkling or still water' }
  ];

  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/guest/reservations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 403) {
        // Token expired - clear session and redirect
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.error("Your session has expired. Please log in again.");
        window.location.href = '/login';
        return;
      }
      if (response.ok) {
        const data = await response.json();
        setUpcomingReservations(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/guest/rooms/available');
      if (response.ok) {
        const data = await response.json();
        setAvailableRooms(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/guest/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 403) {
        // Token expired - clear session and redirect
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.error("Your session has expired. Please log in again.");
        window.location.href = '/login';
        return;
      }
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        // Show unread notifications as toasts
        data.filter((n: any) => !n.isRead).forEach((n: any) => {
          toast.success(n.message, {
            action: {
              label: 'Dismiss',
              onClick: () => markAsRead(n.id)
            }
          });
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/guest/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 403) {
        // Token expired - clear session and redirect
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.error("Your session has expired. Please log in again.");
        window.location.href = '/login';
        return;
      }
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReservations();
    fetchRooms();
    fetchNotifications();
  }, []);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkIn || !checkOut || !selectedRoomId) {
      toast.error("Please fill in all booking details.");
      return;
    }
    
    setBookingLoading(true);
    try {
      const token = localStorage.getItem('token');
      const selectedRoom = availableRooms.find(r => r.id.toString() === selectedRoomId);
      if (!selectedRoom) throw new Error("Room not found");
      
      const inDate = new Date(checkIn);
      const outDate = new Date(checkOut);
      const days = Math.ceil((outDate.getTime() - inDate.getTime()) / (1000 * 3600 * 24));
      
      if (days <= 0) throw new Error("Check-out must be after check-in");

      const totalAmount = days * selectedRoom.pricePerNight;

      const response = await fetch('/api/guest/book', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          roomId: selectedRoom.id,
          roomNumber: selectedRoom.number,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          totalAmount
        }),
      });

      if (!response.ok) {
        if (response.status === 403) {
          // Token expired or invalid - clear session and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          toast.error("Your session has expired. Please log in again.");
          // Redirect to login page
          window.location.href = '/login';
          return;
        }
        const errorData = await response.json().catch(() => ({ error: 'Booking failed' }));
        throw new Error(errorData.error || errorData.message || `Booking failed (${response.status})`);
      }
      
      toast.success("Room booked successfully! Awaiting admin approval.");
      setIsBookingOpen(false);
      fetchReservations();
      fetchRooms(); // refresh availability if we updated status (not done in the basic flow but good practice)
      
      // Reset form
      setCheckIn('');
      setCheckOut('');
      setSelectedRoomId('');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleRoomServiceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (roomServiceItems.length === 0) {
      toast.error("Please add at least one item to your order.");
      return;
    }
    
    setRoomServiceLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/guest/room-service', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          items: roomServiceItems,
          specialInstructions,
          estimatedDeliveryTime
        }),
      });

      if (response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.error("Your session has expired. Please log in again.");
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Order failed' }));
        throw new Error(errorData.error || errorData.message || `Order failed (${response.status})`);
      }
      
      toast.success("Room service order placed successfully! You'll be notified when it's ready.");
      setRoomServiceItems([]);
      setSpecialInstructions('');
      setEstimatedDeliveryTime('');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setRoomServiceLoading(false);
    }
  };

  const addToOrder = (item: any) => {
    const existingItem = roomServiceItems.find(i => i.id === item.id);
    if (existingItem) {
      setRoomServiceItems(roomServiceItems.map(i => 
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setRoomServiceItems([...roomServiceItems, { ...item, quantity: 1 }]);
    }
  };

  const removeFromOrder = (itemId: number) => {
    setRoomServiceItems(roomServiceItems.filter(i => i.id !== itemId));
  };

  const updateQuantity = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromOrder(itemId);
    } else {
      setRoomServiceItems(roomServiceItems.map(i => 
        i.id === itemId ? { ...i, quantity } : i
      ));
    }
  };

  const getTotalAmount = () => {
    return roomServiceItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <Card className="flex-1 border-none shadow-sm bg-hotel-blue text-white overflow-hidden relative" style={{ backgroundColor: '#002B45' }}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-hotel-gold/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          <CardHeader className="relative z-10">
            <CardTitle className="text-3xl font-serif text-hotel-sand">Welcome back, {user?.displayName?.split(' ')[0]}!</CardTitle>
            <CardDescription className="text-white/60">Your tropical escape awaits. How can we assist you today?</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10 flex gap-4 mt-4">
            <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
              <DialogTrigger asChild>
                <Button className="bg-hotel-gold text-hotel-blue hover:bg-hotel-gold/90 font-bold uppercase tracking-widest text-[10px] rounded-none">Book New Stay</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] rounded-none border-hotel-blue/10">
                <DialogHeader>
                  <DialogTitle className="font-serif text-2xl text-hotel-blue">Book a Room</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleBooking} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-hotel-blue/60 tracking-widest ml-1">Check-in Date</label>
                    <Input type="date" required value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="rounded-none h-12" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-hotel-blue/60 tracking-widest ml-1">Check-out Date</label>
                    <Input type="date" required value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="rounded-none h-12" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-hotel-blue/60 tracking-widest ml-1">Select Room</label>
                    <Select value={selectedRoomId} onValueChange={(v) => v && setSelectedRoomId(v)} required>
                      <SelectTrigger className="rounded-none h-12">
                        <SelectValue placeholder="Choose a room" />
                      </SelectTrigger>
                      <SelectContent className="rounded-none">
                        {availableRooms.length === 0 && <SelectItem value="none" disabled>No rooms available</SelectItem>}
                        {availableRooms.map((room) => (
                          <SelectItem key={room.id} value={room.id.toString()}>
                            Room {room.number} - {room.type} (UGX {room.pricePerNight})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" disabled={bookingLoading} className="w-full h-12 mt-4 bg-hotel-blue text-white rounded-none uppercase font-bold tracking-widest text-[10px]">
                    {bookingLoading ? "Processing..." : "Confirm Booking"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            
            {(() => {
              const activeReservation = upcomingReservations.find(r => r.status === 'checked-in' || r.status === 'confirmed');
              return (
                <>
                  {activeReservation ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-hotel-gold/40 text-hotel-gold bg-hotel-gold/10 hover:bg-hotel-gold hover:text-hotel-blue rounded-none uppercase text-[10px] tracking-widest font-bold">
                      <Utensils className="h-4 w-4 mr-2" /> Room Service
                    </Button>
                  </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] rounded-none border-hotel-blue/10 max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-serif text-2xl text-hotel-blue">Room Service Menu</DialogTitle>
                  <DialogDescription>
                    Order delicious meals and beverages delivered to your room
                    {(() => {
                      const activeReservation = upcomingReservations.find(r => r.status === 'checked-in' || r.status === 'confirmed');
                      return activeReservation ? (
                        <div className="mt-2 text-sm text-green-600 font-medium">
                          ✓ Active reservation in Room {activeReservation.roomNumber} ({activeReservation.status})
                        </div>
                      ) : (
                        <div className="mt-2 text-sm text-red-600 font-medium">
                          ⚠ No active reservation found. Please check-in first.
                        </div>
                      );
                    })()}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  {/* Menu Items */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-hotel-blue uppercase tracking-widest text-sm">Menu</h3>
                    {menuItems.map((item) => (
                      <Card key={item.id} className="border-none shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-bold text-hotel-blue">{item.name}</h4>
                              <p className="text-xs text-slate-500 uppercase tracking-wider">{item.category}</p>
                              <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-hotel-gold">UGX {item.price.toLocaleString()}</p>
                              <Button 
                                size="sm" 
                                onClick={() => addToOrder(item)}
                                className="mt-2 bg-hotel-blue hover:bg-hotel-blue/90 text-white rounded-none text-xs"
                              >
                                Add to Order
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  {/* Order Summary */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-hotel-blue uppercase tracking-widest text-sm">Your Order</h3>
                    {roomServiceItems.length === 0 ? (
                      <p className="text-slate-500 text-sm">No items added yet</p>
                    ) : (
                      <div className="space-y-2">
                        {roomServiceItems.map((item) => (
                          <div key={item.id} className="flex justify-between items-center p-2 border border-hotel-blue/10 rounded">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{item.name}</p>
                              <p className="text-xs text-slate-500">UGX {item.price.toLocaleString()} × {item.quantity}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="h-6 w-6 p-0 rounded-none"
                              >
                                -
                              </Button>
                              <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="h-6 w-6 p-0 rounded-none"
                              >
                                +
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => removeFromOrder(item.id)}
                                className="h-6 w-6 p-0 rounded-none text-red-500 hover:text-red-700"
                              >
                                ×
                              </Button>
                            </div>
                          </div>
                        ))}
                        <div className="border-t border-hotel-blue/10 pt-2 mt-4">
                          <p className="font-bold text-hotel-blue">Total: UGX {getTotalAmount().toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Special Instructions */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-hotel-blue">Special Instructions (Optional)</label>
                      <Input 
                        placeholder="Any special requests or dietary requirements..."
                        value={specialInstructions}
                        onChange={(e) => setSpecialInstructions(e.target.value)}
                        className="rounded-none"
                      />
                    </div>
                    
                    {/* Estimated Delivery Time */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-hotel-blue">Preferred Delivery Time (Optional)</label>
                      <Input 
                        type="time"
                        value={estimatedDeliveryTime}
                        onChange={(e) => setEstimatedDeliveryTime(e.target.value)}
                        className="rounded-none"
                      />
                    </div>
                    
                    <Button 
                      onClick={handleRoomServiceOrder} 
                      disabled={roomServiceLoading || roomServiceItems.length === 0 || !upcomingReservations.find(r => r.status === 'checked-in' || r.status === 'confirmed')}
                      className="w-full bg-hotel-blue hover:bg-hotel-blue/90 text-white rounded-none uppercase font-bold tracking-widest text-sm"
                    >
                      {roomServiceLoading ? "Placing Order..." : "Place Order"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="border-white/30 text-white/70 cursor-not-allowed rounded-none uppercase text-[10px] tracking-widest font-bold hover:bg-transparent hover:text-white/70"
                      disabled
                      title="You must have an active reservation to order room service"
                    >
                      <Utensils className="h-4 w-4 mr-2" /> Room Service
                    </Button>
                  )}
                </>
              );
            })()}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-hotel-gold/40 text-hotel-gold bg-hotel-gold/10 hover:bg-hotel-gold hover:text-hotel-blue rounded-none uppercase text-[10px] tracking-widest font-bold">📊 Track Orders</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto rounded-none">
                <DialogHeader>
                  <DialogTitle className="font-serif text-2xl text-hotel-blue">Room Service Order Tracking</DialogTitle>
                  <DialogDescription>
                    Track the progress of your room service orders in real-time
                  </DialogDescription>
                </DialogHeader>
                <RoomServiceTracker />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card className="w-full md:w-80 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-serif">Loyalty Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-xs font-bold text-hotel-gold uppercase tracking-widest">Gold Member</span>
              <span className="text-2xl font-bold text-hotel-blue">2,450 <span className="text-[10px] text-slate-400">pts</span></span>
            </div>
            <Progress value={65} className="h-2 bg-hotel-sand" />
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">550 points until Platinum status</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden">
          <CardHeader className="border-b border-hotel-blue/5 bg-hotel-sand/20">
            <CardTitle className="text-xl font-serif text-hotel-blue">Your Guest Reservation Card</CardTitle>
            <CardDescription>All your booking details in one place</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {upcomingReservations.length > 0 ? (
              upcomingReservations.map((res) => (
                <div key={res.id} className="divide-y divide-hotel-blue/5">
                  <div className="p-8 flex flex-col md:flex-row justify-between items-start gap-8">
                    <div className="flex gap-6 flex-1">
                      <div className="w-24 h-24 bg-hotel-blue flex flex-col items-center justify-center rounded-none text-white shrink-0 shadow-lg border-2 border-hotel-gold/20">
                        <Bed className="h-8 w-8 text-hotel-gold mb-1" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Room</span>
                        <span className="text-xl font-bold">{res.roomNumber}</span>
                      </div>
                      <div className="space-y-4 flex-1">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-2xl font-serif font-bold text-hotel-blue tracking-tight">Margarita Tropical Suite</h4>
                            <Badge className={`rounded-none border-none font-bold text-[10px] uppercase ${
                              res.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                              res.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {res.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-400 font-medium">Reservation ID: #HMS-{res.id.toString().padStart(5, '0')}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-6 py-4 border-y border-hotel-blue/5">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-hotel-gold tracking-widest block">Check In</span>
                            <div className="flex items-center gap-2 text-hotel-blue">
                              <CalendarIcon className="h-4 w-4 opacity-50" />
                              <span className="text-sm font-bold">{format(new Date(res.checkInDate), 'EEEE, MMM dd, yyyy')}</span>
                            </div>
                          </div>
                          <div className="space-y-1 border-l border-hotel-blue/5 pl-6">
                            <span className="text-[10px] uppercase font-bold text-hotel-gold tracking-widest block">Check Out</span>
                            <div className="flex items-center gap-2 text-hotel-blue">
                              <CalendarIcon className="h-4 w-4 opacity-50" />
                              <span className="text-sm font-bold">{format(new Date(res.checkOutDate), 'EEEE, MMM dd, yyyy')}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-8 items-center pt-2">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block mb-1">Daily Rate</span>
                            <span className="text-sm font-bold text-hotel-blue">UGX 250,000</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block mb-1">Stay Duration</span>
                            <span className="text-sm font-bold text-hotel-blue">
                              {Math.ceil((new Date(res.checkOutDate).getTime() - new Date(res.checkInDate).getTime()) / (1000 * 3600 * 24))} Days
                            </span>
                          </div>
                          <div className="ml-auto text-right">
                            <span className="text-[10px] uppercase font-bold text-hotel-gold tracking-widest block mb-1">Total Amount</span>
                            <span className="text-2xl font-bold text-hotel-blue">UGX {Number(res.totalAmount || 0).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 flex justify-end gap-3 px-8">
                    <Button 
                      variant="outline" 
                      className="h-10 rounded-none border-hotel-blue/10 text-hotel-blue text-[10px] uppercase font-bold tracking-widest"
                      onClick={() => downloadReceipt(res.id, `/api/guest/reservations/${res.id}/receipt`)}
                    >
                      <FileText className="h-4 w-4 mr-2" /> Download Receipt
                    </Button>
                    <Button className="h-10 bg-hotel-blue text-white rounded-none text-[10px] uppercase font-bold tracking-widest px-8">Manage Booking</Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-20 text-center space-y-4">
                <div className="w-16 h-16 bg-hotel-sand/30 rounded-full flex items-center justify-center mx-auto">
                  <CalendarIcon className="h-8 w-8 text-hotel-gold opacity-50" />
                </div>
                <div className="max-w-xs mx-auto">
                  <p className="text-hotel-blue font-bold">No upcoming stays found</p>
                  <p className="text-xs text-slate-400 mt-1">Ready for your next adventure? Book a room today and start planning your tropical escape.</p>
                </div>
                <Button onClick={() => setIsBookingOpen(true)} className="bg-hotel-gold text-hotel-blue hover:bg-hotel-gold/90 font-bold uppercase tracking-widest text-[10px] rounded-none mt-4">Start Booking</Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-serif">Quick Services</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-hotel-blue/5">
              {/* Order Room Service */}
              <Dialog open={isRoomServiceDialogOpen} onOpenChange={setIsRoomServiceDialogOpen}>
                {(() => {
                  const activeReservation = upcomingReservations.find(r => r.status === 'checked-in' || r.status === 'confirmed');
                  return activeReservation ? (
                    <DialogTrigger asChild>
                      <button className="w-full p-6 flex items-center gap-4 hover:bg-hotel-sand/50 transition-colors text-left group">
                        <div className="w-10 h-10 bg-hotel-sand flex items-center justify-center rounded-full group-hover:bg-hotel-gold transition-colors">
                          <Utensils className="h-5 w-5 text-hotel-blue group-hover:text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-hotel-blue">Order Room Service</p>
                          <p className="text-[10px] text-slate-400 uppercase font-medium">Browse our gourmet menu</p>
                        </div>
                        <ChevronRight className="h-4 w-4 ml-auto text-slate-300" />
                      </button>
                    </DialogTrigger>
                  ) : (
                    <button 
                      disabled
                      title="You must have an active reservation to order room service"
                      className="w-full p-6 flex items-center gap-4 text-left group opacity-50 cursor-not-allowed"
                      onClick={(e) => e.preventDefault()}
                    >
                      <div className="w-10 h-10 bg-hotel-sand/50 flex items-center justify-center rounded-full">
                        <Utensils className="h-5 w-5 text-hotel-blue/50" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-400">Order Room Service</p>
                        <p className="text-[10px] text-slate-400 uppercase font-medium">Active reservation required</p>
                      </div>
                      <ChevronRight className="h-4 w-4 ml-auto text-slate-300" />
                    </button>
                  );
                })()}
                <DialogContent className="sm:max-w-[600px] rounded-none border-hotel-blue/10 max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="font-serif text-2xl text-hotel-blue">Room Service Menu</DialogTitle>
                    <DialogDescription>Order delicious meals and beverages delivered to your room</DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                    <div className="space-y-4">
                      <h3 className="font-bold text-hotel-blue uppercase tracking-widest text-sm">Menu</h3>
                      {menuItems.map((item) => (
                        <Card key={item.id} className="border-none shadow-sm">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-bold text-hotel-blue">{item.name}</h4>
                                <p className="text-xs text-slate-500 uppercase tracking-wider">{item.category}</p>
                                <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-hotel-gold">UGX {item.price.toLocaleString()}</p>
                                <Button size="sm" onClick={() => addToOrder(item)} className="mt-2 bg-hotel-blue hover:bg-hotel-blue/90 text-white rounded-none text-xs">Add to Order</Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-bold text-hotel-blue uppercase tracking-widest text-sm">Your Order</h3>
                      {roomServiceItems.length === 0 ? (
                        <p className="text-slate-500 text-sm">No items added yet</p>
                      ) : (
                        <div className="space-y-2">
                          {roomServiceItems.map((item) => (
                            <div key={item.id} className="flex justify-between items-center p-2 border border-hotel-blue/10 rounded">
                              <div className="flex-1">
                                <p className="font-medium text-sm">{item.name}</p>
                                <p className="text-xs text-slate-500">UGX {item.price.toLocaleString()} × {item.quantity}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="h-6 w-6 p-0 rounded-none">-</Button>
                                <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                                <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="h-6 w-6 p-0 rounded-none">+</Button>
                                <Button size="sm" variant="outline" onClick={() => removeFromOrder(item.id)} className="h-6 w-6 p-0 rounded-none text-red-500 hover:text-red-700">×</Button>
                              </div>
                            </div>
                          ))}
                          <div className="border-t border-hotel-blue/10 pt-2 mt-4">
                            <p className="font-bold text-hotel-blue">Total: UGX {getTotalAmount().toLocaleString()}</p>
                          </div>
                        </div>
                      )}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-hotel-blue">Special Instructions (Optional)</label>
                        <Input placeholder="Any special requests..." value={specialInstructions} onChange={(e) => setSpecialInstructions(e.target.value)} className="rounded-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-hotel-blue">Preferred Delivery Time (Optional)</label>
                        <Input type="time" value={estimatedDeliveryTime} onChange={(e) => setEstimatedDeliveryTime(e.target.value)} className="rounded-none" />
                      </div>
                      <Button onClick={handleRoomServiceOrder} disabled={roomServiceLoading || roomServiceItems.length === 0} className="w-full bg-hotel-blue hover:bg-hotel-blue/90 text-white rounded-none uppercase font-bold tracking-widest text-sm">{roomServiceLoading ? "Placing Order..." : "Place Order"}</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Book Spa Session */}
              <Dialog open={isSpaDialogOpen} onOpenChange={setIsSpaDialogOpen}>
                <DialogTrigger asChild>
                  <button className="w-full p-6 flex items-center gap-4 hover:bg-hotel-sand/50 transition-colors text-left group">
                    <div className="w-10 h-10 bg-hotel-sand flex items-center justify-center rounded-full group-hover:bg-hotel-gold transition-colors">
                      <Spade className="h-5 w-5 text-hotel-blue group-hover:text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-hotel-blue">Book Spa Session</p>
                      <p className="text-[10px] text-slate-400 uppercase font-medium">Relax and rejuvenate</p>
                    </div>
                    <ChevronRight className="h-4 w-4 ml-auto text-slate-300" />
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] rounded-none border-hotel-blue/10">
                  <DialogHeader>
                    <DialogTitle className="font-serif text-2xl text-hotel-blue">Book Spa Session</DialogTitle>
                    <DialogDescription>Schedule a relaxing spa treatment during your stay</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    if (!spaBooking.service || !spaBooking.date || !spaBooking.time) return;
                    setSpaSubmitting(true);
                    try {
                      const token = localStorage.getItem('token');
                      const serviceLabels: Record<string, string> = {
                        massage: 'Swedish Massage (60 min)',
                        facial: 'Hydrating Facial (45 min)',
                        manicure: 'Deluxe Manicure',
                        pedicure: 'Deluxe Pedicure',
                        'body-scrub': 'Tropical Body Scrub'
                      };
                      const servicePrices: Record<string, number> = {
                        massage: 80000,
                        facial: 65000,
                        manicure: 35000,
                        pedicure: 45000,
                        'body-scrub': 70000
                      };
                      const response = await fetch('/api/guest/spa-bookings', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                          service: spaBooking.service,
                          serviceLabel: serviceLabels[spaBooking.service],
                          price: servicePrices[spaBooking.service],
                          bookingDate: spaBooking.date,
                          bookingTime: spaBooking.time,
                          notes: spaBooking.notes
                        })
                      });
                      if (!response.ok) {
                        const errorData = await response.json().catch(() => ({ error: 'Booking failed' }));
                        throw new Error(errorData.error || 'Failed to book spa session');
                      }
                      toast.success('Spa session booked! Our team will confirm shortly.');
                      setIsSpaDialogOpen(false);
                      setSpaBooking({ service: '', date: '', time: '', notes: '' });
                    } catch (err: any) {
                      toast.error(err.message || 'Failed to book spa session');
                    } finally {
                      setSpaSubmitting(false);
                    }
                  }} className="space-y-4 py-4">
                    <Select value={spaBooking.service} onValueChange={(v) => { if (v) setSpaBooking(p => ({ ...p, service: v as string })); }}>
                      <SelectTrigger className="rounded-none h-12"><SelectValue placeholder="Select a treatment" /></SelectTrigger>
                      <SelectContent className="rounded-none">
                        <SelectItem value="massage">Swedish Massage (60 min) — UGX 80,000</SelectItem>
                        <SelectItem value="facial">Hydrating Facial (45 min) — UGX 65,000</SelectItem>
                        <SelectItem value="manicure">Deluxe Manicure — UGX 35,000</SelectItem>
                        <SelectItem value="pedicure">Deluxe Pedicure — UGX 45,000</SelectItem>
                        <SelectItem value="body-scrub">Tropical Body Scrub — UGX 70,000</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input type="date" required className="rounded-none h-12" value={spaBooking.date} onChange={e => setSpaBooking(p => ({ ...p, date: e.target.value }))} />
                    <Input type="time" required className="rounded-none h-12" value={spaBooking.time} onChange={e => setSpaBooking(p => ({ ...p, time: e.target.value }))} />
                    <Input placeholder="Special requests or allergies..." className="rounded-none h-12" value={spaBooking.notes} onChange={e => setSpaBooking(p => ({ ...p, notes: e.target.value }))} />
                    <Button type="submit" disabled={spaSubmitting || !spaBooking.service || !spaBooking.date || !spaBooking.time} className="w-full h-12 bg-hotel-gold text-hotel-blue rounded-none uppercase font-bold tracking-widest text-[10px]">{spaSubmitting ? "Booking..." : "Book Session"}</Button>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Wi-Fi Access */}
              <Dialog open={isWifiDialogOpen} onOpenChange={setIsWifiDialogOpen}>
                <DialogTrigger asChild>
                  <button className="w-full p-6 flex items-center gap-4 hover:bg-hotel-sand/50 transition-colors text-left group">
                    <div className="w-10 h-10 bg-hotel-sand flex items-center justify-center rounded-full group-hover:bg-hotel-gold transition-colors">
                      <Wifi className="h-5 w-5 text-hotel-blue group-hover:text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-hotel-blue">Wi-Fi Access</p>
                      <p className="text-[10px] text-slate-400 uppercase font-medium">Get your connection codes</p>
                    </div>
                    <ChevronRight className="h-4 w-4 ml-auto text-slate-300" />
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[400px] rounded-none border-hotel-blue/10">
                  <DialogHeader>
                    <DialogTitle className="font-serif text-2xl text-hotel-blue">Wi-Fi Access</DialogTitle>
                    <DialogDescription>Connect to our high-speed internet</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="p-4 bg-hotel-sand/20 border border-hotel-blue/10 rounded-none space-y-3">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Network Name</p>
                        <p className="text-lg font-bold text-hotel-blue">Margarita-Guest</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Password</p>
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-bold text-hotel-blue">Tropical2025!</p>
                          <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText('Tropical2025!'); toast.success('Password copied to clipboard'); }} className="text-hotel-gold text-xs">Copy</Button>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 border border-hotel-blue/5 text-center">
                        <p className="text-2xl font-bold text-hotel-blue">500<span className="text-sm">Mbps</span></p>
                        <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">Speed</p>
                      </div>
                      <div className="p-3 border border-hotel-blue/5 text-center">
                        <p className="text-2xl font-bold text-hotel-blue">24/7</p>
                        <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">Support</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 text-center">Having trouble connecting? Contact reception or the IT support desk.</p>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Contact Concierge */}
              <Dialog open={isConciergeDialogOpen} onOpenChange={setIsConciergeDialogOpen}>
                <DialogTrigger asChild>
                  <button className="w-full p-6 flex items-center gap-4 hover:bg-hotel-sand/50 transition-colors text-left group">
                    <div className="w-10 h-10 bg-hotel-sand flex items-center justify-center rounded-full group-hover:bg-hotel-gold transition-colors">
                      <MessageSquare className="h-5 w-5 text-hotel-blue group-hover:text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-hotel-blue">Contact Concierge</p>
                      <p className="text-[10px] text-slate-400 uppercase font-medium">We are here to help</p>
                    </div>
                    <ChevronRight className="h-4 w-4 ml-auto text-slate-300" />
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] rounded-none border-hotel-blue/10">
                  <DialogHeader>
                    <DialogTitle className="font-serif text-2xl text-hotel-blue">Contact Concierge</DialogTitle>
                    <DialogDescription>Send a message to our concierge team</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    if (!conciergeMessage.trim()) return;
                    setConciergeSending(true);
                    try {
                      const token = localStorage.getItem('token');
                      const response = await fetch('/api/guest/concierge-messages', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                          message: conciergeMessage.trim(),
                          roomNumber: conciergeRoomNumber || ''
                        })
                      });
                      if (!response.ok) {
                        const errorData = await response.json().catch(() => ({ error: 'Failed to send message' }));
                        throw new Error(errorData.error || 'Failed to send message');
                      }
                      toast.success('Message sent to concierge! We will respond shortly.');
                      setIsConciergeDialogOpen(false);
                      setConciergeMessage('');
                      setConciergeRoomNumber('');
                    } catch (err: any) {
                      toast.error(err.message || 'Failed to send message');
                    } finally {
                      setConciergeSending(false);
                    }
                  }} className="space-y-4 py-4">
                    <div className="p-3 bg-hotel-sand/20 border border-hotel-blue/5 rounded-none">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Direct Line</p>
                      <p className="font-bold text-hotel-blue">+256 700 123 456</p>
                    </div>
                    <Input placeholder="Your name" className="rounded-none h-12" defaultValue={user?.displayName || ''} />
                    <Input placeholder="Room number (optional)" className="rounded-none h-12" value={conciergeRoomNumber} onChange={e => setConciergeRoomNumber(e.target.value)} />
                    <textarea placeholder="How can we assist you today?" required rows={4} className="w-full p-3 border border-hotel-blue/10 rounded-none text-sm focus:outline-none focus:ring-1 focus:ring-hotel-blue/20 resize-none" value={conciergeMessage} onChange={e => setConciergeMessage(e.target.value)} />
                    <Button type="submit" disabled={conciergeSending || !conciergeMessage.trim()} className="w-full h-12 bg-hotel-gold text-hotel-blue rounded-none uppercase font-bold tracking-widest text-[10px]">{conciergeSending ? "Sending..." : "Send Message"}</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// --- Main App Component ---

