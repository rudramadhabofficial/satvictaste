import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Modal({ isOpen, onClose, title, children, maxWidth = '500px' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={onClose}>
        <motion.div 
          className="modal-content"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth }}
        >
          <div className="modal-header">
            <h3 className="modal-title">{title}</h3>
            <button className="modal-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
          <div className="modal-body">
            {children}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
