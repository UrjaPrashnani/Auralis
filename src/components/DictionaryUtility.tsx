import React, { useState } from 'react';
import { Book, Search, Sparkles, Volume2, ArrowRight, Loader2, Info, ListChecks } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

interface DictionaryEntry {
  word: string;
  phonetic?: string;
  definition: string;
  partOfSpeech: string;
  example?: string;
  synonyms: string[];
  etymology?: string;
}

export default function DictionaryUtility() {
  const [word, setWord] = useState('');
  const [entry, setEntry] = useState<DictionaryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const lookupWord = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!word.trim() || isLoading) return;
    
    setIsLoading(true);
    setEntry(null);

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Provide a comprehensive dictionary entry for the word: "${word}". 
        Include definition, part of speech, phonetic pronunciation, an example sentence, synonyms, and a brief etymology.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              phonetic: { type: Type.STRING },
              definition: { type: Type.STRING },
              partOfSpeech: { type: Type.STRING },
              example: { type: Type.STRING },
              synonyms: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              etymology: { type: Type.STRING },
            },
            required: ['word', 'definition', 'partOfSpeech', 'synonyms'],
          },
        },
      });

      const data = JSON.parse(response.text || '{}');
      setEntry(data);
    } catch (error) {
      console.error('Dictionary lookup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 overflow-y-auto">
      {/* Header */}
      <header className="p-8 border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Book size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Lexicon</h2>
              <p className="text-sm text-zinc-500 font-medium tracking-widest uppercase">AI-Powered Dictionary</p>
            </div>
          </div>
          
          <form onSubmit={lookupWord} className="flex-1 max-w-md relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" size={20} />
            <input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="Search for a word..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 pl-12 pr-6 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
            />
            <button
              type="submit"
              disabled={!word.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 disabled:opacity-50 transition-all"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />}
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <AnimatePresence mode="wait">
            {entry ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Main Entry Card */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Book size={160} />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-baseline gap-4">
                      <h3 className="text-6xl font-bold text-white tracking-tight">{entry.word}</h3>
                      <span className="text-indigo-400 font-serif italic text-xl">{entry.partOfSpeech}</span>
                    </div>
                    
                    {entry.phonetic && (
                      <div className="flex items-center gap-2 text-zinc-500 text-lg">
                        <Volume2 size={20} />
                        <span>{entry.phonetic}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-10 space-y-6">
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Definition</span>
                      <p className="text-2xl text-zinc-200 leading-relaxed font-medium">
                        {entry.definition}
                      </p>
                    </div>

                    {entry.example && (
                      <div className="p-6 bg-zinc-950/50 border border-zinc-800/50 rounded-2xl italic text-zinc-400">
                        "{entry.example}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Synonyms */}
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 space-y-6">
                    <div className="flex items-center gap-2 text-indigo-400">
                      <ListChecks size={20} />
                      <h5 className="font-bold uppercase tracking-widest text-xs">Synonyms</h5>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {entry.synonyms.map((syn, i) => (
                        <button 
                          key={i}
                          onClick={() => {
                            setWord(syn);
                            // Trigger lookup manually after state update
                          }}
                          className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-400 hover:text-white hover:border-indigo-500 transition-all"
                        >
                          {syn}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Etymology */}
                  {entry.etymology && (
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 space-y-6">
                      <div className="flex items-center gap-2 text-indigo-400">
                        <Info size={20} />
                        <h5 className="font-bold uppercase tracking-widest text-xs">Origin & Etymology</h5>
                      </div>
                      <p className="text-zinc-400 text-sm leading-relaxed">
                        {entry.etymology}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : isLoading ? (
              <div className="h-64 flex flex-col items-center justify-center gap-4 text-zinc-500">
                <Loader2 className="animate-spin text-indigo-500" size={40} />
                <p className="font-medium animate-pulse">Consulting the digital lexicon...</p>
              </div>
            ) : (
              <div className="h-96 border-2 border-dashed border-zinc-900 rounded-3xl flex flex-col items-center justify-center text-zinc-600 gap-6 text-center px-8">
                <div className="p-6 rounded-full bg-zinc-900/50">
                  <Book size={48} className="opacity-20" />
                </div>
                <div className="max-w-xs space-y-2">
                  <h4 className="text-lg font-bold text-zinc-400">Expand your vocabulary</h4>
                  <p className="text-sm">Search for any word to discover its meaning, origin, and more.</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {['Ephemeral', 'Serendipity', 'Luminous', 'Resilience'].map(s => (
                    <button 
                      key={s}
                      onClick={() => {
                        setWord(s);
                      }}
                      className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-medium hover:text-indigo-400 hover:border-indigo-500 transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
