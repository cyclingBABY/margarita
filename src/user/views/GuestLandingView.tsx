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
import { AdminDashboardView } from '@/src/admin/views/AdminDashboardView';
import { GuestDashboardView } from '@/src/user/views/GuestDashboardView';
import { RoomsView } from '@/src/admin/views/RoomsView';

export const GuestLandingView = ({ activePage, setActivePage, onReturnToAdmin }: { activePage: string, setActivePage: (p: string) => void, onReturnToAdmin?: () => void }) => {
  const autoplayPlugin = React.useRef(Autoplay({ delay: 3000, stopOnInteraction: true }));
  const renderPage = () => {
    switch (activePage) {
      case 'home': return (
        <div className="space-y-0 -m-4 md:-m-8">
          {onReturnToAdmin && (
            <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60]">
              <Button 
                onClick={onReturnToAdmin}
                className="bg-hotel-gold hover:bg-hotel-gold/90 text-hotel-blue font-bold rounded-none px-8 h-12 shadow-2xl border border-white/20 uppercase tracking-[0.2em] text-[10px]"
              >
                Return to Admin Panel
              </Button>
            </div>
          )}
          {/* Hero Section */}
          <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=2070" 
                alt="Margarita Hotel" 
                className="w-full h-full object-cover brightness-50"
              />
            </div>
            
            <div className="relative z-10 text-center text-white px-4 max-w-4xl">
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-7xl font-serif font-bold mb-6 tracking-tight"
              >
                Luxury Reimagined. <br />
                <span className="text-hotel-gold italic">Your Escape Starts Here.</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-lg md:text-xl text-hotel-sand/80 font-light tracking-widest uppercase mb-10"
              >
                Experience the pinnacle of tropical sophistication
              </motion.p>
              
              {/* Quick Booking Bar */}
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/95 backdrop-blur-md p-2 rounded-none shadow-2xl flex flex-col md:flex-row items-center gap-2 max-w-5xl mx-auto"
              >
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2 w-full">
                  <div className="flex flex-col items-center md:items-start px-6 py-3 border-b md:border-b-0 md:border-r border-hotel-blue/5 text-center md:text-left w-full">
                    <label className="text-[10px] uppercase font-bold text-hotel-gold tracking-widest mb-1">Check In</label>
                    <input type="date" className="bg-transparent border-none text-hotel-blue font-medium focus:ring-0 w-full text-center md:text-left" defaultValue={format(new Date(), 'yyyy-MM-dd')} />
                  </div>
                  <div className="flex flex-col items-center md:items-start px-6 py-3 border-b md:border-b-0 md:border-r border-hotel-blue/5 text-center md:text-left w-full">
                    <label className="text-[10px] uppercase font-bold text-hotel-gold tracking-widest mb-1">Check Out</label>
                    <input type="date" className="bg-transparent border-none text-hotel-blue font-medium focus:ring-0 w-full text-center md:text-left" defaultValue={format(new Date(Date.now() + 86400000), 'yyyy-MM-dd')} />
                  </div>
                  <div className="flex flex-col items-center md:items-start px-6 py-3 text-center md:text-left w-full">
                    <label className="text-[10px] uppercase font-bold text-hotel-gold tracking-widest mb-1">Guests</label>
                    <select className="bg-transparent border-none text-hotel-blue font-medium focus:ring-0 w-full text-center md:text-left text-center-last md:text-left-last">
                      <option>2 Adults, 0 Children</option>
                      <option>1 Adult, 0 Children</option>
                      <option>2 Adults, 1 Child</option>
                      <option>2 Adults, 2 Children</option>
                    </select>
                  </div>
                </div>
                <Button className="bg-hotel-blue hover:bg-hotel-blue/90 text-white px-10 h-16 rounded-none font-bold uppercase tracking-widest text-xs w-full md:w-auto">
                  Check Availability
                </Button>
              </motion.div>
            </div>
          </section>

          {/* Amenities Snapshot */}
          <section className="py-20 bg-white px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-serif font-bold text-hotel-blue mb-4">World-Class Amenities</h2>
                <div className="w-20 h-1 bg-hotel-gold mx-auto"></div>
              </div>
              
              <Carousel 
                opts={{
                  align: "start",
                  loop: true,
                }}
                plugins={[autoplayPlugin.current]}
                className="w-full relative px-12"
              >
                <CarouselContent>
                  {[
                    { icon: Wifi, label: 'High-Speed Wi-Fi', desc: 'Stay connected anywhere', img: 'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?auto=format&fit=crop&q=80&w=800' },
                    { icon: Waves, label: 'Infinity Pool', desc: 'Overlooking the ocean', img: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=800' },
                    { icon: Spade, label: 'Luxury Spa', desc: 'Rejuvenate your soul', img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800' },
                    { icon: Utensils, label: 'Fine Dining', desc: 'Exquisite local flavors', img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800' },
                    { icon: Bed, label: 'Premium Bedding', desc: 'Sleep like a baby', img: 'https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?auto=format&fit=crop&q=80&w=800' },
                    { icon: Star, label: 'Concierge Services', desc: 'At your beck and call', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800' },
                  ].map((item, i) => (
                    <CarouselItem key={i} className="md:basis-1/2 lg:basis-1/4 pl-4 pt-4 pb-12">
                      <div className="flex flex-col items-center text-center group bg-white shadow-md hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden border border-hotel-blue/5 h-full">
                        <div className="w-full h-48 overflow-hidden relative">
                          <img src={item.img} alt={item.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg group-hover:bg-hotel-gold transition-colors duration-500 z-10">
                            <item.icon className="h-8 w-8 text-hotel-blue group-hover:text-white transition-colors duration-500" />
                          </div>
                        </div>
                        <div className="pt-12 pb-8 px-6 flex-1 flex flex-col justify-center">
                          <h3 className="font-serif font-bold text-xl text-hotel-blue mb-2">{item.label}</h3>
                          <p className="text-sm text-slate-500 font-light">{item.desc}</p>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="-left-4 md:-left-8 border-hotel-blue/10 bg-white hover:bg-hotel-sand" />
                <CarouselNext className="-right-4 md:-right-8 border-hotel-blue/10 bg-white hover:bg-hotel-sand" />
              </Carousel>
            </div>
          </section>

          {/* Featured Rooms */}
          <section className="py-20 bg-hotel-sand px-8 overflow-hidden">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row items-center md:items-end justify-between mb-12 text-center md:text-left gap-6 md:gap-0">
                <div>
                  <p className="text-hotel-gold font-bold uppercase tracking-[0.3em] text-[10px] mb-2">Exclusive Offers</p>
                  <h2 className="text-4xl font-serif font-bold text-hotel-blue">Featured Rooms</h2>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="rounded-full border-hotel-blue/10"><ChevronLeft className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" className="rounded-full border-hotel-blue/10"><ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { title: 'Presidential Suite', price: 'UGX 3,400,000', img: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=800', tag: 'VVIP' },
                  { title: 'Deluxe Ocean View', price: 'UGX 1,700,000', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800', tag: 'Best Seller' },
                  { title: 'Executive Suite', price: 'UGX 2,300,000', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800', tag: 'Luxury' },
                ].map((pkg, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ y: -10 }}
                    className="bg-white group cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-500"
                  >
                    <div className="relative h-64 overflow-hidden">
                      <img src={pkg.img} alt={pkg.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <Badge className="absolute top-4 right-4 bg-hotel-gold text-hotel-blue font-bold rounded-none border-none">{pkg.tag}</Badge>
                    </div>
                    <div className="p-8 text-center md:text-left">
                      <h3 className="font-serif font-bold text-2xl text-hotel-blue mb-2">{pkg.title}</h3>
                      <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
                        <p className="text-hotel-gold font-bold text-lg">{pkg.price}</p>
                        <Button variant="link" className="text-hotel-blue p-0 font-bold uppercase text-[10px] tracking-widest">Book Now <ChevronRight className="h-3 w-3 ml-1" /></Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Guest Feedback Snippets */}
          <section className="py-20 bg-hotel-blue text-white px-8">
            <div className="max-w-4xl mx-auto text-center">
              <Star className="h-10 w-10 text-hotel-gold mx-auto mb-8 fill-hotel-gold" />
              <Carousel className="w-full">
                <CarouselContent>
                  {[
                    { quote: "The most incredible stay of my life. The attention to detail is unmatched.", author: "Sarah Miller", role: "Business Traveler" },
                    { quote: "Margarita Hotel is a true gem. The staff treated us like royalty.", author: "James Bond", role: "Leisure Guest" },
                    { quote: "Exquisite dining and world-class spa. We will be back every year.", author: "Lara Croft", role: "Adventure Seeker" }
                  ].map((item, i) => (
                    <CarouselItem key={i}>
                      <div className="space-y-6">
                        <p className="text-3xl md:text-4xl font-serif font-light italic leading-relaxed">"{item.quote}"</p>
                        <div>
                          <p className="font-bold text-hotel-gold uppercase tracking-widest text-xs">{item.author}</p>
                          <p className="text-white/40 text-[10px] uppercase tracking-widest mt-1">{item.role}</p>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          </section>

          {/* Chat Widget */}
          <div className="fixed bottom-8 right-8 z-50">
            <Button className="w-14 h-14 rounded-full bg-hotel-blue hover:bg-hotel-blue/90 shadow-2xl flex items-center justify-center p-0">
              <MessageSquare className="h-6 w-6 text-white" />
            </Button>
          </div>
        </div>
      );
      case 'about': return <AboutView />;
      case 'gallery': return <GalleryView />;
      case 'blog': return <BlogView />;
      case 'contact': return <ContactView />;
      default: return null;
    }
  };

  return (
    <div className="space-y-0 -m-8">
      <PublicNavbar activePage={activePage} setActivePage={setActivePage} />
      <AnimatePresence mode="wait">
        <motion.div
          key={activePage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

