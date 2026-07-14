'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface ScrollIntroProps {
  onComplete: () => void;
  skipLabel?: string;
}

export default function ScrollIntro({ onComplete, skipLabel = '跳过' }: ScrollIntroProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const completeTimer = window.setTimeout(() => {
      setVisible(false);
      onComplete();
    }, 1800);

    return () => window.clearTimeout(completeTimer);
  }, [onComplete]);

  const handleSkip = () => {
    setVisible(false);
    window.setTimeout(onComplete, 240);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="scroll-intro-light"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.24, ease: 'easeOut' }}
        >
          <motion.div
            className="scroll-intro-light__panel"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          >
            <span className="scroll-intro-light__kicker">ziwei</span>
            <strong>紫微命盘</strong>
            <p>以白色研究平台风格进入排盘</p>
          </motion.div>

          <button type="button" onClick={handleSkip} className="scroll-intro-light__skip">
            {skipLabel}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
