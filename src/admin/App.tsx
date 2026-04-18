import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from '@/src/components/layout/Sidebar';
import { Header } from '@/src/components/layout/Header';
import { BottomNav } from '@/src/components/layout/BottomNav';
import { AdminDashboardView } from '@/src/admin/views/AdminDashboardView';
import { RoomsView } from '@/src/admin/views/RoomsView';
import { HousekeepingView } from '@/src/admin/views/HousekeepingView';
import { ReservationsView } from '@/src/admin/views/ReservationsView';
import { UsersView } from '@/src/admin/views/UsersView';
import { Clock } from 'lucide-react';
import { Toaster } from 'sonner';

export default function AdminApp({ user, profile, setIsAdminMode }: any) {
  const [activeTab, setActiveTab] = useState('home');
  const role = user?.email === 'stuartdonsms@gmail.com' ? 'admin' : (profile?.role || 'staff');

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <AdminDashboardView onSwitchToGuest={() => setIsAdminMode(false)} onSwitchToLanding={() => {}} />;
      case 'rooms': return <RoomsView />;
      case 'housekeeping': return <HousekeepingView />;
      case 'reservations': return <ReservationsView role={role} />;
      case 'users': return <UsersView />;
      default: return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-slate-300">
          <Clock className="h-20 w-20 mb-6 opacity-10" />
          <h3 className="text-2xl font-serif font-medium text-hotel-blue/40">Module Under Development</h3>
          <p className="text-xs uppercase tracking-widest font-bold mt-2">The {activeTab} module is coming soon</p>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-hotel-sand">
      <Toaster position="top-center" richColors />
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} role={role} />
      <main className="lg:ml-64 min-h-screen flex flex-col pb-20 lg:pb-0 overflow-x-hidden">
        <Header 
          title={activeTab === 'home' ? 'Dashboard' : activeTab} 
          user={{ ...(profile || {}), displayName: user.displayName, role, photoURL: user.photoURL }} 
          isAdminMode={true}
          setIsAdminMode={setIsAdminMode}
          isStaff={true}
        />
        <div className="p-4 md:p-8 flex-1 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
               {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} role={role} />
    </div>
  );
}
