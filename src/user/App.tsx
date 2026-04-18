import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from '@/src/components/layout/Sidebar';
import { Header } from '@/src/components/layout/Header';
import { BottomNav } from '@/src/components/layout/BottomNav';
import { GuestDashboardView } from '@/src/user/views/GuestDashboardView';
import { GuestLandingView } from '@/src/user/views/GuestLandingView';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster } from 'sonner';

export default function UserApp({ user, profile, isStaff, setIsAdminMode }: any) {
  const [activeTab, setActiveTab] = useState('home');
  const role = profile?.role || 'guest';

  const renderContent = () => {
    if (activeTab === 'home') {
      return (
        <div className="space-y-6">
          {isStaff && (
            <div className="bg-hotel-gold/10 p-4 border border-hotel-gold/20 flex items-center justify-between">
              <p className="text-xs font-bold text-hotel-blue uppercase tracking-widest">You are viewing as a Guest</p>
              <Button onClick={() => setIsAdminMode(true)} variant="outline" size="sm" className="h-8 rounded-none border-hotel-blue/20 text-[10px] uppercase font-bold">Return to Admin Panel</Button>
            </div>
          )}
          <GuestDashboardView user={profile || user} />
        </div>
      );
    }
    
    if (activeTab === 'welcome') {
        return <GuestLandingView activePage="welcome" setActivePage={() => {}} onReturnToAdmin={isStaff ? () => { setIsAdminMode(true); setActiveTab('home'); } : undefined} />;
    }
    
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-slate-300">
           <Clock className="h-20 w-20 mb-6 opacity-10" />
           <h3 className="text-2xl font-serif font-medium text-hotel-blue/40">Module Under Development</h3>
           <p className="text-xs uppercase tracking-widest font-bold mt-2">The {activeTab} module is coming soon</p>
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-hotel-sand">
      <Toaster position="top-center" richColors />
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} role={role} />
      <main className="lg:ml-64 min-h-screen flex flex-col pb-20 lg:pb-0 overflow-x-hidden">
        <Header 
          title={activeTab === 'home' ? 'Welcome' : activeTab} 
          user={{ ...(profile || {}), displayName: user.displayName, role, photoURL: user.photoURL }} 
          isAdminMode={false}
          setIsAdminMode={setIsAdminMode}
          isStaff={isStaff}
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
