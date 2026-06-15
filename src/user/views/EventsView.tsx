import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, MapPin, Plus, Send, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { toast } from 'sonner';
import { format } from 'date-fns';

interface HotelEvent {
  id: number;
  title: string;
  description: string;
  organizerName: string;
  date: string;
  location: string;
  status: string;
}

export const EventsView = () => {
  const [events, setEvents] = useState<HotelEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: ''
  });

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/guest/events', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      } else {
        toast.error("Failed to load events.");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Network error while loading events.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.location) {
      toast.error("Please fill in all required fields (Title, Date, Location).");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/guest/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit event request');
      }
      toast.success("Event request submitted! Awaiting admin approval.");
      setIsDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        date: '',
        location: ''
      });
      fetchEvents();
    } catch (error: any) {
      console.error("Error requesting event:", error);
      toast.error(error.message || "Failed to submit event request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge className="bg-green-100 text-green-800 rounded-none border-none font-bold uppercase text-[9px]">Scheduled</Badge>;
      case 'pending_approval':
        return <Badge className="bg-orange-100 text-orange-800 rounded-none border-none font-bold uppercase text-[9px]">Awaiting Approval</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 rounded-none border-none font-bold uppercase text-[9px]">Cancelled</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-800 rounded-none border-none font-bold uppercase text-[9px]">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-hotel-blue p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-serif text-hotel-sand">Hotel Events</h2>
          <p className="text-white/60 text-sm">Browse hotel events or request your own private gathering</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-hotel-gold hover:bg-hotel-gold/90 text-hotel-blue font-bold uppercase tracking-widest text-[10px] rounded-none">
              <Plus className="h-4 w-4 mr-2" /> Request Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] rounded-none border-hotel-blue/10 bg-white">
            <DialogHeader className="border-b border-hotel-blue/5 pb-4">
              <DialogTitle className="text-xl font-serif text-hotel-blue">Request Private Event</DialogTitle>
              <DialogDescription className="text-xs">Submit an event request for booking hotel venues or halls.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleRequestEvent} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-[10px] uppercase font-bold text-hotel-blue tracking-widest">Event Title *</Label>
                <Input 
                  id="title"
                  required
                  placeholder="e.g. Birthday Party, Conference"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="rounded-none border-hotel-blue/10 focus:border-hotel-gold h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-[10px] uppercase font-bold text-hotel-blue tracking-widest">Description</Label>
                <textarea 
                  id="description"
                  placeholder="Provide details about the event size, setup, and catering requirements..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full min-h-[100px] p-3 border border-hotel-blue/10 rounded-none text-sm focus:outline-none focus:border-hotel-gold resize-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-[10px] uppercase font-bold text-hotel-blue tracking-widest">Event Date *</Label>
                  <Input 
                    id="date"
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="rounded-none border-hotel-blue/10 focus:border-hotel-gold h-10 text-slate-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-[10px] uppercase font-bold text-hotel-blue tracking-widest">Location / Venue *</Label>
                  <select 
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full bg-white border border-hotel-blue/10 rounded-none h-10 px-3 text-sm focus:border-hotel-gold focus:outline-none focus:ring-0 cursor-pointer"
                    required
                  >
                    <option value="">Select Venue...</option>
                    <option value="Conference Hall A">Conference Hall A</option>
                    <option value="Conference Hall B">Conference Hall B</option>
                    <option value="Poolside Gardens">Poolside Gardens</option>
                    <option value="Beachside Terrace">Beachside Terrace</option>
                    <option value="Margarita Main Restaurant">Margarita Main Restaurant</option>
                  </select>
                </div>
              </div>
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
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-slate-400 font-medium">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400 font-medium italic">No events found.</div>
        ) : (
          events.map((event) => (
            <Card key={event.id} className="border-none shadow-sm flex flex-col justify-between overflow-hidden group">
              <div>
                <CardHeader className="bg-hotel-sand/20 border-b border-hotel-blue/5 pb-4">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    {getStatusBadge(event.status)}
                    <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      <User className="h-3 w-3" /> {event.organizerName}
                    </div>
                  </div>
                  <CardTitle className="font-serif text-lg text-hotel-blue group-hover:text-hotel-gold transition-colors duration-300">
                    {event.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <p className="text-xs text-slate-600 line-clamp-3">{event.description || 'No description provided.'}</p>
                  
                  <div className="space-y-2 pt-2 border-t border-hotel-blue/5">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <CalendarIcon className="h-4 w-4 text-hotel-gold shrink-0" />
                      <span className="font-semibold text-hotel-blue">
                        {format(new Date(event.date), 'MMMM dd, yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <MapPin className="h-4 w-4 text-hotel-gold shrink-0" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
