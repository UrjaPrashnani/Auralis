import React from 'react';
import { MessageSquare, Book, Newspaper, Settings, Menu, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { UtilityType } from '@/src/types';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  activeUtility: UtilityType;
  onSelect: (utility: UtilityType) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ activeUtility, onSelect, isOpen, onToggle }: SidebarProps) {
  const items = [
    { id: 'chat' as UtilityType, label: 'Conversation', icon: MessageSquare, description: 'AI Chat Assistant' },
    { id: 'dictionary' as UtilityType, label: 'Lexicon', icon: Book, description: 'Smart Dictionary' },
    { id: 'news' as UtilityType, label: 'Pulse', icon: Newspaper, description: 'Real-time News' },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={onToggle}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {(isOpen || window.innerWidth >= 1024) && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              "fixed inset-y-0 left-0 z-40 w-72 bg-zinc-950 border-r border-zinc-800 flex flex-col",
              "lg:relative lg:translate-x-0"
            )}
          >
            <div className="p-8 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Auralis</h1>
            </div>

            <nav className="flex-1 px-4 space-y-2">
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = activeUtility === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelect(item.id);
                      if (window.innerWidth < 1024) onToggle();
                    }}
                    className={cn(
                      "w-full group flex items-start gap-4 p-4 rounded-xl transition-all duration-200",
                      isActive 
                        ? "bg-zinc-900 text-white border border-zinc-800 shadow-lg shadow-black/20" 
                        : "text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-300 border border-transparent"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-lg transition-colors",
                      isActive ? "bg-indigo-500/10 text-indigo-400" : "bg-zinc-900 text-zinc-600 group-hover:text-zinc-400"
                    )}>
                      <Icon size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-medium leading-none mb-1">{item.label}</p>
                      <p className="text-xs opacity-60 font-normal">{item.description}</p>
                    </div>
                  </button>
                );
              })}
            </nav>

            <div className="p-4 border-t border-zinc-800">
              <button className="w-full flex items-center gap-3 p-3 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors">
                <Settings size={18} />
                <span className="text-sm font-medium">Settings</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
