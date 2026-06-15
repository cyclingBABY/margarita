import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Users, Bed, Plus, Clock, Tag, Check, X, UserPlus, DollarSign, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Room, Reservation, UserProfile } from '@/src/types';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { downloadReceipt } from '@/src/utils/receipt';

export const ReservationsView = ({ role, onNewBooking }: { role: string, onNewBooking?: () => void }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [newReservation, setNewReservation] = useState({ guestId: '', guestName: '', roomId: '', roomNumber: '', checkInDate: '', checkOutDate: '', totalAmount: 0 });
  const [guestMode, setGuestMode] = useState<'existing' | 'new'>('existing');
  const [newUserForm, setNewUserForm] = useState({ displayName: '', email: '', phoneNumber: '', password: '', nationality: '', idType: '', idNumber: '' });
  const [creatingUser, setCreatingUser] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [approveReservationId, setApproveReservationId] = useState<string | null>(null);
  const [approvePaymentStatus, setApprovePaymentStatus] = useState('pending');
  const isStaff = ['admin', 'staff'].includes(role);

  const fetchReservations = async () => {
    try {
      const url = isStaff ? '/api/staff/reservations' : '/api/guest/reservations';
      const token = localStorage.getItem('token');
      const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` }, cache: 'no-store' });
      if (response.status === 403) { localStorage.clear(); window.location.href = '/login'; return; }
      const data = await response.json();
      setReservations(Array.isArray(data) ? data : []);
    } catch (error) { setReservations([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReservations(); if (role === 'admin') { fetchRooms(); fetchUsers(); } }, [isStaff, role]);

  const fetchRooms = async () => {
    try { const token = localStorage.getItem('token'); const res = await fetch('/api/housekeeping/rooms', { headers: { 'Authorization': `Bearer ${token}` } }); setRooms(await res.json()); } catch (e) { }
  };
  const fetchUsers = async () => {
    try { const token = localStorage.getItem('token'); const res = await fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } }); setUsers(await res.json()); } catch (e) { }
  };

  const handleAddReservation = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/staff/reservations', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(newReservation) });
      if (!res.ok) throw new Error('Failed to create reservation');
      toast.success('Reservation created successfully');
      setNewReservation({ guestId: '', guestName: '', roomId: '', roomNumber: '', checkInDate: '', checkOutDate: '', totalAmount: 0 });
      fetchReservations();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleCreateUser = async () => {
    if (!newUserForm.displayName || !newUserForm.email) { toast.error('Name and email are required'); return; }
    setCreatingUser(true);
    try {
      const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newUserForm, role: 'guest', accountStatus: 'Active' }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');
      toast.success('New guest created successfully');
      setNewReservation(p => ({ ...p, guestId: (data.user?.uid as string) || '', guestName: newUserForm.displayName }));
      setGuestMode('existing');
      setNewUserForm({ displayName: '', email: '', phoneNumber: '', password: '', nationality: '', idType: '', idNumber: '' });
      fetchUsers();
    } catch (e: any) { toast.error(e.message); }
    finally { setCreatingUser(false); }
  };

  const handleStatusUpdate = async (id: string, newStatus: string, paymentStatus?: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/staff/reservations/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ status: newStatus, paymentStatus }) });
      if (!res.ok) throw new Error('Failed to update status');
      toast.success(`Reservation ${newStatus}${newStatus === 'confirmed' ? '. Analytics synced' : ''}`); fetchReservations();
    } catch (e: any) { toast.error(e.message); }
  };

  const openApproveDialog = (id: string) => {
    setApproveReservationId(id);
    setApprovePaymentStatus('pending');
    setApproveDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!approveReservationId) return;
    await handleStatusUpdate(approveReservationId, 'confirmed', approvePaymentStatus);
    setApproveDialogOpen(false);
    setApproveReservationId(null);
  };

  const handlePaymentStatusUpdate = async (id: string, paymentStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/staff/reservations/${id}/payment-status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ paymentStatus }) });
      if (!res.ok) throw new Error('Failed to update payment status');
      toast.success(`Payment marked as ${paymentStatus}. Analytics synced.`); fetchReservations();
    } catch (e: any) { toast.error(e.message); }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = { confirmed: 'bg-green-100 text-green-700', pending: 'bg-orange-100 text-orange-700', 'checked-in': 'bg-blue-100 text-blue-700', 'checked-out': 'bg-slate-100 text-slate-700', cancelled: 'bg-red-100 text-red-700' };
    return <Badge className={`${styles[status] || ''} hover:bg-transparent border-none rounded-none font-bold uppercase text-[10px]`}>{status}</Badge>;
  };

  const getPaymentStatusBadge = (ps?: string) => {
    if (ps === 'paid') return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none rounded-none font-bold uppercase text-[10px]"><DollarSign className="h-3 w-3 mr-1" /> Paid</Badge>;
    if (ps === 'refunded') return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-none rounded-none font-bold uppercase text-[10px]"><Check className="h-3 w-3 mr-1" /> Refunded</Badge>;
    return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none rounded-none font-bold uppercase text-[10px]"><Clock className="h-3 w-3 mr-1" /> Unpaid</Badge>;
  };

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b border-hotel-blue/5 pb-6">
        <div>
          <CardTitle className="text-2xl font-serif">Reservations</CardTitle>
          <CardDescription>{isStaff ? 'Manage all guest bookings' : 'Your booking history'}</CardDescription>
        </div>
        <div className="flex gap-2">
          {role === 'admin' && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-hotel-gold hover:bg-hotel-gold/90 text-hotel-blue font-bold uppercase tracking-widest text-[10px] rounded-none">
                  <Plus className="h-4 w-4 mr-2" /> Add Reservation
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Reservation</DialogTitle>
                  <DialogDescription>Create a new reservation for a guest.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="flex gap-2 mb-2">
                    <Button type="button" variant={guestMode === 'existing' ? 'default' : 'outline'} onClick={() => setGuestMode('existing')} className={`flex-1 text-[10px] uppercase font-bold tracking-widest rounded-none ${guestMode === 'existing' ? 'bg-hotel-blue text-white' : 'border-hotel-blue/20 text-hotel-blue'}`}>
                      <Users className="h-3 w-3 mr-1" /> Existing Guest
                    </Button>
                    <Button type="button" variant={guestMode === 'new' ? 'default' : 'outline'} onClick={() => setGuestMode('new')} className={`flex-1 text-[10px] uppercase font-bold tracking-widest rounded-none ${guestMode === 'new' ? 'bg-hotel-blue text-white' : 'border-hotel-blue/20 text-hotel-blue'}`}>
                      <UserPlus className="h-3 w-3 mr-1" /> New Guest
                    </Button>
                  </div>

                  {guestMode === 'existing' ? (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">Guest</Label>
                      <Select onValueChange={(v) => { const u = users.find(x => x.uid === v); setNewReservation(p => ({ ...p, guestId: v || '', guestName: u?.displayName || '' })); }} value={newReservation.guestId}>
                        <SelectTrigger className="col-span-3"><SelectValue placeholder="Select a guest" /></SelectTrigger>
                        <SelectContent>{users.map(u => <SelectItem key={u.uid} value={u.uid}>{u.displayName} ({u.email})</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="space-y-3 border border-hotel-blue/10 p-4 bg-hotel-sand/10">
                      <p className="text-[10px] uppercase font-bold text-hotel-blue tracking-widest">Create New Guest</p>
                      <div className="grid grid-cols-2 gap-3">
                        <Input placeholder="Full Name *" value={newUserForm.displayName} onChange={e => setNewUserForm(p => ({ ...p, displayName: e.target.value }))} />
                        <Input placeholder="Email *" type="email" value={newUserForm.email} onChange={e => setNewUserForm(p => ({ ...p, email: e.target.value }))} />
                        <Input placeholder="Phone" value={newUserForm.phoneNumber} onChange={e => setNewUserForm(p => ({ ...p, phoneNumber: e.target.value }))} />
                        <Input placeholder="Password (optional)" type="password" value={newUserForm.password} onChange={e => setNewUserForm(p => ({ ...p, password: e.target.value }))} />
                        <Input placeholder="Nationality" value={newUserForm.nationality} onChange={e => setNewUserForm(p => ({ ...p, nationality: e.target.value }))} />
                        <Input placeholder="ID Type" value={newUserForm.idType} onChange={e => setNewUserForm(p => ({ ...p, idType: e.target.value }))} />
                        <Input placeholder="ID Number" value={newUserForm.idNumber} onChange={e => setNewUserForm(p => ({ ...p, idNumber: e.target.value }))} />
                      </div>
                      <Button onClick={handleCreateUser} disabled={creatingUser} className="w-full bg-hotel-gold hover:bg-hotel-gold/90 text-hotel-blue text-[10px] uppercase font-bold tracking-widest rounded-none">
                        {creatingUser ? 'Creating...' : 'Create Guest & Select'}
                      </Button>
                    </div>
                  )}

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Room</Label>
                    <Select onValueChange={(v) => { const r = rooms.find(x => x.id === v); setNewReservation(p => ({ ...p, roomId: v || '', roomNumber: r?.number || '' })); }} value={newReservation.roomId}>
                      <SelectTrigger className="col-span-3"><SelectValue placeholder="Select a room" /></SelectTrigger>
                      <SelectContent>{rooms.map(r => <SelectItem key={r.id} value={r.id}>Room {r.number} - {r.type}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Check In</Label>
                    <Input type="date" className="col-span-3" value={newReservation.checkInDate} onChange={e => setNewReservation(p => ({ ...p, checkInDate: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Check Out</Label>
                    <Input type="date" className="col-span-3" value={newReservation.checkOutDate} onChange={e => setNewReservation(p => ({ ...p, checkOutDate: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Amount</Label>
                    <Input type="number" className="col-span-3" value={newReservation.totalAmount} onChange={e => setNewReservation(p => ({ ...p, totalAmount: parseFloat(e.target.value) || 0 }))} />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleAddReservation} className="bg-hotel-gold hover:bg-hotel-gold/90 text-hotel-blue">Create Reservation</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          {!isStaff && (
            <Button onClick={onNewBooking} className="bg-hotel-gold hover:bg-hotel-gold/90 text-hotel-blue font-bold uppercase tracking-widest text-[10px] rounded-none">
              <Plus className="h-4 w-4 mr-2" /> New Booking
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6 bg-hotel-sand/20">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-hotel-blue/40">
            <Clock className="h-12 w-12 mb-4 animate-spin-slow opacity-20" />
            <p className="font-bold uppercase tracking-widest text-xs">Loading reservations...</p>
          </div>
        ) : reservations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-hotel-blue/40">
            <CalendarIcon className="h-12 w-12 mb-4 opacity-20" />
            <p className="font-bold uppercase tracking-widest text-xs">No reservations found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reservations.map((res) => (
              <motion.div key={res.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group bg-white">
                  <div className={`h-2 w-full ${res.status === 'confirmed' ? 'bg-green-500' : res.status === 'pending' ? 'bg-orange-500' : res.status === 'cancelled' ? 'bg-red-500' : 'bg-hotel-gold'}`} />
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-hotel-sand flex items-center justify-center text-hotel-blue font-bold text-lg">
                          {res.guestName ? res.guestName.charAt(0).toUpperCase() : 'G'}
                        </div>
                        <div>
                          <h3 className="font-bold text-hotel-blue text-lg leading-none mb-1">{res.guestName || 'Guest'}</h3>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium flex items-center gap-1">
                            <Tag className="h-3 w-3" /> ID: {res.guestId?.substring(0, 8) || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        {getStatusBadge(res.status)}
                        {getPaymentStatusBadge(res.paymentStatus)}
                      </div>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="flex items-center gap-3 p-3 bg-hotel-sand/30 rounded-lg">
                        <Bed className="h-5 w-5 text-hotel-gold" />
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Room</p>
                          <p className="font-bold text-hotel-blue">Room {res.roomNumber}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 border border-hotel-blue/5 rounded-lg">
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 flex items-center gap-1"><CalendarIcon className="h-3 w-3" /> Check In</p>
                          <p className="font-bold text-hotel-blue text-sm">{format(new Date(res.checkInDate), 'MMM dd, yyyy')}</p>
                        </div>
                        <div className="p-3 border border-hotel-blue/5 rounded-lg">
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 flex items-center gap-1"><CalendarIcon className="h-3 w-3" /> Check Out</p>
                          <p className="font-bold text-hotel-blue text-sm">{format(new Date(res.checkOutDate), 'MMM dd, yyyy')}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-hotel-blue text-white rounded-lg">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-hotel-sand">Total Amount</span>
                        <span className="font-bold text-lg text-hotel-gold">UGX {Number(res.totalAmount || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end mt-4 pt-4 border-t border-hotel-blue/5 flex-wrap">
                      {role === 'admin' && res.status === 'pending' && (
                        <>
                          <Button onClick={() => openApproveDialog(res.id)} className="flex-1 bg-green-50 text-green-700 hover:bg-green-100 border-none rounded-md font-bold uppercase text-[10px] tracking-widest">
                            <Check className="h-4 w-4 mr-2" /> Approve
                          </Button>
                          <Button onClick={() => handleStatusUpdate(res.id, 'cancelled')} className="flex-1 bg-red-50 text-red-700 hover:bg-red-100 border-none rounded-md font-bold uppercase text-[10px] tracking-widest">
                            <X className="h-4 w-4 mr-2" /> Reject
                          </Button>
                        </>
                      )}
                      {isStaff && res.paymentStatus !== 'paid' && res.status !== 'cancelled' && (
                        <Button onClick={() => handlePaymentStatusUpdate(res.id, 'paid')} className="flex-1 bg-green-600 text-white hover:bg-green-700 border-none rounded-md font-bold uppercase text-[10px] tracking-widest">
                          <DollarSign className="h-4 w-4 mr-2" /> Mark Paid
                        </Button>
                      )}
                      {isStaff && res.paymentStatus === 'paid' && (
                        <Button onClick={() => handlePaymentStatusUpdate(res.id, 'pending')} variant="outline" className="flex-1 border-orange-200 text-orange-700 hover:bg-orange-50 rounded-md font-bold uppercase text-[10px] tracking-widest">
                          <Clock className="h-4 w-4 mr-2" /> Mark Unpaid
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-hotel-blue hover:bg-hotel-sand" onClick={() => downloadReceipt(res.id, `/api/staff/reservations/${res.id}/receipt`)} title="Download Receipt">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Approve Reservation</DialogTitle>
            <DialogDescription>Select payment status before approving this reservation.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-hotel-blue tracking-widest">Payment Status</Label>
              <Select value={approvePaymentStatus} onValueChange={(v) => v && setApprovePaymentStatus(v)}>
                <SelectTrigger className="rounded-none h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-3 bg-hotel-sand/20 border border-hotel-blue/10 rounded-none">
              <p className="text-xs text-slate-500">
                An invoice will be auto-generated with status: <strong className="text-hotel-blue">{approvePaymentStatus}</strong>
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)} className="flex-1 rounded-none text-[10px] uppercase font-bold tracking-widest">Cancel</Button>
            <Button onClick={handleApprove} className="flex-1 bg-green-600 text-white hover:bg-green-700 rounded-none text-[10px] uppercase font-bold tracking-widest">
              <Check className="h-4 w-4 mr-2" /> Confirm Approve
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

