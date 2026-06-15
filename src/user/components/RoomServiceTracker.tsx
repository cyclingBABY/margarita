import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Check, 
  Truck, 
  AlertCircle, 
  X,
  ChefHat,
  Utensils
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

interface RoomServiceOrder {
  id: number;
  guestId: string;
  guestName: string;
  roomNumber: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  specialInstructions: string;
  estimatedDeliveryTime: string;
  createdAt: string;
  updatedAt: string;
}

const STATUS_STEPS = [
  { key: 'pending', label: 'Ordered', icon: Utensils },
  { key: 'preparing', label: 'Preparing', icon: ChefHat },
  { key: 'ready', label: 'Ready', icon: Check },
  { key: 'delivered', label: 'Delivered', icon: Truck }
];

export const RoomServiceTracker = () => {
  const [orders, setOrders] = useState<RoomServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<RoomServiceOrder | null>(null);

  // Fetch orders on component mount and set up polling
  useEffect(() => {
    fetchOrders();
    
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/guest/room-service', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) throw new Error('Failed to fetch orders');
      
      const data = await response.json();
      setOrders(data);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-700';
      case 'preparing':
        return 'bg-blue-100 text-blue-700';
      case 'ready':
        return 'bg-green-100 text-green-700';
      case 'delivered':
        return 'bg-emerald-100 text-emerald-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getProgressPercentage = (status: string) => {
    const statusIndex = STATUS_STEPS.findIndex(s => s.key === status);
    return statusIndex === -1 ? 0 : ((statusIndex + 1) / STATUS_STEPS.length) * 100;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-slate-500">Loading orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <Card className="w-full border-none shadow-sm">
        <CardHeader>
          <CardTitle className="font-serif text-2xl text-hotel-blue">Order History</CardTitle>
          <CardDescription>Your room service orders</CardDescription>
        </CardHeader>
        <CardContent className="p-8 text-center">
          <Utensils className="h-12 w-12 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">No orders yet. Order room service to see them here!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif font-bold text-hotel-blue">Order Tracking</h2>
        <button 
          onClick={fetchOrders}
          className="text-xs font-medium text-hotel-blue hover:text-hotel-blue/70 uppercase tracking-widest"
        >
          🔄 Refresh
        </button>
      </div>

      {orders.map((order) => (
        <Card 
          key={order.id} 
          className={`border-none shadow-sm cursor-pointer transition-all hover:shadow-md ${
            selectedOrder?.id === order.id ? 'ring-2 ring-hotel-blue' : ''
          }`}
          onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">
                  Order #{order.id.toString().padStart(5, '0')}
                </CardTitle>
                <CardDescription>
                  Room {order.roomNumber} • {formatDate(order.createdAt)} at {formatTime(order.createdAt)}
                </CardDescription>
              </div>
              <Badge className={`rounded-none font-bold ${getStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-hotel-blue">Order Progress</span>
                <span className="text-slate-500">{Math.round(getProgressPercentage(order.status))}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-hotel-gold to-hotel-blue transition-all duration-300"
                  style={{ width: `${getProgressPercentage(order.status)}%` }}
                />
              </div>
            </div>

            {/* Status Steps */}
            <div className="grid grid-cols-4 gap-2">
              {STATUS_STEPS.map((step, index) => {
                const currentStatusIndex = STATUS_STEPS.findIndex(s => s.key === order.status);
                const isCompleted = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                const Icon = step.icon;

                return (
                  <div key={step.key} className="flex flex-col items-center gap-1">
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isCompleted 
                          ? 'bg-hotel-blue text-white' 
                          : 'bg-slate-200 text-slate-400'
                      } ${isCurrent ? 'ring-2 ring-hotel-gold ring-offset-2' : ''}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-medium text-center text-slate-600 leading-tight">
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Order Details when expanded */}
            {selectedOrder?.id === order.id && (
              <div className="border-t border-hotel-blue/10 pt-4 mt-4 space-y-4 animate-in fade-in">
                {/* Items */}
                <div className="space-y-2">
                  <h4 className="font-bold text-hotel-blue uppercase tracking-widest text-xs">Items</h4>
                  <div className="space-y-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm p-2 bg-hotel-sand/10 rounded-none">
                        <span className="text-hotel-blue">{item.name} (x{item.quantity})</span>
                        <span className="font-medium text-hotel-blue">UGX {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total Amount */}
                <div className="flex justify-between items-center p-3 bg-hotel-blue/5 rounded-none border border-hotel-blue/10">
                  <span className="font-bold text-hotel-blue">Total Amount</span>
                  <span className="text-2xl font-bold text-hotel-blue">UGX {order.totalAmount.toLocaleString()}</span>
                </div>

                {/* Special Instructions */}
                {order.specialInstructions && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-none">
                    <p className="text-xs font-medium text-yellow-700 mb-1">Special Instructions</p>
                    <p className="text-sm text-yellow-800">{order.specialInstructions}</p>
                  </div>
                )}

                {/* Estimated Delivery */}
                {order.estimatedDeliveryTime && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-none">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-xs font-medium text-blue-700">Preferred Delivery Time</p>
                      <p className="text-sm text-blue-800">{order.estimatedDeliveryTime}</p>
                    </div>
                  </div>
                )}

                {/* Status Timeline */}
                <div className="space-y-2 pt-2 border-t border-hotel-blue/10">
                  <h4 className="font-bold text-hotel-blue uppercase tracking-widest text-xs">Timeline</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between text-slate-600">
                      <span>Order Placed</span>
                      <span className="font-medium">{formatTime(order.createdAt)}</span>
                    </div>
                    {order.updatedAt !== order.createdAt && (
                      <div className="flex justify-between text-slate-600">
                        <span>Last Updated</span>
                        <span className="font-medium">{formatTime(order.updatedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
