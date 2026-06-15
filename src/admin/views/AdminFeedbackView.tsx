import React, { useState, useEffect } from 'react';
import { Star, Search, Filter, MessageSquare, BarChart3, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface FeedbackItem {
  id: number;
  guestId: string;
  guestName: string;
  guestDisplayName?: string;
  rating: number;
  comment: string;
  serviceType: string;
  serviceId: string | null;
  createdAt: string;
}

export const AdminFeedbackView = () => {
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/feedback', {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setFeedbackList(data);
        }
      } else {
        toast.error('Failed to load feedback');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error fetching feedback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const serviceTypes = Array.from(new Set(feedbackList.map(f => f.serviceType || 'general')));

  const filteredFeedback = feedbackList.filter((f) => {
    const matchesSearch =
      (f.guestDisplayName || f.guestName || '').toLowerCase().includes(search.toLowerCase()) ||
      (f.comment || '').toLowerCase().includes(search.toLowerCase()) ||
      (f.serviceType || '').toLowerCase().includes(search.toLowerCase());
    const matchesRating = filterRating === null || f.rating === filterRating;
    const matchesType = filterType === null || (f.serviceType || 'general') === filterType;
    return matchesSearch && matchesRating && matchesType;
  });

  const totalFeedback = feedbackList.length;
  const averageRating = totalFeedback
    ? (feedbackList.reduce((sum, f) => sum + f.rating, 0) / totalFeedback).toFixed(1)
    : '0.0';

  const ratingCounts = [5, 4, 3, 2, 1].map((r) => ({
    rating: r,
    count: feedbackList.filter((f) => f.rating === r).length,
    percent: totalFeedback ? Math.round((feedbackList.filter((f) => f.rating === r).length / totalFeedback) * 100) : 0
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif text-hotel-blue">Guest Feedback</h2>
          <p className="text-sm text-slate-400">Manage and review all guest feedback submissions</p>
        </div>
        <Button
          onClick={fetchFeedback}
          variant="outline"
          className="rounded-none border-hotel-blue/10 text-[10px] uppercase font-bold tracking-widest"
        >
          Refresh
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Total Reviews</p>
                <h3 className="text-3xl font-bold text-hotel-blue">{totalFeedback}</h3>
              </div>
              <div className="bg-hotel-sand p-3 rounded-xl">
                <MessageSquare className="h-6 w-6 text-hotel-blue" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Average Rating</p>
                <h3 className="text-3xl font-bold text-hotel-blue">{averageRating}</h3>
              </div>
              <div className="bg-hotel-sand p-3 rounded-xl">
                <Star className="h-6 w-6 text-hotel-gold fill-hotel-gold" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm md:col-span-2">
          <CardContent className="p-6">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-3">Rating Breakdown</p>
            <div className="space-y-2">
              {ratingCounts.map((rc) => (
                <div key={rc.rating} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-hotel-blue w-3">{rc.rating}</span>
                  <Star className="h-3 w-3 text-hotel-gold fill-hotel-gold" />
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-hotel-gold rounded-full transition-all"
                      style={{ width: `${rc.percent}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 w-6 text-right">{rc.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by guest, comment, or service type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-none h-12"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filterRating === null ? 'default' : 'outline'}
            onClick={() => setFilterRating(null)}
            className={`rounded-none text-[10px] uppercase font-bold tracking-widest ${filterRating === null ? 'bg-hotel-gold text-hotel-blue' : ''}`}
          >
            All Stars
          </Button>
          {[5, 4, 3, 2, 1].map((r) => (
            <Button
              key={r}
              variant={filterRating === r ? 'default' : 'outline'}
              onClick={() => setFilterRating(filterRating === r ? null : r)}
              className={`rounded-none text-[10px] uppercase font-bold tracking-widest ${filterRating === r ? 'bg-hotel-gold text-hotel-blue' : ''}`}
            >
              {r} <Star className="h-3 w-3 ml-1" />
            </Button>
          ))}
        </div>
      </div>

      {/* Service Type Filters */}
      {serviceTypes.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filterType === null ? 'default' : 'outline'}
            onClick={() => setFilterType(null)}
            className={`rounded-none text-[10px] uppercase font-bold tracking-widest ${filterType === null ? 'bg-hotel-blue text-white' : ''}`}
          >
            All Types
          </Button>
          {serviceTypes.map((type) => (
            <Button
              key={type}
              variant={filterType === type ? 'default' : 'outline'}
              onClick={() => setFilterType(filterType === type ? null : type)}
              className={`rounded-none text-[10px] uppercase font-bold tracking-widest ${filterType === type ? 'bg-hotel-blue text-white' : ''}`}
            >
              {type}
            </Button>
          ))}
        </div>
      )}

      {/* Feedback List */}
      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b border-hotel-blue/5 pb-6">
          <div>
            <CardTitle className="text-xl font-serif">All Feedback</CardTitle>
            <p className="text-sm text-slate-400">{filteredFeedback.length} result{filteredFeedback.length !== 1 ? 's' : ''}</p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            {loading ? (
              <div className="p-8 text-center text-slate-400">Loading feedback...</div>
            ) : filteredFeedback.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <MessageSquare className="h-12 w-12 mx-auto opacity-20" />
                <p className="text-sm">No feedback found.</p>
                <p className="text-xs">Feedback submitted by guests will appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-hotel-blue/5">
                {filteredFeedback.map((feedback) => (
                  <div key={feedback.id} className="p-6 flex gap-4 hover:bg-hotel-sand/20 transition-colors">
                    <img
                      src={`https://ui-avatars.com/api/?name=${feedback.guestDisplayName || feedback.guestName || 'Guest'}&background=random`}
                      className="w-12 h-12 rounded-full"
                      alt=""
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-hotel-blue">
                            {feedback.guestDisplayName || feedback.guestName || 'Guest'}
                          </h4>
                          <Badge className="rounded-none text-[10px] bg-white border-hotel-blue/10 text-hotel-blue">
                            {feedback.serviceType || 'general'}
                          </Badge>
                        </div>
                        <span className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(feedback.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex gap-0.5 mb-2">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star
                            key={j}
                            className={`h-4 w-4 ${j < feedback.rating ? 'text-hotel-gold fill-hotel-gold' : 'text-slate-200'}`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-slate-600 italic">"{feedback.comment}"</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

