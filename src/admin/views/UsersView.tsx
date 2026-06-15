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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
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
import { PublicNavbar } from '@/src/components/layout/PublicNavbar';
import { AboutView } from '@/src/user/views/AboutView';
import { GalleryView } from '@/src/user/views/GalleryView';
import { BlogView } from '@/src/user/views/BlogView';
import { ContactView } from '@/src/user/views/ContactView';
import { GuestLandingView } from '@/src/user/views/GuestLandingView';
import { AdminDashboardView } from '@/src/admin/views/AdminDashboardView';
import { GuestDashboardView } from '@/src/user/views/GuestDashboardView';
import { RoomsView } from '@/src/admin/views/RoomsView';

export const UsersView = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // States for adding user
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    role: 'guest',
    phoneNumber: '',
    dateOfBirth: '',
    nationality: '',
    idType: 'National ID',
    idNumber: '',
    employeeId: '',
    department: '',
    emergencyContact: '',
    referralSource: '',
    accountStatus: 'Active'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.displayName || !formData.email || !formData.password || !formData.role) {
      toast.error("Please fill in all required fields (Name, Email, Password, Role).");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }
      toast.success("User created successfully!");
      setIsDialogOpen(false);
      // Reset form
      setFormData({
        displayName: '',
        email: '',
        password: '',
        role: 'guest',
        phoneNumber: '',
        dateOfBirth: '',
        nationality: '',
        idType: 'National ID',
        idNumber: '',
        employeeId: '',
        department: '',
        emergencyContact: '',
        referralSource: '',
        accountStatus: 'Active'
      });
      fetchUsers();
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast.error(error.message || "An error occurred while creating user.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (!response.ok) throw new Error('Failed to update role');
      toast.success(`Role updated to ${newRole}`);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update role");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user account?")) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete user');
      }
      toast.success("User deleted successfully!");
      fetchUsers();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(error.message || "Failed to delete user");
    }
  };

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b border-hotel-blue/5 pb-6">
        <div>
          <CardTitle className="text-2xl font-serif">User Management</CardTitle>
          <CardDescription>Manage user accounts and assign roles</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-hotel-gold hover:bg-hotel-gold/90 text-hotel-blue font-bold uppercase tracking-widest text-[10px] rounded-none">
              <UserPlus className="h-4 w-4 mr-2" /> Add New User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto rounded-none border-hotel-blue/10 bg-white">
            <DialogHeader className="border-b border-hotel-blue/5 pb-4">
              <DialogTitle className="text-xl font-serif text-hotel-blue">Add New User Account</DialogTitle>
              <DialogDescription className="text-xs">Create a new user with credentials and role assignment.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddUser} className="space-y-6 pt-4">
              {/* Account Credentials Section */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase font-bold text-hotel-gold tracking-widest border-b border-hotel-blue/5 pb-1">Authentication Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-[10px] uppercase font-bold text-hotel-blue tracking-widest">Display Name *</Label>
                    <Input 
                      id="displayName"
                      required
                      placeholder="e.g. John Doe"
                      value={formData.displayName}
                      onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                      className="rounded-none border-hotel-blue/10 focus:border-hotel-gold h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[10px] uppercase font-bold text-hotel-blue tracking-widest">Email Address *</Label>
                    <Input 
                      id="email"
                      type="email"
                      required
                      placeholder="e.g. johndoe@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="rounded-none border-hotel-blue/10 focus:border-hotel-gold h-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-[10px] uppercase font-bold text-hotel-blue tracking-widest">Password *</Label>
                    <div className="relative">
                      <Input 
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="rounded-none border-hotel-blue/10 focus:border-hotel-gold h-10 pr-10"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-hotel-blue cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-[10px] uppercase font-bold text-hotel-blue tracking-widest">Assign Role *</Label>
                    <select 
                      id="role"
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="w-full bg-white border border-hotel-blue/10 rounded-none h-10 px-3 text-sm focus:border-hotel-gold focus:outline-none focus:ring-0 cursor-pointer"
                    >
                      <option value="guest">Guest</option>
                      <option value="housekeeping">Housekeeping</option>
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Personal Details Section */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase font-bold text-hotel-gold tracking-widest border-b border-hotel-blue/5 pb-1">Personal Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-[10px] uppercase font-bold text-hotel-blue tracking-widest">Phone Number</Label>
                    <Input 
                      id="phoneNumber"
                      placeholder="e.g. +256700000000"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                      className="rounded-none border-hotel-blue/10 focus:border-hotel-gold h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-[10px] uppercase font-bold text-hotel-blue tracking-widest">Date of Birth</Label>
                    <Input 
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                      className="rounded-none border-hotel-blue/10 focus:border-hotel-gold h-10 text-slate-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nationality" className="text-[10px] uppercase font-bold text-hotel-blue tracking-widest">Nationality</Label>
                    <Input 
                      id="nationality"
                      placeholder="e.g. Ugandan"
                      value={formData.nationality}
                      onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                      className="rounded-none border-hotel-blue/10 focus:border-hotel-gold h-10"
                    />
                  </div>
                </div>
              </div>

              {/* Conditional Role-Specific Section */}
              {formData.role === 'guest' ? (
                <div className="space-y-4">
                  <h4 className="text-xs uppercase font-bold text-hotel-gold tracking-widest border-b border-hotel-blue/5 pb-1">Guest Identification</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="idType" className="text-[10px] uppercase font-bold text-hotel-blue tracking-widest">ID Type</Label>
                      <select 
                        id="idType"
                        value={formData.idType}
                        onChange={(e) => setFormData({...formData, idType: e.target.value})}
                        className="w-full bg-white border border-hotel-blue/10 rounded-none h-10 px-3 text-sm focus:border-hotel-gold focus:outline-none focus:ring-0 cursor-pointer"
                      >
                        <option value="National ID">National ID</option>
                        <option value="Passport">Passport</option>
                        <option value="Driver's License">Driver's License</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="idNumber" className="text-[10px] uppercase font-bold text-hotel-blue tracking-widest">ID Number</Label>
                      <Input 
                        id="idNumber"
                        placeholder="e.g. CM1234567890"
                        value={formData.idNumber}
                        onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                        className="rounded-none border-hotel-blue/10 focus:border-hotel-gold h-10"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="referralSource" className="text-[10px] uppercase font-bold text-hotel-blue tracking-widest">Referral Source</Label>
                      <Input 
                        id="referralSource"
                        placeholder="e.g. Booking.com, Google Search, Friend"
                        value={formData.referralSource}
                        onChange={(e) => setFormData({...formData, referralSource: e.target.value})}
                        className="rounded-none border-hotel-blue/10 focus:border-hotel-gold h-10"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h4 className="text-xs uppercase font-bold text-hotel-gold tracking-widest border-b border-hotel-blue/5 pb-1">Staff Employment Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="employeeId" className="text-[10px] uppercase font-bold text-hotel-blue tracking-widest">Employee ID</Label>
                      <Input 
                        id="employeeId"
                        placeholder="e.g. EMP-9823"
                        value={formData.employeeId}
                        onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                        className="rounded-none border-hotel-blue/10 focus:border-hotel-gold h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department" className="text-[10px] uppercase font-bold text-hotel-blue tracking-widest">Department</Label>
                      <select 
                        id="department"
                        value={formData.department}
                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                        className="w-full bg-white border border-hotel-blue/10 rounded-none h-10 px-3 text-sm focus:border-hotel-gold focus:outline-none focus:ring-0 cursor-pointer"
                      >
                        <option value="">Select Department...</option>
                        <option value="Management">Management</option>
                        <option value="Front Desk">Front Desk</option>
                        <option value="Housekeeping">Housekeeping</option>
                        <option value="Spa">Spa</option>
                        <option value="Food & Beverage">Food & Beverage</option>
                        <option value="Maintenance">Maintenance</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Status and Emergency Contact Section */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase font-bold text-hotel-gold tracking-widest border-b border-hotel-blue/5 pb-1">System / Emergency Info</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountStatus" className="text-[10px] uppercase font-bold text-hotel-blue tracking-widest">Account Status</Label>
                    <select 
                      id="accountStatus"
                      value={formData.accountStatus}
                      onChange={(e) => setFormData({...formData, accountStatus: e.target.value})}
                      className="w-full bg-white border border-hotel-blue/10 rounded-none h-10 px-3 text-sm focus:border-hotel-gold focus:outline-none focus:ring-0 cursor-pointer"
                    >
                      <option value="Active">Active</option>
                      <option value="Pending">Pending</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="emergencyContact" className="text-[10px] uppercase font-bold text-hotel-blue tracking-widest">Emergency Contact Info</Label>
                    <Input 
                      id="emergencyContact"
                      placeholder="e.g. Jane Doe (Spouse) - +256701234567"
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                      className="rounded-none border-hotel-blue/10 focus:border-hotel-gold h-10"
                    />
                  </div>
                </div>
              </div>

              {/* Dialog Footer Actions */}
              <DialogFooter className="border-t border-hotel-blue/5 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="rounded-none text-[10px] uppercase font-bold tracking-widest border-hotel-blue/10 hover:bg-hotel-sand/50 h-11"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-hotel-blue text-white hover:bg-hotel-blue/90 rounded-none text-[10px] uppercase font-bold tracking-widest h-11 px-6"
                >
                  {isSubmitting ? "Creating..." : "Create User"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-hotel-blue/5">
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-slate-400">User</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-slate-400">Email</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-slate-400">Role</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-slate-400">Joined</TableHead>
              <TableHead className="text-right font-bold uppercase text-[10px] tracking-widest text-slate-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-12 text-slate-400 font-medium">Loading users...</TableCell></TableRow>
            ) : users.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-12 text-slate-400 font-medium italic">No users found.</TableCell></TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.uid} className="hover:bg-hotel-sand/30 border-hotel-blue/5">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img 
                        src={u.photoURL || `https://ui-avatars.com/api/?name=${u.displayName || u.email}&background=random`} 
                        className="w-8 h-8 rounded-full" 
                        alt="" 
                      />
                      <span className="font-bold text-hotel-blue">{u.displayName || 'Unnamed User'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500 text-xs">{u.email}</TableCell>
                  <TableCell>
                    <select 
                      value={u.role} 
                      onChange={(e) => handleRoleChange(u.uid, e.target.value)}
                      className="bg-transparent border-none text-[10px] font-bold uppercase tracking-widest text-hotel-gold focus:ring-0 cursor-pointer"
                    >
                      <option value="admin">Admin</option>
                      <option value="staff">Staff</option>
                      <option value="housekeeping">Housekeeping</option>
                      <option value="guest">Guest</option>
                    </select>
                  </TableCell>
                  <TableCell className="text-slate-400 text-[10px] uppercase font-medium">
                    {u.createdAt ? format(new Date(u.createdAt), 'MMM dd, yyyy') : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      onClick={() => handleDeleteUser(u.uid)}
                      variant="ghost" 
                      size="sm" 
                      className="text-red-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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

