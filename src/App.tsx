import AdminApp from '@/src/admin/App';
import UserApp from '@/src/user/App';
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
// import { auth, db, handleFirestoreError, OperationType } from '@/src/firebase';
// import { 
//   signInWithPopup, 
//   GoogleAuthProvider, 
//   signOut,
//   signInWithEmailAndPassword,
//   createUserWithEmailAndPassword,
//   updateProfile
// } from 'firebase/auth';
// import { collection, query, onSnapshot, addDoc, updateDoc, setDoc, deleteDoc, doc, serverTimestamp, where, orderBy, limit } from 'firebase/firestore';
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
import { RoomsView } from '@/src/admin/views/RoomsView';

export default function App() {
  const { user, profile, loading, isAuthReady, setSession } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [activePage, setActivePage] = useState('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(true);

  // New Guest Info State
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [nationality, setNationality] = useState('');
  const [idType, setIdType] = useState('Passport');
  const [idNumber, setIdNumber] = useState('');

  const handleGoogleLogin = async () => {
    toast.info("Google login is currently disabled as we transition to SQL Auth. Please use your email.");
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setAuthLoading(true);
      if (isSignUp) {
        if (!fullName || !phoneNumber || !dateOfBirth || !nationality || !idNumber) {
          toast.error("Please fill in all required fields");
          setAuthLoading(false);
          return;
        }

        // Save Additional Info to SQL Database via PHP
        const regResponse = await fetch('http://localhost/margarita/api/register.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            displayName: fullName,
            phoneNumber,
            dateOfBirth,
            nationality,
            idType,
            idNumber,
            role: 'guest',
            password
          })
        });

        if (!regResponse.ok) {
          const errorData = await regResponse.json();
          throw new Error(errorData.error || "Failed to create account");
        }

        const regData = await regResponse.json();
        setSession(regData.token, regData.user);
        toast.success("Account created successfully!");
      } else {
        // Login to SQL backend via PHP
        const loginResponse = await fetch('http://localhost/margarita/api/login.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        if (!loginResponse.ok) {
          const errorData = await loginResponse.json();
          throw new Error(errorData.error || "Login failed");
        }

        const loginData = await loginResponse.json();
        setSession(loginData.token, loginData.user);
        toast.success("Logged in successfully!");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error(error.message || "Authentication failed");
    } finally {
      setAuthLoading(false);
    }
  };

  if (!isAuthReady || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-hotel-sand">
        <div className="flex flex-col items-center gap-6">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-hotel-gold border-t-transparent rounded-full shadow-xl"
          />
          <div className="text-center">
            <h2 className="font-serif text-2xl font-bold text-hotel-blue tracking-widest">MARGARITA</h2>
            <p className="text-hotel-gold text-[10px] uppercase tracking-[0.4em] font-bold mt-1">Luxury Reimagined</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-hotel-sand relative overflow-hidden">
        <Toaster position="top-center" richColors />
        <PublicNavbar activePage={activePage} setActivePage={setActivePage} />
        
        <AnimatePresence mode="wait">
          {activePage === 'home' ? (
            <motion.div 
              key="login"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex items-center justify-center relative bg-hotel-blue min-h-screen"
            >
              {/* Background Accents */}
              <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-hotel-gold rounded-full blur-[150px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-400 rounded-full blur-[150px]" />
              </div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full mx-4 sm:mx-auto bg-white/95 backdrop-blur-xl rounded-none shadow-2xl p-6 md:p-12 z-10 border border-white/20"
              >
                <div className="flex flex-col items-center text-center mb-12">
                  <div className="bg-hotel-gold p-5 rounded-none shadow-xl mb-8">
                    <Hotel className="h-12 w-12 text-hotel-blue" />
                  </div>
                  <h1 className="text-4xl font-serif font-bold text-hotel-blue tracking-tight">MARGARITA</h1>
                  <p className="text-hotel-gold text-[10px] uppercase tracking-[0.5em] font-bold mt-2">Hotel Management System</p>
                </div>

                <div className="space-y-6">
                  <form onSubmit={handleEmailAuth} className="space-y-4">
                    {isSignUp && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold text-hotel-blue/60 tracking-widest ml-1">Full Name</label>
                          <Input 
                            placeholder="John Doe" 
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="h-12 rounded-none border-hotel-blue/10 focus:border-hotel-gold focus:ring-hotel-gold"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold text-hotel-blue/60 tracking-widest ml-1">Phone Number</label>
                          <Input 
                            placeholder="+256 700 000000" 
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="h-12 rounded-none border-hotel-blue/10 focus:border-hotel-gold focus:ring-hotel-gold"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold text-hotel-blue/60 tracking-widest ml-1">Date of Birth</label>
                          <Input 
                            type="date" 
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                            className="h-12 rounded-none border-hotel-blue/10 focus:border-hotel-gold focus:ring-hotel-gold"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold text-hotel-blue/60 tracking-widest ml-1">Nationality</label>
                          <Input 
                            placeholder="Ugandan" 
                            value={nationality}
                            onChange={(e) => setNationality(e.target.value)}
                            className="h-12 rounded-none border-hotel-blue/10 focus:border-hotel-gold focus:ring-hotel-gold"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold text-hotel-blue/60 tracking-widest ml-1">ID Type</label>
                          <select 
                            value={idType}
                            onChange={(e) => setIdType(e.target.value)}
                            className="w-full h-12 rounded-none border border-hotel-blue/10 focus:border-hotel-gold focus:ring-hotel-gold bg-white px-3 text-sm"
                            required
                          >
                            <option value="Passport">Passport</option>
                            <option value="National ID">National ID</option>
                            <option value="Driver's License">Driver's License</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold text-hotel-blue/60 tracking-widest ml-1">ID Number</label>
                          <Input 
                            placeholder="ID Number" 
                            value={idNumber}
                            onChange={(e) => setIdNumber(e.target.value)}
                            className="h-12 rounded-none border-hotel-blue/10 focus:border-hotel-gold focus:ring-hotel-gold"
                            required
                          />
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-hotel-blue/60 tracking-widest ml-1">Email Address</label>
                      <Input 
                        type="email" 
                        placeholder="your@email.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 rounded-none border-hotel-blue/10 focus:border-hotel-gold focus:ring-hotel-gold"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-hotel-blue/60 tracking-widest ml-1">Password</label>
                      <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="••••••••" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-12 rounded-none border-hotel-blue/10 focus:border-hotel-gold focus:ring-hotel-gold pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-hotel-blue"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <Button 
                      type="submit"
                      disabled={authLoading}
                      className="w-full h-14 bg-hotel-blue hover:bg-hotel-blue/90 text-white font-bold rounded-none uppercase tracking-widest text-xs shadow-lg mt-2"
                    >
                      {authLoading ? "Processing..." : (isSignUp ? "Create Account" : "Sign In")}
                    </Button>
                  </form>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase font-bold">
                      <span className="bg-white px-4 text-hotel-blue/40 tracking-widest">Or continue with</span>
                    </div>
                  </div>

                  <Button 
                    onClick={handleGoogleLogin}
                    variant="outline"
                    disabled={authLoading}
                    className="w-full h-14 border-hotel-blue/10 hover:bg-hotel-sand text-hotel-blue font-bold rounded-none flex items-center justify-center gap-4 uppercase tracking-widest text-xs"
                  >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                    Google Account
                  </Button>

                  <div className="text-center mt-4">
                    <button 
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="text-[10px] uppercase font-bold text-hotel-gold hover:text-hotel-blue transition-colors tracking-widest"
                    >
                      {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key={activePage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1"
            >
              {activePage === 'welcome' && <GuestLandingView activePage="home" setActivePage={setActivePage} />}
              {activePage === 'about' && <AboutView />}
              {activePage === 'gallery' && <GalleryView />}
              {activePage === 'blog' && <BlogView />}
              {activePage === 'contact' && <ContactView />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  const role = user?.email === 'stuartdonsms@gmail.com' ? 'admin' : (profile?.role || 'guest');
  const isStaff = ['admin', 'staff', 'housekeeping'].includes(role);
  const effectiveIsStaff = isStaff && isAdminMode;

  if (effectiveIsStaff) {
    return <AdminApp user={user} profile={profile} setIsAdminMode={setIsAdminMode} />;
  }

  return <UserApp user={user} profile={profile} isStaff={isStaff} setIsAdminMode={setIsAdminMode} />;
}
