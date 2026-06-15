import React, { useState, useEffect } from 'react';
import { Star, Send, CheckCircle2, Utensils, BedDouble, MessageSquare } from 'lucide-react';
import { useAuth } from '@/src/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface EligibleService {
  type: string;
  id: string;
  title: string;
  description: string;
  date: string;
}

interface FeedbackItem {
  id: number;
  rating: number;
  comment: string;
  serviceType: string;
  createdAt: string;
}

export const FeedbackView = ({ user }: { user: any }) => {
  const { user: authUser } = useAuth();
  const [eligibleServices, setEligibleServices] = useState<EligibleService[]>([]);
  const [myFeedback, setMyFeedback] = useState<FeedbackItem[]>([]);
  const [selectedService, setSelectedService] = useState<EligibleService | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

  const fetchEligibleServices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/guest/feedback/eligible-services', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        // API may return either an array (pending) or an object { pending, debug }
        setEligibleServices(Array.isArray(data) ? data : (data?.pending || []));
      }

    } catch (err) {
      console.error('Error fetching eligible services:', err);
    }
  };

  const fetchMyFeedback = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/guest/feedback', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMyFeedback(data);
      }
    } catch (err) {
      console.error('Error fetching feedback:', err);
    }
  };

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || rating === 0 || !comment.trim()) {
      toast.error('Please select a service, give a rating, and write a comment.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/guest/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating,
          comment: comment.trim(),
          serviceType: selectedService.type,
          serviceId: selectedService.id
        })
      });

      if (response.ok) {
        toast.success('Thank you! Your feedback has been submitted.');
        setSelectedService(null);
        setRating(0);
        setComment('');
        fetchEligibleServices();
        fetchMyFeedback();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to submit feedback');
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEligibleServices();
    fetchMyFeedback();
  }, []);

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'room-service': return <Utensils className="h-5 w-5 text-hotel-gold" />;
      case 'reservation': return <BedDouble className="h-5 w-5 text-hotel-blue" />;
      default: return <MessageSquare className="h-5 w-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-hotel-blue p-6 text-white">
        <h2 className="text-2xl font-serif text-hotel-sand">Your Feedback</h2>
        <p className="text-white/60 text-sm">Rate and review services you've received</p>
      </div>

      <div className="flex gap-2">
        <Button
          variant={activeTab === 'pending' ? 'default' : 'outline'}
          onClick={() => setActiveTab('pending')}
          className={`rounded-none text-[10px] uppercase font-bold tracking-widest ${activeTab === 'pending' ? 'bg-hotel-gold text-hotel-blue' : ''}`}
        >
          Pending Review
        </Button>
        <Button
          variant={activeTab === 'history' ? 'default' : 'outline'}
          onClick={() => setActiveTab('history')}
          className={`rounded-none text-[10px] uppercase font-bold tracking-widest ${activeTab === 'history' ? 'bg-hotel-gold text-hotel-blue' : ''}`}
        >
          My Reviews
        </Button>
      </div>

      {activeTab === 'pending' && (
        <>
          {selectedService ? (
            <Card className="border-none shadow-sm">
              <CardHeader className="border-b border-hotel-blue/5 pb-4">
                <CardTitle className="text-lg font-serif flex items-center gap-2">
                  {getServiceIcon(selectedService.type)}
                  Review: {selectedService.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span>{selectedService.description}</span>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-hotel-blue/60 tracking-widest">Your Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-8 w-8 ${star <= rating ? 'text-hotel-gold fill-hotel-gold' : 'text-slate-200'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-hotel-blue/60 tracking-widest">Your Review</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us about your experience..."
                    className="w-full min-h-[120px] p-3 border border-hotel-blue/10 rounded-none text-sm focus:outline-none focus:border-hotel-gold resize-none"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => { setSelectedService(null); setRating(0); setComment(''); }}
                    variant="outline"
                    className="rounded-none text-[10px] uppercase font-bold tracking-widest"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={submitFeedback}
                    disabled={loading || rating === 0 || !comment.trim()}
                    className="bg-hotel-gold text-hotel-blue hover:bg-hotel-gold/90 rounded-none text-[10px] uppercase font-bold tracking-widest"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {loading ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-none shadow-sm">
              <CardHeader className="border-b border-hotel-blue/5 pb-4">
                <CardTitle className="text-lg font-serif">Services Ready for Review</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {eligibleServices.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 space-y-2">
                    <CheckCircle2 className="h-12 w-12 mx-auto opacity-20" />
                    <p className="text-sm">No services pending review.</p>
                    <p className="text-xs">Complete a stay or receive a room service delivery to leave feedback.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-hotel-blue/5">
                    {eligibleServices.map((service) => (
                      <button
                        key={`${service.type}-${service.id}`}
                        onClick={() => setSelectedService(service)}
                        className="w-full p-4 flex items-center gap-4 text-left hover:bg-hotel-sand/30 transition-colors"
                      >
                        <div className="w-10 h-10 bg-hotel-sand flex items-center justify-center rounded-full">
                          {getServiceIcon(service.type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-hotel-blue text-sm">{service.title}</h4>
                          <p className="text-xs text-slate-500">{service.description}</p>
                        </div>
                        <Badge className="rounded-none bg-hotel-blue text-white text-[10px]">Review</Badge>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {activeTab === 'history' && (
        <Card className="border-none shadow-sm">
          <CardHeader className="border-b border-hotel-blue/5 pb-4">
            <CardTitle className="text-lg font-serif">Your Submitted Reviews</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              {myFeedback.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <Star className="h-12 w-12 mx-auto opacity-20" />
                  <p className="text-sm">You haven't submitted any reviews yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-hotel-blue/5 p-4 space-y-4">
                  {myFeedback.map((item) => (
                    <div key={item.id} className="p-4 bg-hotel-sand/20">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${star <= item.rating ? 'text-hotel-gold fill-hotel-gold' : 'text-slate-200'}`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <Badge className="rounded-none text-[10px] mb-2 bg-white border-hotel-blue/10 text-hotel-blue">
                        {item.serviceType === 'general' ? 'General' : item.serviceType}
                      </Badge>
                      <p className="text-sm text-slate-600 italic">"{item.comment}"</p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
