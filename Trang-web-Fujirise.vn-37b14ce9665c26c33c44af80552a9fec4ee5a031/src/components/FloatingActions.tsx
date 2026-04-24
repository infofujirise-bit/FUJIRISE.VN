import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { CONTACT_INFO } from '../constants';
import { motion, AnimatePresence } from 'motion/react';

export default function FloatingActions() {
  const [showText, setShowText] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setShowText(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-4">
      {/* Zalo Button */}
      <a
        href={CONTACT_INFO.zalo}
        target="_blank"
        rel="noreferrer"
        className="group relative flex items-center justify-end"
      >
        <AnimatePresence>
          {showText && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white px-4 py-2 rounded-full shadow-lg border text-blue-500 font-bold mr-3"
            >
              Chat Zalo
            </motion.div>
          )}
        </AnimatePresence>
        <div className="w-14 h-14 bg-fuji-accent text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform pulse-animation">
          <MessageCircle size={30} />
        </div>
      </a>

      {/* Hotline Button */}
      <a
        href={`tel:${CONTACT_INFO.hotline}`}
        className="group relative flex items-center justify-end"
      >
        <AnimatePresence>
          {showText && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-fuji-blue px-4 py-2 rounded-full shadow-lg border-fuji-accent border text-white font-bold mr-3"
            >
              Tư vấn: {CONTACT_INFO.hotline}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="w-14 h-14 bg-fuji-blue text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform pulse-animation-blue">
          <Phone size={30} />
        </div>
      </a>

      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(197, 160, 89, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(197, 160, 89, 0); }
          100% { box-shadow: 0 0 0 0 rgba(197, 160, 89, 0); }
        }
        @keyframes pulse-blue {
          0% { box-shadow: 0 0 0 0 rgba(10, 17, 40, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(10, 17, 40, 0); }
          100% { box-shadow: 0 0 0 0 rgba(10, 17, 40, 0); }
        }
        .pulse-animation {
          animation: pulse 2s infinite;
        }
        .pulse-animation-blue {
          animation: pulse-blue 2s infinite;
        }
      `}</style>
    </div>
  );
}
