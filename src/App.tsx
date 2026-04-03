/**
* @license
* SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Shield, Crown, BookOpen, Palette, Compass, Heart, HandHelping, Laugh, Send, Trophy, Headphones, Zap, AlertOctagon } from 'lucide-react';
import confetti from 'canvas-confetti';

// --- CONFIGURATION ---
const BOT_TOKEN = "8260200134:AAFlf6xMu9DAYAKWDJVoLFczYRRzWVqijnY";
const CHAT_ID = "6789535208";

interface Archetype {
 id: string;
 name: string;
 icon: React.ReactNode;
 description: string;
 color: string;
}

const ARCHETYPES: Archetype[] = [
 { id: 'warrior', name: 'Warrior', icon: <Shield className="w-8 h-8" />, description: 'Strong, determined, never gives up', color: 'bg-red-500' },
 { id: 'leader', name: 'Leader', icon: <Crown className="w-8 h-8" />, description: 'Leads, controls, guides others', color: 'bg-yellow-500' },
 { id: 'sage', name: 'Sage', icon: <BookOpen className="w-8 h-8" />, description: 'Wise, loves learning, deep understanding', color: 'bg-blue-500' },
 { id: 'creator', name: 'Creator', icon: <Palette className="w-8 h-8" />, description: 'Creative, rich imagination', color: 'bg-purple-500' },
 { id: 'explorer', name: 'Explorer', icon: <Compass className="w-8 h-8" />, description: 'Loves exploring, curious, values experiences', color: 'bg-green-500' },
 { id: 'lover', name: 'Lover', icon: <Heart className="w-8 h-8" />, description: 'Emotional, connection, values relationships', color: 'bg-pink-500' },
 { id: 'caregiver', name: 'Caregiver', icon: <HandHelping className="w-8 h-8" />, description: 'Caring, helpful, looks after others', color: 'bg-orange-500' },
 { id: 'jester', name: 'Jester', icon: <Laugh className="w-8 h-8" />, description: 'Humorous, fun, makes everyone laugh', color: 'bg-indigo-500' },
];

interface VocabItem {
  id: number;
  label: string;
  answer: string;
}

const vocabData: VocabItem[] = [
  { id: 1, label: "Từ thứ 2 trong chủ đề Touring", answer: "ticket office" },
  { id: 2, label: "Từ thứ 7 trong chủ đề Adjectives", answer: "fabulous" },
  { id: 3, label: "Từ thứ 12 trong chủ đề Hobbies", answer: "billiards" },
  { id: 4, label: "Từ thứ 20 trong chủ đề Hobbies", answer: "embroidery" },
  { id: 5, label: "Từ thứ 2 trong chủ đề Shapes & Measurement", answer: "rectangular" },
  { id: 6, label: "Từ thứ 2 trong chủ đề Vehicles", answer: "single-decker" },
  { id: 7, label: "Từ thứ 8 trong chủ đề Weather", answer: "dry" },
  { id: 8, label: "Từ thứ 8 trong chủ đề Places", answer: "canteen" },
  { id: 9, label: "Từ thứ 5 trong chủ đề Equipment and tools", answer: "silicon chip" },
  { id: 10, label: "Từ thứ 8 trong chủ đề The arts and media", answer: "audience" },
  { id: 11, label: "Từ thứ 9 trong chủ đề Materials", answer: "cement" },
  { id: 12, label: "Từ thứ 14 trong chủ đề Works and jobs", answer: "volunteer" },
  { id: 13, label: "Từ thứ 3 trong chủ đề Color", answer: "orange" },
  { id: 14, label: "Từ thứ 5 trong chủ đề Expressions and time", answer: "part-time" },
  { id: 15, label: "Từ thứ 20 trong chủ đề Other", answer: "dialog" },
  { id: 16, label: "Từ thứ 36 trong chủ đề Other", answer: "pedestrian" }
];

type AppState = 'WELCOME' | 'QUIZ' | 'COMPLETION' | 'SUBMITTED';

export default function App() {
 const [state, setState] = useState<AppState>('WELCOME');
 const [name, setName] = useState('');
 const [selectedArchetype, setSelectedArchetype] = useState<Archetype | null>(null);
 const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [finalResults, setFinalResults] = useState<{ correct: number; total: number } | null>(null);

 const containerRef = useRef<HTMLDivElement>(null);
 const hasSubmittedRef = useRef(false);

 // --- FULLSCREEN LOGIC ---
 useEffect(() => {
   const handleFullscreenChange = () => {
     if (!document.fullscreenElement && state === 'QUIZ') {
       alert("SECURITY ALERT: Cảnh báo gian lận! Bạn đã thoát Fullscreen. Hệ thống tự động hủy bài làm.");
       resetQuiz();
     }
   };

   document.addEventListener('fullscreenchange', handleFullscreenChange);
   return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
 }, [state]);

 const resetQuiz = () => {
   setState('WELCOME');
   setUserAnswers({});
   setFinalResults(null);
 };

 const retryQuiz = () => {
   setFinalResults(null);
   setState('QUIZ');
 };

 const startQuiz = async () => {
   if (!name.trim() || !selectedArchetype) {
     setError("Vui lòng nhập tên và chọn Archetype.");
     return;
   }
   setError(null);

   try {
     if (containerRef.current) {
       await containerRef.current.requestFullscreen();
     }
     setState('QUIZ');
   } catch (err) {
     console.error("Fullscreen request failed", err);
     setState('QUIZ');
   }
 };

 const handleInputChange = (id: number, value: string) => {
   setUserAnswers(prev => ({ ...prev, [id]: value }));
 };

 const calculateResults = () => {
   let correctCount = 0;
   vocabData.forEach(item => {
     const userAnswer = (userAnswers[item.id] || '').trim().toLowerCase();
     const correctAnswer = item.answer.trim().toLowerCase();
     if (userAnswer === correctAnswer) {
       correctCount++;
     }
   });

   setFinalResults({ correct: correctCount, total: vocabData.length });
   setState('COMPLETION');
  
   confetti({
     particleCount: 200,
     spread: 90,
     origin: { y: 0.6 }
   });
 };

 const submitToTelegram = async () => {
   if (!finalResults || isSubmitting) return;
   setIsSubmitting(true);

   const message = `🎙 VOCABULARY REFLEX DRILL
👤 Name: ${name}
🎭 Archetype: ${selectedArchetype?.name}
🎯 Score: ${finalResults.correct}/${finalResults.total}`;

   try {
     await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         chat_id: CHAT_ID,
         text: message,
       }),
     });
     setState('SUBMITTED');
   } catch (err) {
     console.error("Telegram submission failed", err);
   } finally {
     setIsSubmitting(false);
   }
 };

 useEffect(() => {
   if (state === 'COMPLETION' && !hasSubmittedRef.current) {
     hasSubmittedRef.current = true;
     submitToTelegram();
   }
   if (state === 'WELCOME') {
     hasSubmittedRef.current = false;
   }
 }, [state, finalResults]);

 return (
   <div ref={containerRef} className="min-h-screen bg-[#050505] text-white font-sans selection:bg-purple-500/30 overflow-hidden flex flex-col items-center justify-center p-4">
     <AnimatePresence mode="wait">
       {state === 'WELCOME' && (
         <motion.div
           key="welcome"
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, scale: 0.95 }}
           className="w-full max-w-4xl bg-[#111111] p-10 rounded-[2.5rem] border border-white/5 shadow-2xl"
         >
           <div className="text-center mb-10">
             <div className="inline-flex items-center justify-center p-4 bg-purple-500/10 text-purple-500 rounded-[1.5rem] mb-6 border border-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.15)]">
               <Zap size={40} />
             </div>
             <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-2 uppercase tracking-tighter">
               VOCABULARY REFLEX DRILL
             </h1>
             <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-[10px]">Honor Class 1A • Tactical Intelligence</p>
           </div>

           <div className="space-y-8">
             <div className="max-w-md mx-auto">
               <label className="block text-[10px] font-black text-zinc-500 mb-2 uppercase tracking-[0.2em] text-center">Xác nhận danh tính</label>
               <input
                 type="text"
                 value={name}
                 onChange={(e) => setName(e.target.value)}
                 placeholder="Nhập tên của em..."
                 className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-center text-lg font-bold text-purple-400"
               />
             </div>

             <div>
               <label className="block text-[10px] font-black text-zinc-500 mb-4 uppercase tracking-[0.2em] text-center">Chọn hệ nhân vật (Archetype)</label>
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                 {ARCHETYPES.map((arch) => (
                   <button
                     key={arch.id}
                     onClick={() => setSelectedArchetype(arch)}
                     className={`flex flex-col items-center p-4 rounded-3xl border-2 transition-all text-center group ${
                       selectedArchetype?.id === arch.id
                         ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                         : 'border-white/5 bg-white/5 hover:border-white/10'
                     }`}
                   >
                     <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${arch.color} bg-opacity-20 text-white`}>
                       {arch.icon}
                     </div>
                     <h4 className="font-bold text-[10px] uppercase tracking-widest">{arch.name}</h4>
                   </button>
                 ))}
               </div>
             </div>

             <div className="bg-red-500/5 border border-red-500/20 p-5 rounded-2xl max-w-xl mx-auto text-center space-y-2">
                 <p className="text-[10px] font-black text-red-500 uppercase tracking-widest flex justify-center items-center gap-2"><AlertOctagon size={14}/> Cảnh báo từ Thầy Trường</p>
                 <p className="text-[11px] text-zinc-400 italic">"Viết sai chính tả hoặc thiếu dấu gạch ngang (-) = 0 điểm. Phạt chép lại toàn bộ chủ đề đó 1 lần."</p>
             </div>

             {error && <div className="flex items-center gap-2 text-red-400 text-[10px] font-black bg-red-500/10 p-4 rounded-2xl border border-red-500/20 max-w-md mx-auto uppercase tracking-widest"><AlertCircle size={14} /><span>{error}</span></div>}

             <div className="max-w-md mx-auto pt-4">
               <button
                 onClick={startQuiz}
                 className="w-full bg-purple-600 hover:bg-purple-500 py-5 rounded-2xl font-black text-lg shadow-xl shadow-purple-900/20 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest"
               >
                 KHAI HỎA NHIỆM VỤ
               </button>
             </div>
           </div>
         </motion.div>
       )}

       {state === 'QUIZ' && (
         <motion.div
           key="quiz"
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           className="w-full max-w-5xl flex flex-col h-full max-h-[95vh]"
         >
           {/* Header */}
           <div className="flex items-center justify-between mb-6 bg-[#111111] p-5 rounded-[1.5rem] border border-white/5 shrink-0 shadow-xl">
             <div className="flex items-center gap-4">
               <div className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedArchetype?.color} bg-opacity-20 text-white`}>
                 {selectedArchetype?.icon}
               </div>
               <div>
                 <h3 className="font-black text-lg uppercase tracking-tight">{name}</h3>
                 <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Mission: Reflex Dictation</p>
               </div>
             </div>
             <div className="text-right">
               <div className="text-2xl font-mono font-black text-purple-400 tracking-tighter">
                 {Object.keys(userAnswers).length}/16
               </div>
               <p className="text-[8px] text-zinc-500 uppercase tracking-widest font-black">Progress</p>
             </div>
           </div>

           {/* Audio Player */}
           <div className="bg-[#1a1c3d] p-6 rounded-2xl border border-white/10 mb-6 flex flex-col items-center shrink-0 shadow-2xl">
             <h4 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-widest flex items-center gap-2">
                <Headphones size={14} className="text-purple-500" /> Audio Intelligence Feed
             </h4>
             <iframe 
               src="https://drive.google.com/file/d/14gd0pHYlccLTsFiCjsns5gNJHixku9GI/preview" 
               className="w-full max-w-2xl h-[120px] rounded-xl border-none overflow-hidden bg-black/50"
               allow="autoplay"
               title="Listening Dictation Audio"
             ></iframe>
           </div>

           {/* Input Fields */}
           <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar bg-[#111111]/50 p-8 rounded-[2.5rem] border border-white/5">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {vocabData.map((item, index) => (
                 <div key={item.id} className="space-y-2">
                   <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">{item.label}</label>
                   <div className="relative group">
                     <span className="absolute left-5 top-1/2 -translate-y-1/2 text-purple-500/30 font-black font-mono text-sm group-focus-within:text-purple-400 transition-colors">({index + 1})</span>
                     <input
                       type="text"
                       autoComplete="off"
                       value={userAnswers[item.id] || ''}
                       onChange={(e) => handleInputChange(item.id, e.target.value)}
                       placeholder="..."
                       className="w-full bg-black border border-white/5 rounded-2xl pl-12 pr-6 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-mono font-bold text-purple-400 placeholder:text-zinc-800 shadow-inner"
                     />
                   </div>
                 </div>
               ))}
             </div>
           </div>

           {/* Submit Button */}
           <div className="mt-6 flex justify-center shrink-0">
             <button
               onClick={calculateResults}
               className="w-full max-w-md bg-purple-600 hover:bg-purple-500 py-5 rounded-2xl font-black text-xl shadow-xl shadow-purple-900/20 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest"
             >
               <Send size={24} /> NỘP BÁO CÁO TÁC CHIẾN
             </button>
           </div>
         </motion.div>
       )}

       {(state === 'COMPLETION' || state === 'SUBMITTED') && (
         <motion.div
           key="completion"
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="w-full max-w-5xl flex flex-col h-full max-h-[95vh]"
         >
           {/* Results Header */}
           <div className="text-center mb-10 shrink-0">
             <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20 shadow-[0_0_40px_rgba(34,197,94,0.1)]">
               <Trophy size={48} />
             </div>
             <h1 className="text-5xl font-black tracking-tight mb-3 uppercase italic text-purple-400">Mission Debriefing</h1>
             <div className="flex items-center justify-center gap-4">
               <span className="text-4xl font-mono bg-purple-500/10 px-10 py-3 rounded-3xl border border-purple-500/20 text-purple-400 font-black shadow-inner">
                 SCORE: {finalResults?.correct}/{finalResults?.total}
               </span>
             </div>
           </div>

           {/* Post-Action Report */}
           <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar bg-[#111111] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
             <h2 className="text-2xl font-black text-center mb-10 text-yellow-500 uppercase tracking-widest border-b border-white/5 pb-6 italic">Verification Status</h2>

             <div className="space-y-5">
               {vocabData.map((item) => {
                 const rawAnswer = (userAnswers[item.id] || '').trim().toLowerCase();
                 const isCorrect = rawAnswer === item.answer.toLowerCase();

                 return (
                   <div key={item.id} className="bg-black/40 p-6 rounded-3xl border border-white/5 flex items-center justify-between gap-6 hover:border-white/10 transition-colors">
                     <div className="flex items-center gap-6">
                        <span className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center font-black text-zinc-600 font-mono text-lg">{item.id}</span>
                        <div className="flex flex-col max-w-xs md:max-w-md">
                          <p className="text-[9px] text-zinc-500 font-black uppercase mb-1 tracking-widest line-clamp-1">{item.label}</p>
                          <p className={`text-2xl font-mono font-black ${isCorrect ? 'text-green-400' : 'text-red-400 underline decoration-wavy shadow-red-500/20'}`}>
                            {userAnswers[item.id] || 'NO DATA'}
                          </p>
                        </div>
                     </div>
                     <div className="flex items-center shrink-0">
                        {isCorrect ? (
                          <div className="flex items-center gap-2 text-green-500 bg-green-500/10 px-5 py-2 rounded-full border border-green-500/20 font-black text-[10px] uppercase italic tracking-widest shadow-sm">
                            <CheckCircle2 size={16} /> Verified
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-red-500 bg-red-500/10 px-5 py-2 rounded-full border border-red-500/20 font-black text-[10px] uppercase italic tracking-widest shadow-sm">
                            <AlertCircle size={16} /> Corrupted
                          </div>
                        )}
                     </div>
                   </div>
                 );
               })}
             </div>

             <div className="mt-14 flex justify-center gap-6 shrink-0">
               <button
                 onClick={retryQuiz}
                 className="bg-purple-600 hover:bg-purple-500 px-12 py-5 rounded-2xl text-white font-black transition-all uppercase tracking-widest shadow-lg shadow-purple-900/40 hover:scale-105 active:scale-95"
               >
                 NGHE LẠI FEED (RE-LISTEN)
               </button>
               <button
                 onClick={resetQuiz}
                 className="bg-white/5 hover:bg-white/10 px-12 py-5 rounded-2xl text-zinc-500 font-bold transition-all uppercase tracking-widest border border-white/5"
               >
                 TRỞ VỀ CĂN CỨ
               </button>
             </div>
           </div>
         </motion.div>
       )}
     </AnimatePresence>

     <style>{`
       .custom-scrollbar::-webkit-scrollbar {
         width: 6px;
       }
       .custom-scrollbar::-webkit-scrollbar-track {
         background: rgba(255, 255, 255, 0.02);
         border-radius: 10px;
       }
       .custom-scrollbar::-webkit-scrollbar-thumb {
         background: rgba(168, 85, 247, 0.3);
         border-radius: 10px;
       }
       .custom-scrollbar::-webkit-scrollbar-thumb:hover {
         background: rgba(168, 85, 247, 0.5);
       }
     `}</style>
   </div>
 );
}
