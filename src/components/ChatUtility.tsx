import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Trash2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/src/lib/utils';
import { Message } from '@/src/types';
import { motion, AnimatePresence } from 'motion/react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export default function ChatUtility() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [...messages, userMessage].map(m => ({
          role: m.role,
          parts: [{ text: m.content }],
        })),
        config: {
          systemInstruction: "You are Auralis, a highly intelligent and helpful AI assistant. Your goal is to provide clear, concise, and accurate information. You are part of a multi-utility platform that includes language learning and news. Be friendly and professional.",
        },
      });

      const modelMessage: Message = {
        role: 'model',
        content: response.text || "I'm sorry, I couldn't generate a response.",
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'model',
        content: "Error: Failed to connect to AI service. Please try again later.",
        timestamp: Date.now(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="p-6 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Bot size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">AI Conversation</h2>
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest">Powered by Gemini 3 Flash</p>
          </div>
        </div>
        <button 
          onClick={clearChat}
          className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
          title="Clear conversation"
        >
          <Trash2 size={20} />
        </button>
      </header>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 flex items-center justify-center animate-pulse">
              <Bot size={40} className="text-indigo-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white">Welcome to Auralis Chat</h3>
              <p className="text-zinc-500">I'm your intelligent companion. Ask me anything, explore ideas, or just have a conversation.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full">
              {['Explain quantum physics', 'Write a poem about space', 'Plan a travel itinerary', 'How to bake a cake'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion);
                    // Trigger send manually after state update
                  }}
                  className="p-3 text-xs font-medium text-zinc-400 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:bg-zinc-900 hover:text-white hover:border-zinc-700 transition-all text-left"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={idx}
              className={cn(
                "flex gap-4 max-w-3xl",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                msg.role === 'user' ? "bg-indigo-600 text-white" : "bg-zinc-900 text-indigo-400 border border-zinc-800"
              )}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className={cn(
                "p-5 rounded-2xl text-sm leading-relaxed",
                msg.role === 'user' 
                  ? "bg-indigo-600/10 text-indigo-100 border border-indigo-500/20" 
                  : "bg-zinc-900/50 text-zinc-300 border border-zinc-800"
              )}>
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))
        )}
        {isLoading && (
          <div className="flex gap-4 mr-auto animate-pulse">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center border border-zinc-800">
              <Bot size={20} className="text-indigo-400" />
            </div>
            <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-indigo-400" />
              <span className="text-zinc-500 text-sm font-medium">Auralis is thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 border-t border-zinc-800 bg-zinc-950/50 backdrop-blur-xl">
        <form 
          onSubmit={handleSend}
          className="max-w-4xl mx-auto relative group"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-6 pr-16 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20"
          >
            <Send size={20} />
          </button>
        </form>
        <p className="text-center text-[10px] text-zinc-600 mt-4 font-medium uppercase tracking-widest">
          Auralis may provide inaccurate information. Verify important details.
        </p>
      </div>
    </div>
  );
}
