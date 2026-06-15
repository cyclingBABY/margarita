import React, { useState, useEffect } from 'react';
import { Spade, Clock, Check, X, DollarSign, Tag } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';

interface SpaBooking {
  id: string;
  guestId: string;
  guestName: string;
  roomNumber: string;
  service: string;
  serviceLabel: string;
  price: number;
  bookingDate: string;
  bookingTime: string;
  notes: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

export const SpaBookingsView = ({ role }: { role: string }) => {
  const [bookings, setBookings] = useState<SpaBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [approveBookingId, setApproveBookingId] = useState<string | null>(null);
  const [approvePaymentStatus, setApprovePaymentStatus] = useState('pending');
  const isStaff = ['admin', 'staff'].includes(role);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/staff/spa-bookings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 403) { localStorage.clear(); window.location.href = '/login'; return; }
      const data = await response.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) { setBookings([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleStatusUpdate = async (id: string, newStatus: string, paymentStatus?: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/staff/spa-bookings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus, paymentStatus })
      });
      if (!res.ok) throw new Error('Failed to update status');
      toast.success(`Spa booking ${newStatus}`);
      fetchBookings();
    } catch (e: any) { toast.error(e.message); }
  };

  const handlePaymentStatusUpdate = async (id: string, paymentStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/staff/spa-bookings/${id}/payment-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ paymentStatus })
      });
      if (!res.ok) throw new Error('Failed to update payment status');
      toast.success(`Payment marked as ${paymentStatus}`);
      fetchBookings();
    } catch (e: any) { toast.error(e.message); }
  };

  const openApproveDialog = (id: string) => {
    setApproveBookingId(id);
    setApprovePaymentStatus('pending');
    setApproveDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!approveBookingId) return;
    await handleStatusUpdate(approveBookingId, 'confirmed', approvePaymentStatus);
    setApproveDialogOpen(false);
    setApproveBookingId(null);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      confirmed: 'bg-green-100 text-green-700',
      pending: 'bg-orange-100 text-orange-700',
      completed: 'bg-blue-100 text-blue-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return <Badge className={`${styles[status] || ''} hover:bg-transparent border-none rounded-none font-bold uppercase text-[10px]`}>{status}</Badge>;
  };

  const getPaymentStatusBadge = (ps?: string) => {
    if (ps === 'paid') return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none rounded-none font-bold uppercase text-[10px]"><DollarSign className="h-3 w-3 mr-1" /> Paid</Badge>;
    if (ps === 'refunded') return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-none rounded-none font-bold uppercase text-[10px]"><Check className="h-3 w-3 mr-1" /> Refunded</Badge>;
    return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none rounded-none font-bold uppercase text-[10px]"><Clock className="h-3 w-3 mr-1" /> Unpaid</Badge>;
  };

  const filteredBookings = filterStatus === 'all' ? bookings : bookings.filter(b => b.status === filterStatus);

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b border-hotel-blue/5 pb-6">
        <div>
          <CardTitle className="text-2xl font-serif flex items-center gap-2">
            <Spade className="h-6 w-6" /> Spa Bookings
          </CardTitle>
          <CardDescription>Manage guest spa appointments</CardDescription>
        </div>
        <Select value={filterStatus} onValueChange={(v) => v && setFilterStatus(v)}>
          <SelectTrigger className="w-40 rounded-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-none">
            <SelectItem value="all">All Bookings</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="p-6 bg-hotel-sand/20">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-hotel-blue/40">
            <Clock className="h-12 w-12 mb-4 animate-spin-slow opacity-20" />
            <p className="font-bold uppercase tracking-widest text-xs">Loading spa bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-hotel-blue/40">
            <Spade className="h-12 w-12 mb-4 opacity-20" />
            <p className="font-bold uppercase tracking-widest text-xs">No spa bookings found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBookings.map((booking) => (
              <motion.div key={booking.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group bg-white">
                  <div className={`h-2 w-full ${booking.status === 'confirmed' ? 'bg-green-500' : booking.status === 'pending' ? 'bg-orange-500' : booking.status === 'cancelled' ? 'bg-red-500' : 'bg-blue-500'}`} />
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-hotel-sand flex items-center justify-center text-hotel-blue font-bold text-lg">
                          <Spade className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-hotel-blue text-lg leading-none mb-1">{booking.guestName || 'Guest'}</h3>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium flex items-center gap-1">
                            <Tag className="h-3 w-3" /> {booking.serviceLabel}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        {getStatusBadge(booking.status)}
                        {getPaymentStatusBadge(booking.paymentStatus)}
                      </div>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="p-3 bg-hotel-sand/30 rounded-lg">
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Service</p>
                        <p className="font-bold text-hotel-blue">{booking.serviceLabel}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 border border-hotel-blue/5 rounded-lg">
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Date</p>
                          <p className="font-bold text-hotel-blue text-sm">{new Date(booking.bookingDate).toLocaleDateString()}</p>
                        </div>
                        <div className="p-3 border border-hotel-blue/5 rounded-lg">
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Time</p>
                          <p className="font-bold text-hotel-blue text-sm">{booking.bookingTime}</p>
                        </div>
                      </div>
                      {booking.roomNumber && (
                        <div className="p-3 border border-hotel-blue/5 rounded-lg">
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Room</p>
                          <p className="font-bold text-hotel-blue text-sm">{booking.roomNumber}</p>
                        </div>
                      )}
                      {booking.notes && (
                        <div className="p-3 border border-hotel-blue/5 rounded-lg">
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Notes</p>
                          <p className="text-sm text-hotel-blue">{booking.notes}</p>
                        </div>
                      )}
                      <div className="flex items-center justify-between p-3 bg-hotel-blue text-white rounded-lg">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-hotel-sand">Price</span>
                        <span className="font-bold text-lg text-hotel-gold">UGX {Number(booking.price || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end mt-4 pt-4 border-t border-hotel-blue/5 flex-wrap">
                      {role === 'admin' && booking.status === 'pending' && (
                        <>
                          <Button onClick={() => openApproveDialog(booking.id)} className="flex-1 bg-green-50 text-green-700 hover:bg-green-100 border-none rounded-md font-bold uppercase text-[10px] tracking-widest">
                            <Check className="h-4 w-4 mr-2" /> Approve
                          </Button>
                          <Button onClick={() => handleStatusUpdate(booking.id, 'cancelled')} className="flex-1 bg-red-50 text-red-700 hover:bg-red-100 border-none rounded-md font-bold uppercase text-[10px] tracking-widest">
                            <X className="h-4 w-4 mr-2" /> Reject
                          </Button>
                        </>
                      )}
                      {booking.status === 'confirmed' && (
                        <Button onClick={() => handleStatusUpdate(booking.id, 'completed')} className="flex-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border-none rounded-md font-bold uppercase text-[10px] tracking-widest">
                          <Check className="h-4 w-4 mr-2" /> Complete
                        </Button>
                      )}
                      {isStaff && booking.paymentStatus !== 'paid' && booking.status !== 'cancelled' && (
                        <Button onClick={() => handlePaymentStatusUpdate(booking.id, 'paid')} className="flex-1 bg-green-600 text-white hover:bg-green-700 border-none rounded-md font-bold uppercase text-[10px] tracking-widest">
                          <DollarSign className="h-4 w-4 mr-2" /> Mark Paid
                        </Button>
                      )}
                      {isStaff && booking.paymentStatus === 'paid' && (
                        <Button onClick={() => handlePaymentStatusUpdate(booking.id, 'pending')} variant="outline" className="flex-1 border-orange-200 text-orange-700 hover:bg-orange-50 rounded-md font-bold uppercase text-[10px] tracking-widest">
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

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Approve Spa Booking</DialogTitle>
            <DialogDescription>Select payment status before approving this booking.</DialogDescription>
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

