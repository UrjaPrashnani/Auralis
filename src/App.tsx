/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatUtility from './components/ChatUtility';
import DictionaryUtility from './components/DictionaryUtility';
import NewsUtility from './components/NewsUtility';
import { UtilityType } from './types';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const [activeUtility, setActiveUtility] = useState<UtilityType>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderUtility = () => {
    switch (activeUtility) {
      case 'chat':
        return <ChatUtility />;
      case 'dictionary':
        return <DictionaryUtility />;
      case 'news':
        return <NewsUtility />;
      default:
        return <ChatUtility />;
    }
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 overflow-hidden">
      <Sidebar 
        activeUtility={activeUtility} 
        onSelect={setActiveUtility} 
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      
      <main className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeUtility}
            initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="h-full w-full"
          >
            {renderUtility()}
          </motion.div>
        </AnimatePresence>

        {/* Background Atmosphere */}
        <div className="absolute inset-0 pointer-events-none z-[-1] overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-700" />
        </div>
      </main>
    </div>
  );
}

