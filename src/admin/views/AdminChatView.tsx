import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, User, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/src/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Message {
  id: number;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  readStatus: number;
}

interface ConversationPreview {
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  readStatus: number;
}

export const AdminChatView = () => {
  const { user: authUser } = useAuth();
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);
  const [selectedGuestName, setSelectedGuestName] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const adminId = authUser?.uid;

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/messages', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  };

  const fetchMessages = async (guestId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/messages/${guestId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
        // Mark unread guest messages as read
        data.forEach((msg: Message) => {
          if (msg.receiverId === adminId && msg.readStatus === 0) {
            markAsRead(msg.id);
          }
        });
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/admin/messages/${id}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedGuestId) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ guestId: selectedGuestId, content: newMessage.trim() })
      });

      if (response.ok) {
        setNewMessage('');
        await fetchMessages(selectedGuestId);
        await fetchConversations();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to send message');
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectGuest = (guestId: string, guestName: string) => {
    setSelectedGuestId(guestId);
    setSelectedGuestName(guestName);
    fetchMessages(guestId);
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(() => {
      fetchConversations();
      if (selectedGuestId) {
        fetchMessages(selectedGuestId);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedGuestId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Mobile back button
  const handleBack = () => {
    setSelectedGuestId(null);
    setMessages([]);
  };

  return (
    <div className="space-y-6">
      <div className="bg-hotel-blue p-6 text-white">
        <h2 className="text-2xl font-serif text-hotel-sand">Guest Messages</h2>
        <p className="text-white/60 text-sm">Manage guest conversations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <Card className={`border-none shadow-sm lg:col-span-1 ${selectedGuestId ? 'hidden lg:block' : 'block'}`}>
          <CardHeader className="border-b border-hotel-blue/5 pb-4">
            <CardTitle className="text-lg font-serif flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-hotel-gold" />
              Conversations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-slate-400 space-y-2 p-4">
                  <MessageCircle className="h-8 w-8 opacity-20" />
                  <p className="text-sm text-center">No conversations yet</p>
                </div>
              ) : (
                <div className="divide-y divide-hotel-blue/5">
                  {conversations.map((conv) => (
                    <button
                      key={conv.senderId}
                      onClick={() => selectGuest(conv.senderId, conv.senderName || 'Guest')}
                      className={`w-full p-4 flex items-start gap-3 text-left hover:bg-hotel-sand/30 transition-colors ${
                        selectedGuestId === conv.senderId ? 'bg-hotel-sand/50 border-l-2 border-hotel-gold' : ''
                      }`}
                    >
                      <div className="w-10 h-10 bg-hotel-blue/10 rounded-full flex items-center justify-center shrink-0">
                        <User className="h-5 w-5 text-hotel-blue" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-hotel-blue text-sm truncate">
                            {conv.senderName || 'Guest'}
                          </h4>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {new Date(conv.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-1">{conv.content}</p>
                        {conv.readStatus === 0 && conv.senderId !== 'admin' && (
                          <Badge className="mt-1 rounded-none bg-hotel-gold text-hotel-blue text-[10px]">New</Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Conversation Thread */}
        <Card className={`border-none shadow-sm lg:col-span-2 ${selectedGuestId ? 'block' : 'hidden lg:block'}`}>
          {selectedGuestId ? (
            <>
              <CardHeader className="border-b border-hotel-blue/5 pb-4 flex flex-row items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="lg:hidden p-0 h-8 w-8"
                  onClick={handleBack}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <CardTitle className="text-lg font-serif flex items-center gap-2">
                  <User className="h-5 w-5 text-hotel-gold" />
                  {selectedGuestName || 'Guest'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px] p-4" ref={scrollRef}>
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
                      <MessageCircle className="h-12 w-12 opacity-20" />
                      <p className="text-sm">No messages in this conversation</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg) => {
                        const isMe = msg.senderId === adminId;
                        return (
                          <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] px-4 py-2 rounded-lg ${
                              isMe 
                                ? 'bg-hotel-blue text-white rounded-br-none' 
                                : 'bg-hotel-sand text-hotel-blue rounded-bl-none'
                            }`}>
                              <p className="text-sm">{msg.content}</p>
                              <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <span className="text-[10px] opacity-60">
                                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {isMe && (
                                  <span className="text-[10px] opacity-60">
                                    {msg.readStatus ? '✓✓' : '✓'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>

                <div className="p-4 border-t border-hotel-blue/5">
                  <form onSubmit={sendMessage} className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={`Reply to ${selectedGuestName || 'Guest'}...`}
                      className="flex-1 rounded-none"
                      disabled={loading}
                    />
                    <Button 
                      type="submit" 
                      disabled={loading || !newMessage.trim()}
                      className="bg-hotel-gold text-hotel-blue hover:bg-hotel-gold/90 rounded-none"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[500px] text-slate-400 space-y-2">
              <MessageCircle className="h-16 w-16 opacity-10" />
              <p className="text-sm">Select a conversation to view messages</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
