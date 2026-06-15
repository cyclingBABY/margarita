import React, { useState, useEffect } from 'react';
import { CreditCard, Search, CheckCircle2, XCircle, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface Invoice {
  id: number;
  reservationId: string;
  guestId: string;
  guestName?: string;
  roomNumber?: string;
  checkInDate?: string;
  checkOutDate?: string;
  amount: number;
  status: string;
  issueDate: string;
  dueDate: string;
}

export const BillingView = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/invoices', {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setInvoices(data);
      } else {
        toast.error('Failed to load invoices');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error fetching invoices');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/invoices/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        toast.success(`Invoice marked as ${newStatus}`);
        fetchInvoices();
      } else {
        toast.error('Failed to update invoice');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      (inv.guestName || '').toLowerCase().includes(search.toLowerCase()) ||
      String(inv.roomNumber || '').includes(search) ||
      String(inv.id).includes(search);
    const matchesStatus = statusFilter === null || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.amount), 0);
  const totalUnpaid = invoices.filter(i => i.status === 'unpaid').reduce((s, i) => s + Number(i.amount), 0);
  const totalInvoices = invoices.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif text-hotel-blue">Billing & Invoices</h2>
          <p className="text-sm text-slate-400">Payment tracking and receipt management</p>
        </div>
        <Button
          onClick={fetchInvoices}
          variant="outline"
          className="rounded-none border-hotel-blue/10 text-[10px] uppercase font-bold tracking-widest"
        >
          Refresh
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Total Invoices</p>
                <h3 className="text-3xl font-bold text-hotel-blue">{totalInvoices}</h3>
              </div>
              <div className="bg-hotel-sand p-3 rounded-xl">
                <FileText className="h-6 w-6 text-hotel-blue" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Collected</p>
                <h3 className="text-3xl font-bold text-green-700">UGX {totalPaid.toLocaleString()}</h3>
              </div>
              <div className="bg-green-50 p-3 rounded-xl">
                <CheckCircle2 className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Outstanding</p>
                <h3 className="text-3xl font-bold text-orange-700">UGX {totalUnpaid.toLocaleString()}</h3>
              </div>
              <div className="bg-orange-50 p-3 rounded-xl">
                <XCircle className="h-6 w-6 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by guest, room number, or invoice ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-none h-12"
          />
        </div>
        <Tabs
          value={statusFilter ?? 'all'}
          onValueChange={(val) => setStatusFilter(val === 'all' ? null : val)}
          className="w-auto"
        >
          <TabsList className="rounded-none h-12 bg-hotel-sand/30">
            <TabsTrigger value="all" className="rounded-none text-[10px] uppercase font-bold tracking-widest data-[state=active]:bg-hotel-gold data-[state=active]:text-hotel-blue">
              All ({invoices.length})
            </TabsTrigger>
            <TabsTrigger value="paid" className="rounded-none text-[10px] uppercase font-bold tracking-widest data-[state=active]:bg-green-100 data-[state=active]:text-green-700">
              Paid ({invoices.filter(i => i.status === 'paid').length})
            </TabsTrigger>
            <TabsTrigger value="unpaid" className="rounded-none text-[10px] uppercase font-bold tracking-widest data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700">
              Unpaid ({invoices.filter(i => i.status === 'unpaid').length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Invoices Table */}
      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b border-hotel-blue/5 pb-6">
          <div>
            <CardTitle className="text-xl font-serif">
              {statusFilter === 'paid' ? 'Paid Invoices' : statusFilter === 'unpaid' ? 'Unpaid Invoices' : 'All Invoices'}
            </CardTitle>
            <p className="text-sm text-slate-400">{filteredInvoices.length} result{filteredInvoices.length !== 1 ? 's' : ''}</p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            {loading ? (
              <div className="p-8 text-center text-slate-400">Loading invoices...</div>
            ) : filteredInvoices.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <FileText className="h-12 w-12 mx-auto opacity-20" />
                <p className="text-sm">No invoices found.</p>
                <p className="text-xs">Invoices will appear here once created.</p>
              </div>
            ) : (
              <div className="divide-y divide-hotel-blue/5">
                {filteredInvoices.map((inv) => (
                  <div key={inv.id} className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-hotel-sand/20 transition-colors">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-hotel-sand flex items-center justify-center rounded-full shrink-0">
                        <CreditCard className="h-6 w-6 text-hotel-blue" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-hotel-blue">Invoice #{inv.id}</h4>
                          <Badge className={`rounded-none text-[10px] ${
                            inv.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                          }`}>
                            {inv.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {inv.guestName || 'Guest'} • Room {inv.roomNumber || 'N/A'} • {new Date(inv.issueDate).toLocaleDateString()}
                        </p>
                        {inv.checkInDate && inv.checkOutDate && (
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Stay: {new Date(inv.checkInDate).toLocaleDateString()} — {new Date(inv.checkOutDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-lg font-bold text-hotel-blue">UGX {Number(inv.amount).toLocaleString()}</p>
                        <p className="text-[10px] text-slate-400">Due: {new Date(inv.dueDate).toLocaleDateString()}</p>
                      </div>
                      {inv.status === 'unpaid' && (
                        <Button
                          onClick={() => updateStatus(inv.id, 'paid')}
                          size="sm"
                          className="bg-green-600 text-white hover:bg-green-700 rounded-none text-[10px] uppercase font-bold tracking-widest"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Mark Paid
                        </Button>
                      )}
                      {inv.status === 'paid' && (
                        <Button
                          onClick={() => updateStatus(inv.id, 'unpaid')}
                          size="sm"
                          variant="outline"
                          className="rounded-none text-[10px] uppercase font-bold tracking-widest border-orange-200 text-orange-700 hover:bg-orange-50"
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Mark Unpaid
                        </Button>
                      )}
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
