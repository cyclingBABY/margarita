import React from 'react';
import { 
  Hotel, 
  Calendar as CalendarIcon, 
  MessageSquare, 
  BarChart3, 
  Star,
  Utensils,
  CreditCard,
  Menu,
  Spade
} from 'lucide-react';

export const BottomNav = ({ activeTab, setActiveTab, role }: { activeTab: string, setActiveTab: (t: string) => void, role: string }) => {
  const isStaff = ['admin', 'staff', 'housekeeping'].includes(role);
  
  const menuItems = [
    { id: 'home', label: isStaff ? 'Admin' : 'Dashboard', icon: Hotel, roles: ['admin', 'staff', 'housekeeping', 'guest'] },
    { id: 'reservations', label: 'Book', icon: CalendarIcon, roles: ['admin', 'staff', 'guest'] },
    { id: 'room-service', label: 'Service', icon: Utensils, roles: ['admin', 'staff'] },
    { id: 'spa-bookings', label: 'Spa', icon: Spade, roles: ['admin', 'staff'] },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, roles: ['admin', 'staff'] },
    { id: 'billing', label: 'Billing', icon: CreditCard, roles: ['admin', 'staff'] },
    { id: 'messages', label: 'Chat', icon: MessageSquare, roles: ['admin', 'staff', 'guest'] },
    { id: 'feedback', label: 'Feedback', icon: Star, roles: ['admin', 'staff', 'guest'] },
    { id: 'settings', label: 'More', icon: Menu, roles: ['admin', 'staff', 'guest'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(role));

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-hotel-blue text-white h-16 flex items-center justify-around z-50 border-t border-white/10 px-2">
      {filteredItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${
            activeTab === item.id ? 'text-hotel-gold font-semibold' : 'text-white/70'
          }`}
        >
          <item.icon className="h-5 w-5" />
          <span className="text-[10px] uppercase tracking-tighter font-medium">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

