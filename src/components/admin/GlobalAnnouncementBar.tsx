'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AlertCircle, Info, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/store/useUserStore';

export default function GlobalAnnouncementBar() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const pathname = usePathname();
  const { user } = useUserStore();

  useEffect(() => {
    // Super admins manage them, so they don't need to see the global alert bar
    if (user?.role === 'superadmin') return;

    const fetchAnnouncements = async () => {
      try {
        const res = await fetch('/api/admin/announcements');
        const data = await res.json();
        if (res.ok) {
          // Check local storage for dismissed announcements
          const savedDismissed = localStorage.getItem('dismissedAnnouncements');
          const dismissedSet = savedDismissed ? new Set<string>(JSON.parse(savedDismissed)) : new Set<string>();
          setDismissed(dismissedSet);
          
          const active = data.data.filter((a: any) => !dismissedSet.has(a._id));
          setAnnouncements(active);
        }
      } catch (e) {
        console.error('Failed to load announcements', e);
      }
    };

    fetchAnnouncements();
  }, [pathname, user]);

  const handleDismiss = (id: string) => {
    const newSet = new Set(dismissed);
    newSet.add(id);
    setDismissed(newSet);
    localStorage.setItem('dismissedAnnouncements', JSON.stringify(Array.from(newSet)));
    setAnnouncements(announcements.filter(a => a._id !== id));
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'warning': return { bg: 'bg-orange-500', text: 'text-white', icon: <AlertCircle className="w-4 h-4 shrink-0" /> };
      case 'success': return { bg: 'bg-green-500', text: 'text-white', icon: <CheckCircle2 className="w-4 h-4 shrink-0" /> };
      default: return { bg: 'bg-blue-600', text: 'text-white', icon: <Info className="w-4 h-4 shrink-0" /> };
    }
  };

  if (!announcements.length) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] flex flex-col items-center">
      <AnimatePresence>
        {announcements.map((ann, idx) => {
          const styles = getTypeStyles(ann.type);
          // Give stacking effect if multiple
          return (
            <motion.div
              key={ann._id}
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0, transition: { duration: 0.2 } }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className={`w-full py-2.5 px-4 shadow-md flex items-center justify-center gap-3 relative ${styles.bg} ${styles.text}`}
              style={{ zIndex: 60 - idx }}
            >
              {styles.icon}
              <div className="text-sm font-medium text-center flex-1 max-w-4xl mx-auto">
                <span className="font-bold mr-2">{ann.title}:</span>
                {ann.message}
              </div>
              <button 
                onClick={() => handleDismiss(ann._id)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-black/10 rounded-full transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
