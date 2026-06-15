import React, { useState, useEffect } from 'react';
import { Bell, Send, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

export const NotificationsView = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [guests, setGuests] = useState<any[]>([]);
  const [selectedGuest, setSelectedGuest] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/notifications', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setNotifications(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchGuests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/guests', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setGuests(await res.json());
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchNotifications();
    fetchGuests();
  }, []);

  const sendNotification = async () => {
    if (!selectedGuest || !message.trim()) {
      toast.error('Please select a guest and enter a message.');
      return;
    }
    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ guestId: selectedGuest, message: message.trim() })
      });
      if (!res.ok) throw new Error('Failed to send notification');
      toast.success('Notification sent successfully!');
      setMessage('');
      fetchNotifications();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-serif flex items-center gap-2">
              <Bell className="h-5 w-5 text-hotel-gold" />
              Send Notification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block mb-2">Select Guest</label>
              <select
                value={selectedGuest}
                onChange={(e) => setSelectedGuest(e.target.value)}
                className="w-full h-12 border border-hotel-blue/10 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-hotel-blue/20 rounded-none"
              >
                <option value="">Choose a guest...</option>
                {guests.map((g) => (
                  <option key={g.uid} value={g.uid}>{g.displayName || g.email} ({g.totalStays || 0} stays)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block mb-2">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your notification message..."
                rows={5}
                className="w-full p-3 border border-hotel-blue/10 text-sm focus:outline-none focus:ring-1 focus:ring-hotel-blue/20 resize-none rounded-none"
              />
            </div>
            <Button
              onClick={sendNotification}
              disabled={sending || !selectedGuest || !message.trim()}
              className="w-full h-12 bg-hotel-gold text-hotel-blue rounded-none uppercase font-bold tracking-widest text-[10px]"
            >
              <Send className="h-4 w-4 mr-2" />
              {sending ? 'Sending...' : 'Send Notification'}
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-serif">Notification History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <div className="divide-y divide-hotel-blue/5">
                {notifications.length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-sm">No notifications sent yet.</div>
                )}
                {notifications.map((n) => (
                  <div key={n.id} className="p-4 flex items-start gap-4 hover:bg-hotel-sand/30 transition-colors">
                    <div className="w-8 h-8 bg-hotel-blue/10 flex items-center justify-center rounded-full shrink-0">
                      <User className="h-4 w-4 text-hotel-blue" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-bold text-hotel-blue truncate">{n.guestName || 'Guest'}</p>
                        <span className="text-[10px] text-slate-400 uppercase whitespace-nowrap">{new Date(n.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-slate-600">{n.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-none font-bold uppercase ${n.isRead ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                          {n.isRead ? 'Read' : 'Unread'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
