import React, { useState, useEffect } from 'react';
import { Newspaper, Search, ExternalLink, RefreshCw, Loader2, TrendingUp, Globe, Clock } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';
import { cn } from '@/src/lib/utils';
import { NewsItem } from '@/src/types';
import { motion, AnimatePresence } from 'motion/react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const CATEGORIES = [
  { id: 'all', label: 'Top Stories', icon: Globe },
  { id: 'tech', label: 'Technology', icon: TrendingUp },
  { id: 'business', label: 'Business', icon: TrendingUp },
  { id: 'science', label: 'Science', icon: TrendingUp },
  { id: 'health', label: 'Health', icon: TrendingUp },
  { id: 'entertainment', label: 'Entertainment', icon: TrendingUp },
];

export default function NewsUtility() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNews = async (query?: string) => {
    setIsLoading(true);
    setNews([]);
    
    const finalQuery = query || `Latest ${activeCategory.id === 'all' ? 'breaking' : activeCategory.label} news today`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Fetch the latest news for: ${finalQuery}. 
        Provide a list of news items with title, url, snippet, and source.`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                url: { type: Type.STRING },
                snippet: { type: Type.STRING },
                source: { type: Type.STRING },
              },
              required: ['title', 'url', 'snippet'],
            },
          },
        },
      });

      const data = JSON.parse(response.text || '[]');
      setNews(data);
    } catch (error) {
      console.error('News fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [activeCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchNews(searchQuery);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 overflow-y-auto">
      {/* Header */}
      <header className="p-8 border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Newspaper size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Pulse</h2>
              <p className="text-sm text-zinc-500 font-medium uppercase tracking-widest">Real-time Global Intelligence</p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex-1 max-w-md relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search global news..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 pl-12 pr-6 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
            />
          </form>

          <button 
            onClick={() => fetchNews()}
            disabled={isLoading}
            className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-400 hover:text-white hover:border-zinc-700 transition-all disabled:opacity-50"
          >
            <RefreshCw size={20} className={cn(isLoading && "animate-spin")} />
          </button>
        </div>

        {/* Categories */}
        <div className="max-w-5xl mx-auto mt-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 border",
                activeCategory.id === cat.id 
                  ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20" 
                  : "bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:text-zinc-300"
              )}
            >
              <cat.icon size={16} />
              {cat.label}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 space-y-4 animate-pulse">
                    <div className="h-4 bg-zinc-800 rounded w-3/4" />
                    <div className="space-y-2">
                      <div className="h-3 bg-zinc-800 rounded w-full" />
                      <div className="h-3 bg-zinc-800 rounded w-5/6" />
                    </div>
                    <div className="h-3 bg-zinc-800 rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : news.length > 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {news.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col hover:border-indigo-500/50 hover:bg-zinc-900/80 transition-all duration-300 shadow-lg shadow-black/20"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                        <Clock size={12} />
                        <span>Just Now</span>
                      </div>
                      {item.source && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
                          {item.source}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-3 line-clamp-2 group-hover:text-indigo-300 transition-colors">
                      {item.title}
                    </h3>
                    
                    <p className="text-sm text-zinc-500 leading-relaxed mb-6 line-clamp-3 flex-1">
                      {item.snippet}
                    </p>
                    
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto flex items-center justify-between text-xs font-bold text-zinc-400 group-hover:text-white transition-colors pt-4 border-t border-zinc-800"
                    >
                      <span>Read Full Article</span>
                      <ExternalLink size={14} />
                    </a>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-zinc-600 gap-4">
                <Newspaper size={48} className="opacity-20" />
                <p className="font-medium">No news found. Try a different category or search.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
