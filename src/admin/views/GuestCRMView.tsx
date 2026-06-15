import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, Star, ChevronRight, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

export const GuestCRMView = () => {
  const [guests, setGuests] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedGuest, setSelectedGuest] = useState<any>(null);
  const [guestHistory, setGuestHistory] = useState<any>(null);

  const fetchGuests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/guests', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setGuests(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchGuestHistory = async (guestId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/guests/${guestId}/history`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setGuestHistory(await res.json());
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchGuests(); }, []);

  const filteredGuests = guests.filter(g =>
    (g.displayName || '').toLowerCase().includes(search.toLowerCase()) ||
    (g.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (g.phoneNumber || '').includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif text-hotel-blue">Guest CRM</h2>
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search guests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-none h-12"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-serif">Guest List ({filteredGuests.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              <div className="divide-y divide-hotel-blue/5">
                {filteredGuests.map((g) => (
                  <button
                    key={g.uid}
                    onClick={() => { setSelectedGuest(g); fetchGuestHistory(g.uid); }}
                    className={`w-full p-4 flex items-center gap-3 text-left hover:bg-hotel-sand/30 transition-colors ${selectedGuest?.uid === g.uid ? 'bg-hotel-sand/50' : ''}`}
                  >
                    <div className="w-10 h-10 bg-hotel-blue/10 flex items-center justify-center rounded-full shrink-0">
                      <Users className="h-5 w-5 text-hotel-blue" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-hotel-blue truncate">{g.displayName || 'Guest'}</p>
                      <p className="text-xs text-slate-400 truncate">{g.email}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge className="rounded-none text-[10px]">{g.totalStays || 0} stays</Badge>
                      {g.activeStays > 0 && <Badge className="ml-1 bg-green-100 text-green-700 rounded-none text-[10px]">Active</Badge>}
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-serif">Guest Profile & History</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedGuest ? (
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-hotel-sand/20 border border-hotel-blue/5">
                  <div className="w-16 h-16 bg-hotel-blue flex items-center justify-center rounded-full text-white text-xl font-bold">
                    {(selectedGuest.displayName || 'G').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-hotel-blue">{selectedGuest.displayName || 'Guest'}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {selectedGuest.email}</span>
                      <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {selectedGuest.phoneNumber || 'N/A'}</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Badge className="rounded-none text-[10px]">Status: {selectedGuest.accountStatus}</Badge>
                      <Badge className="rounded-none text-[10px]">Member since {new Date(selectedGuest.createdAt).toLocaleDateString()}</Badge>
                    </div>
                  </div>
                </div>

                {guestHistory && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="p-3 border border-hotel-blue/5 text-center">
                        <p className="text-2xl font-bold text-hotel-blue">{guestHistory.reservations?.length || 0}</p>
                        <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">Reservations</p>
                      </div>
                      <div className="p-3 border border-hotel-blue/5 text-center">
                        <p className="text-2xl font-bold text-hotel-blue">{guestHistory.roomServiceOrders?.length || 0}</p>
                        <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">Room Service</p>
                      </div>
                      <div className="p-3 border border-hotel-blue/5 text-center">
                        <p className="text-2xl font-bold text-hotel-blue">{guestHistory.spaBookings?.length || 0}</p>
                        <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">Spa Bookings</p>
                      </div>
                      <div className="p-3 border border-hotel-blue/5 text-center">
                        <p className="text-2xl font-bold text-hotel-blue">{guestHistory.feedback?.length || 0}</p>
                        <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">Feedback</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-hotel-blue uppercase tracking-widest mb-2">Reservations</h4>
                      <div className="divide-y divide-hotel-blue/5 border border-hotel-blue/5">
                        {(guestHistory.reservations || []).map((r: any) => (
                          <div key={r.id} className="p-3 flex justify-between items-center">
                            <div>
                              <p className="text-sm font-medium">Room {r.roomNumber}</p>
                              <p className="text-xs text-slate-400">{new Date(r.checkInDate).toLocaleDateString()} - {new Date(r.checkOutDate).toLocaleDateString()}</p>
                            </div>
                            <Badge className={`rounded-none text-[10px] ${r.status === 'checked-in' ? 'bg-green-100 text-green-700' : r.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>{r.status}</Badge>
                          </div>
                        ))}
                        {(!guestHistory.reservations || guestHistory.reservations.length === 0) && <p className="p-3 text-sm text-slate-400">No reservations found.</p>}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-hotel-blue uppercase tracking-widest mb-2">Feedback</h4>
                      <div className="divide-y divide-hotel-blue/5 border border-hotel-blue/5">
                        {(guestHistory.feedback || []).map((f: any) => (
                          <div key={f.id} className="p-3">
                            <div className="flex items-center gap-1 mb-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-3 w-3 ${i < f.rating ? 'text-hotel-gold fill-hotel-gold' : 'text-slate-300'}`} />
                              ))}
                              <span className="text-xs text-slate-400 ml-2">{new Date(f.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-slate-600">{f.comment}</p>
                          </div>
                        ))}
                        {(!guestHistory.feedback || guestHistory.feedback.length === 0) && <p className="p-3 text-sm text-slate-400">No feedback yet.</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-slate-300">
                <Users className="h-16 w-16 mb-4 opacity-20" />
                <p className="text-lg font-medium">Select a guest to view their profile</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
