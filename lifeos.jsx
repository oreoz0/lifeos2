import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Target, 
  BookOpen, 
  Activity, 
  Settings, 
  Brain, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Zap,
  Moon,
  Sun,
  Menu,
  X,
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldAlert,
  Sparkles,
  Microscope,
  Lightbulb
} from 'lucide-react';

/**
 * LIFE OS AI - CONFIGURATION & UTILS
 */

// Colors & Theme Constants
const THEME = {
  bg: "bg-zinc-950",
  sidebar: "bg-zinc-900/50",
  card: "bg-zinc-900",
  cardHover: "hover:bg-zinc-800/80 transition-all duration-300",
  textMain: "text-zinc-100",
  textMuted: "text-zinc-400",
  accent: "text-cyan-400",
  accentBg: "bg-cyan-500",
  accentBorder: "border-cyan-500/30",
  danger: "text-red-400",
  success: "text-emerald-400"
};

// API Key (Runtime Injection)
const apiKey = "AIzaSyDynh7tvCvruvnH80Ja04IE0KJP9_CIFqM"; 

// AI Helper Function
const generateAIResponse = async (prompt, systemContext) => {
  if (!apiKey) return "Simulation Mode: API Key missing. Connect to AI to activate.";
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemContext }] }
        })
      }
    );
    
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "System Error: Could not retrieve insight.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Connection Error: The Reality Engine is offline.";
  }
};

/**
 * MAIN COMPONENT
 */
export default function App() {
  // --- STATE ---
  const [view, setView] = useState('onboarding'); // onboarding, dashboard, goals, log, analytics, settings
  const [user, setUser] = useState({
    name: '',
    age: '',
    focus: '',
    struggle: '',
    style: 'Honest', // Soft, Honest, Brutal
    joinedDate: new Date().toISOString()
  });
  
  const [data, setData] = useState({
    logs: [],
    goals: [],
    lifeScore: 50,
    streak: 0,
    lastLogin: null
  });

  const [ui, setUi] = useState({
    mobileMenuOpen: false,
    loading: false,
    aiResponse: null,
    modalOpen: false,
    modalContent: null
  });

  // --- PERSISTENCE ---
  useEffect(() => {
    const savedUser = localStorage.getItem('lifeos_user');
    const savedData = localStorage.getItem('lifeos_data');
    
    if (savedUser && savedData) {
      setUser(JSON.parse(savedUser));
      setData(JSON.parse(savedData));
      setView('dashboard');
    }
  }, []);

  useEffect(() => {
    if (user.name) {
      localStorage.setItem('lifeos_user', JSON.stringify(user));
      localStorage.setItem('lifeos_data', JSON.stringify(data));
    }
  }, [user, data]);

  // --- LOGIC ---
  const calculateLifeScore = () => {
    // A simplified algorithm for the "Life Score"
    if (data.logs.length === 0) return 50;
    
    const last7Days = data.logs.slice(-7);
    const avgFocus = last7Days.reduce((acc, log) => acc + (parseInt(log.focus) || 0), 0) / last7Days.length;
    const consistency = Math.min(data.streak * 5, 30); // Max 30 pts for consistency
    const focusScore = (avgFocus / 10) * 40; // Max 40 pts for focus
    const penalty = data.goals.filter(g => !g.active).length * 2;
    
    let score = 30 + consistency + focusScore - penalty;
    return Math.min(Math.max(Math.round(score), 0), 100);
  };

  useEffect(() => {
    const newScore = calculateLifeScore();
    if (newScore !== data.lifeScore) {
      setData(prev => ({ ...prev, lifeScore: newScore }));
    }
  }, [data.logs, data.goals]);

  // --- VIEWS ---

  if (view === 'onboarding') {
    return <Onboarding user={user} setUser={setUser} setView={setView} />;
  }

  return (
    <div className={`min-h-screen ${THEME.bg} ${THEME.textMain} font-sans selection:bg-cyan-500/30`}>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-cyan-400" />
          <span className="font-bold tracking-wider">LIFEOS</span>
        </div>
        <button onClick={() => setUi(prev => ({ ...prev, mobileMenuOpen: !prev.mobileMenuOpen }))}>
          {ui.mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className={`
          fixed md:relative z-40 h-full w-64 ${THEME.sidebar} border-r border-white/5 flex flex-col justify-between transition-transform duration-300
          ${ui.mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="p-8 hidden md:flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Brain size={20} />
            </div>
            <h1 className="font-bold tracking-widest text-lg">LIFEOS</h1>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-2">
            <NavItem icon={LayoutDashboard} label="Dashboard" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
            <NavItem icon={Target} label="Systems & Goals" active={view === 'goals'} onClick={() => setView('goals')} />
            <NavItem icon={BookOpen} label="Daily Log" active={view === 'log'} onClick={() => setView('log')} />
            <NavItem icon={Activity} label="Analytics" active={view === 'analytics'} onClick={() => setView('analytics')} />
          </nav>

          <div className="p-4 border-t border-white/5">
             <NavItem icon={Settings} label="Settings" active={view === 'settings'} onClick={() => setView('settings')} />
             <div className="mt-4 px-4 py-2 bg-zinc-900 rounded border border-white/5">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Life Score</p>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold text-white">{data.lifeScore}</span>
                  <span className={`text-xs ${data.lifeScore > 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {data.lifeScore > 70 ? 'OPTIMAL' : 'DRIFTING'}
                  </span>
                </div>
                <div className="w-full bg-zinc-800 h-1 mt-2 rounded-full overflow-hidden">
                  <div className="bg-cyan-500 h-full transition-all duration-1000" style={{ width: `${data.lifeScore}%` }}></div>
                </div>
             </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto relative scroll-smooth">
          <div className="max-w-5xl mx-auto p-4 md:p-12 pb-32">
            
            {view === 'dashboard' && <Dashboard user={user} data={data} setView={setView} />}
            {view === 'goals' && <GoalEngine user={user} data={data} setData={setData} ui={ui} setUi={setUi} />}
            {view === 'log' && <DailyLog user={user} data={data} setData={setData} ui={ui} setUi={setUi} />}
            {view === 'analytics' && <Analytics data={data} />}
            {view === 'settings' && <SettingsView user={user} setUser={setUser} resetData={() => {
              localStorage.clear();
              window.location.reload();
            }} />}

          </div>
        </main>
      </div>

      {/* Global AI Modal */}
      {ui.modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-zinc-950">
              <div className="flex items-center gap-2 text-cyan-400">
                <Brain size={18} />
                <span className="font-mono text-sm tracking-widest">REALITY ENGINE</span>
              </div>
              <button onClick={() => setUi(prev => ({...prev, modalOpen: false}))} className="hover:text-white text-zinc-500">
                <X size={20} />
              </button>
            </div>
            <div className="p-8 max-h-[70vh] overflow-y-auto">
               {ui.loading ? (
                 <div className="flex flex-col items-center justify-center py-12 space-y-4">
                   <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                   <p className="text-zinc-500 font-mono text-sm animate-pulse">ANALYZING PATTERNS...</p>
                 </div>
               ) : (
                 <div className="prose prose-invert prose-p:text-zinc-300 prose-headings:text-white">
                   <div className="whitespace-pre-wrap font-sans text-lg leading-relaxed">
                     {ui.modalContent}
                   </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * SUB-COMPONENTS
 */

const NavItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group
      ${active ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white hover:bg-zinc-800/50'}
    `}
  >
    <Icon size={18} className={`transition-colors ${active ? 'text-cyan-400' : 'group-hover:text-cyan-400'}`} />
    <span className="font-medium text-sm tracking-wide">{label}</span>
    {active && <ChevronRight size={14} className="ml-auto text-zinc-600" />}
  </button>
);

// --- ONBOARDING ---
const Onboarding = ({ user, setUser, setView }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const nextStep = () => {
    if (step < totalSteps) setStep(s => s + 1);
    else setView('dashboard');
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-zinc-100 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-purple-600"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="mb-12 text-center">
          <Brain className="w-12 h-12 text-cyan-400 mx-auto mb-6" />
          <h1 className="text-3xl font-bold tracking-tight mb-2">Initialize LifeOS</h1>
          <p className="text-zinc-500">System setup | Step {step} of {totalSteps}</p>
        </div>

        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          {step === 1 && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-zinc-400">What should we call you?</label>
              <input 
                autoFocus
                type="text" 
                value={user.name}
                onChange={(e) => setUser({...user, name: e.target.value})}
                className="w-full bg-transparent border-b border-zinc-700 py-3 text-xl focus:outline-none focus:border-cyan-500 transition-colors placeholder-zinc-800"
                placeholder="Name"
              />
              <label className="block text-sm font-medium text-zinc-400 mt-6">Age Range</label>
              <div className="grid grid-cols-3 gap-3">
                 {['Under 20', '20-30', '30+'].map(age => (
                   <button 
                    key={age}
                    onClick={() => setUser({...user, age})}
                    className={`p-3 rounded border text-sm ${user.age === age ? 'border-cyan-500 bg-cyan-500/10 text-white' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}
                   >
                     {age}
                   </button>
                 ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-zinc-400">Primary Focus</label>
              <div className="grid grid-cols-1 gap-3">
                 {['Career & Business', 'Study & Academics', 'Fitness & Health', 'Discipline & Mindset'].map(f => (
                   <button 
                    key={f}
                    onClick={() => setUser({...user, focus: f})}
                    className={`p-4 text-left rounded border transition-all ${user.focus === f ? 'border-cyan-500 bg-cyan-500/10 text-white' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:bg-zinc-900'}`}
                   >
                     {f}
                   </button>
                 ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-zinc-400">Biggest Struggle</label>
              <div className="grid grid-cols-1 gap-3">
                 {['Procrastination', 'Lack of Clarity', 'Inconsistency', 'Digital Distraction', 'Overwhelm'].map(s => (
                   <button 
                    key={s}
                    onClick={() => setUser({...user, struggle: s})}
                    className={`p-4 text-left rounded border transition-all ${user.struggle === s ? 'border-purple-500 bg-purple-500/10 text-white' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:bg-zinc-900'}`}
                   >
                     {s}
                   </button>
                 ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <label className="block text-sm font-medium text-zinc-400">Feedback Style</label>
              <div className="grid grid-cols-3 gap-3">
                 {['Soft', 'Honest', 'Brutal'].map(s => (
                   <button 
                    key={s}
                    onClick={() => setUser({...user, style: s})}
                    className={`p-3 rounded border text-sm flex flex-col items-center gap-2 ${user.style === s ? 'border-cyan-500 bg-cyan-500/10 text-white' : 'border-zinc-800 text-zinc-500'}`}
                   >
                     {s === 'Brutal' ? <ShieldAlert size={16}/> : s === 'Honest' ? <Activity size={16}/> : <Sun size={16}/>}
                     {s}
                   </button>
                 ))}
              </div>
              <div className="bg-zinc-900 p-4 rounded border border-white/5 text-sm text-zinc-400">
                <p>
                  {user.style === 'Soft' && "Gentle encouragement. Good for high-stress periods."}
                  {user.style === 'Honest' && "Direct and objective. The standard LifeOS mode."}
                  {user.style === 'Brutal' && "No sugarcoating. Calls out excuses instantly. Not for the faint of heart."}
                </p>
              </div>
            </div>
          )}

          <button 
            onClick={nextStep}
            disabled={
              (step === 1 && !user.name) ||
              (step === 2 && !user.focus) ||
              (step === 3 && !user.struggle)
            }
            className="w-full bg-white text-black py-4 rounded font-bold hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {step === totalSteps ? 'Launch System' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- DASHBOARD ---
const Dashboard = ({ user, data, setView }) => {
  const [greeting, setGreeting] = useState('');
  const [briefing, setBriefing] = useState(null);
  const [loadingBriefing, setLoadingBriefing] = useState(false);
  
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Morning Protocol');
    else if (hour < 18) setGreeting('Afternoon Update');
    else setGreeting('Evening Review');
  }, []);

  const handleGenerateBriefing = async () => {
    setLoadingBriefing(true);
    const mainGoal = data.goals.length > 0 ? data.goals[0].title : "General Self-Improvement";
    
    const context = `
      Act as a high-performance coach. User: ${user.name}. 
      Current Focus: ${user.focus}. 
      Main Goal: ${mainGoal}. 
      Recent Life Score: ${data.lifeScore}/100.
      Tone: ${user.style}.

      Generate a concise "Morning Protocol" for today consisting of:
      1. THE MISSION: One single absolute priority for today.
      2. THE ENEMY: One specific distraction to watch out for based on their struggle (${user.struggle}).
      3. THE MINDSET: A short, punchy thought to hold.

      Format with bold headers. Keep it short.
    `;

    const response = await generateAIResponse("Generate Morning Protocol", context);
    setBriefing(response);
    setLoadingBriefing(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end border-b border-white/10 pb-6">
        <div>
          <h2 className="text-zinc-500 text-sm font-mono tracking-widest uppercase mb-1">{greeting}</h2>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Welcome back, {user.name}.</h1>
        </div>
        <div className="text-right hidden md:block">
           <p className="text-zinc-500 text-sm">Focus: <span className="text-cyan-400">{user.focus}</span></p>
        </div>
      </header>

      {/* AI Morning Briefing Section */}
      {!briefing ? (
        <button 
          onClick={handleGenerateBriefing}
          disabled={loadingBriefing}
          className="w-full bg-zinc-900 border border-zinc-800 hover:border-cyan-500/50 p-4 rounded-xl flex items-center justify-center gap-3 text-zinc-400 hover:text-cyan-400 transition-all group"
        >
          {loadingBriefing ? (
             <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          ) : (
             <Sparkles size={18} className="text-cyan-500 group-hover:animate-pulse" />
          )}
          <span className="font-mono text-sm tracking-widest uppercase">
            {loadingBriefing ? "GENERATING PROTOCOL..." : "INITIALIZE MORNING BRIEFING ✨"}
          </span>
        </button>
      ) : (
        <div className="bg-gradient-to-r from-zinc-900 to-zinc-900 border border-cyan-500/30 p-6 rounded-xl relative overflow-hidden animate-in zoom-in duration-300">
           <div className="absolute top-0 right-0 p-4 opacity-10">
             <Sparkles size={64} />
           </div>
           <div className="flex justify-between items-start mb-4">
             <h3 className="text-cyan-400 font-mono text-xs uppercase tracking-widest flex items-center gap-2">
               <Zap size={14} /> Morning Protocol
             </h3>
             <button onClick={() => setBriefing(null)} className="text-zinc-600 hover:text-white"><X size={16}/></button>
           </div>
           <div className="prose prose-invert prose-sm max-w-none">
             <div className="whitespace-pre-line text-zinc-300 font-medium leading-relaxed">
               {briefing}
             </div>
           </div>
        </div>
      )}

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Main Metric */}
        <div className="bg-zinc-900 border border-white/5 p-6 rounded-xl relative overflow-hidden group hover:border-white/10 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity size={64} />
          </div>
          <p className="text-zinc-500 text-xs font-mono uppercase tracking-wider mb-2">Life Score</p>
          <div className="flex items-end gap-3">
             <span className="text-5xl font-bold text-white tracking-tighter">{data.lifeScore}</span>
             <span className="text-sm text-zinc-400 mb-2">/ 100</span>
          </div>
          <div className="mt-4">
             {data.lifeScore < 50 ? (
               <p className="text-red-400 text-sm flex items-center gap-2"><AlertTriangle size={14}/> System integrity critical.</p>
             ) : (
               <p className="text-emerald-400 text-sm flex items-center gap-2"><TrendingUp size={14}/> System stable.</p>
             )}
          </div>
        </div>

        {/* Card 2: One Big Thing */}
        <div className="md:col-span-2 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/5 p-6 rounded-xl flex flex-col justify-center">
           <p className="text-cyan-500 text-xs font-mono uppercase tracking-wider mb-3 flex items-center gap-2">
             <Target size={14} /> Current Objective
           </p>
           {data.goals.length > 0 ? (
             <div>
               <h3 className="text-xl font-medium text-white mb-1">{data.goals[0].title}</h3>
               <p className="text-zinc-500 text-sm line-clamp-1">Next Step: {data.goals[0].system?.daily?.[0] || "Define your daily protocol."}</p>
             </div>
           ) : (
             <div className="flex items-center justify-between">
               <p className="text-zinc-400">No active systems detected.</p>
               <button onClick={() => setView('goals')} className="text-sm bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded">Initialize Goal</button>
             </div>
           )}
        </div>
      </div>

      {/* Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          onClick={() => setView('log')}
          className="group cursor-pointer bg-zinc-900 border border-white/5 p-8 rounded-xl hover:bg-zinc-800/50 transition-all flex items-center justify-between"
        >
          <div>
            <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">Daily Log</h3>
            <p className="text-zinc-500 mt-1">Input data. Track consistency.</p>
          </div>
          <ArrowRight className="text-zinc-700 group-hover:text-cyan-400 transform group-hover:translate-x-1 transition-all" />
        </div>

        <div 
           onClick={() => setView('goals')}
           className="group cursor-pointer bg-zinc-900 border border-white/5 p-8 rounded-xl hover:bg-zinc-800/50 transition-all flex items-center justify-between"
        >
          <div>
            <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">System Engine</h3>
            <p className="text-zinc-500 mt-1">Refine goals. Optimize protocols.</p>
          </div>
          <ArrowRight className="text-zinc-700 group-hover:text-purple-400 transform group-hover:translate-x-1 transition-all" />
        </div>
      </div>

      {/* Recent History Mini */}
      <div className="border-t border-white/5 pt-8">
        <h3 className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-4">Recent Activity</h3>
        <div className="space-y-2">
          {data.logs.length > 0 ? data.logs.slice(-3).reverse().map((log, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-zinc-900/50 rounded border border-white/5">
              <span className="text-zinc-300">{new Date(log.date).toLocaleDateString()}</span>
              <div className="flex items-center gap-4">
                 <span className={`text-xs px-2 py-1 rounded ${parseInt(log.focus) > 7 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                   Focus: {log.focus}/10
                 </span>
              </div>
            </div>
          )) : (
            <p className="text-zinc-600 italic">No data points yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

// --- GOAL ENGINE (The "System" Builder) ---
const GoalEngine = ({ user, data, setData, ui, setUi }) => {
  const [input, setInput] = useState('');
  
  const handleCreateSystem = async () => {
    if (!input) return;
    setUi(prev => ({ ...prev, loading: true, modalOpen: true, modalContent: null }));

    // AI Prompt
    const systemPrompt = `
      You are LifeOS. The user wants to achieve: "${input}". 
      Break this down into a SYSTEM, not a goal.
      Format your response exactly like this:
      
      **Core Philosophy**: One sentence principle.
      **Daily Protocol**: 3 specific, small actionable items.
      **Non-Negotiables**: 1 rule they must never break.
      **Reality Check**: A brutal but helpful sentence about why they might fail.

      Keep it short, matte, minimal. No fluff.
    `;

    const aiResult = await generateAIResponse(input, systemPrompt);
    
    // Save locally
    const newGoal = {
      id: Date.now(),
      title: input,
      systemStr: aiResult,
      active: true,
      created: new Date().toISOString(),
      system: { daily: ["Loading actions..."] } // Placeholder for structured data if we parsed JSON
    };

    setData(prev => ({ ...prev, goals: [newGoal, ...prev.goals] }));
    setUi(prev => ({ ...prev, loading: false, modalContent: aiResult }));
    setInput('');
  };

  const deleteGoal = (id) => {
    setData(prev => ({ ...prev, goals: prev.goals.filter(g => g.id !== id) }));
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-3xl font-bold text-white mb-2">System Engine</h1>
        <p className="text-zinc-400">Convert abstract desires into executable protocols.</p>
      </div>

      <div className="bg-zinc-900 p-6 rounded-xl border border-white/10">
        <label className="block text-sm font-medium text-zinc-500 mb-2 uppercase tracking-wide">New Objective</label>
        <div className="flex gap-4">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., Become a full-stack developer, Lose 10lbs..."
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
          />
          <button 
            onClick={handleCreateSystem}
            className="bg-white text-black font-bold px-6 py-3 rounded hover:bg-zinc-200 transition-colors"
          >
            Generate
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {data.goals.map(goal => (
          <div key={goal.id} className="bg-zinc-900/50 border border-white/5 rounded-xl p-6 group">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-white">{goal.title}</h3>
              <button onClick={() => deleteGoal(goal.id)} className="text-zinc-600 hover:text-red-400 transition-colors">
                <XCircle size={18} />
              </button>
            </div>
            <div className="prose prose-invert prose-sm max-w-none text-zinc-400">
               <div className="whitespace-pre-line">{goal.systemStr}</div>
            </div>
          </div>
        ))}
        {data.goals.length === 0 && (
          <div className="text-center py-12 text-zinc-600">
            <Target className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No systems initialized.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- DAILY LOG (The "Input" Terminal) ---
const DailyLog = ({ user, data, setData, ui, setUi }) => {
  const [log, setLog] = useState({
    focus: 5,
    wastedTime: 0, // hours
    wins: '',
    failures: '',
    mood: 'Neutral'
  });

  const handleSubmit = async () => {
    setUi(prev => ({ ...prev, loading: true, modalOpen: true, modalContent: null }));

    const tone = user.style === 'Brutal' ? "You are a brutal, ruthless performance coach. No empathy. Just facts." : "You are a stoic, honest mentor.";
    
    const context = `
      ${tone}
      User Profile: ${user.name}, Focus: ${user.focus}, Struggle: ${user.struggle}.
      
      The user just logged their day:
      Focus Level: ${log.focus}/10
      Hours Wasted: ${log.wastedTime}
      Wins: ${log.wins}
      Failures: ${log.failures}
      
      Analyze this. 
      1. Detect if they are making excuses based on their "Struggle".
      2. If Focus is low, call them out.
      3. If they did well, give a brief nod of approval but tell them to stay consistent.
      
      Keep response under 100 words.
    `;

    const feedback = await generateAIResponse("Analyze my day.", context);

    const newLog = {
      id: Date.now(),
      date: new Date().toISOString(),
      ...log,
      feedback
    };

    setData(prev => ({
      ...prev,
      logs: [...prev.logs, newLog],
      streak: parseInt(log.focus) > 5 ? prev.streak + 1 : 0 // Simple streak logic
    }));

    setUi(prev => ({ ...prev, loading: false, modalContent: feedback }));
    // Reset form not strictly needed as view might change, but good practice
    setLog({ focus: 5, wastedTime: 0, wins: '', failures: '', mood: 'Neutral' });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Daily Review</h1>
        <p className="text-zinc-500">Honesty is the only metric that matters.</p>
      </div>

      <div className="bg-zinc-900 border border-white/5 p-8 rounded-xl space-y-8 shadow-2xl">
        
        {/* Focus Slider */}
        <div>
          <label className="flex justify-between text-sm font-medium text-zinc-400 mb-4">
            <span>Focus Level</span>
            <span className="text-white">{log.focus}/10</span>
          </label>
          <input 
            type="range" min="1" max="10" 
            value={log.focus} onChange={(e) => setLog({...log, focus: e.target.value})}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <div className="flex justify-between text-xs text-zinc-600 mt-2 font-mono">
            <span>DISTRACTED</span>
            <span>LOCKED IN</span>
          </div>
        </div>

        {/* Wasted Time */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">Hours Wasted</label>
          <div className="flex gap-4">
            {[0, 1, 2, 3, 4, "5+"].map(h => (
              <button 
                key={h}
                onClick={() => setLog({...log, wastedTime: h})}
                className={`w-10 h-10 rounded border text-sm font-mono transition-all ${log.wastedTime === h ? 'border-red-500 bg-red-500/10 text-white' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}
              >
                {h}
              </button>
            ))}
          </div>
        </div>

        {/* Text Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Wins (Execution)</label>
            <textarea 
              rows={3}
              value={log.wins} onChange={(e) => setLog({...log, wins: e.target.value})}
              className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-sm text-white focus:border-cyan-500 focus:outline-none"
              placeholder="What did you actually complete?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Failures (Excuses)</label>
            <textarea 
              rows={3}
              value={log.failures} onChange={(e) => setLog({...log, failures: e.target.value})}
              className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-sm text-white focus:border-red-500 focus:outline-none"
              placeholder="Why didn't you do more?"
            />
          </div>
        </div>

        <button 
          onClick={handleSubmit}
          disabled={!log.wins && !log.failures}
          className="w-full bg-white text-black font-bold py-4 rounded hover:bg-zinc-200 transition-colors disabled:opacity-50"
        >
          Submit Log & Get Analysis
        </button>
      </div>
    </div>
  );
};

// --- ANALYTICS ---
const Analytics = ({ data }) => {
  // Mock data generation for visualization if logs are empty
  const displayLogs = data.logs.length > 0 ? data.logs : [];
  const [insight, setInsight] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const runDeepAnalysis = async () => {
    if (data.logs.length < 3) {
      setInsight("Not enough data points. Log at least 3 days to unlock pattern recognition.");
      return;
    }
    setAnalyzing(true);

    const logHistory = data.logs.map(l => 
      `Date: ${new Date(l.date).toDateString()}, Focus: ${l.focus}, Wins: ${l.wins}, Failures: ${l.failures}`
    ).join('\n');

    const context = `
      Analyze these user logs for hidden patterns. 
      Look for correlations between days, moods, and failures.
      Point out ONE specific recurring issue and ONE strength.
      Be highly analytical, like a data scientist.
      Logs:
      ${logHistory}
    `;

    const response = await generateAIResponse("Analyze Patterns", context);
    setInsight(response);
    setAnalyzing(false);
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-white/10 pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Data & Truth</h1>
          <p className="text-zinc-400">Numbers don't lie. Feelings do.</p>
        </div>
        <button 
          onClick={runDeepAnalysis}
          disabled={analyzing}
          className="hidden md:flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded text-sm transition-colors border border-white/5"
        >
          {analyzing ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Microscope size={16} />}
          {analyzing ? "Processing..." : "Run Pattern Analysis ✨"}
        </button>
      </div>

      {insight && (
        <div className="bg-zinc-900 border border-purple-500/30 p-6 rounded-xl animate-in slide-in-from-top-4">
           <h3 className="text-purple-400 font-mono text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
             <Lightbulb size={14} /> AI Insight
           </h3>
           <p className="text-zinc-300 leading-relaxed whitespace-pre-line">{insight}</p>
        </div>
      )}
      
      {/* Mobile button for analysis */}
      <button 
          onClick={runDeepAnalysis}
          disabled={analyzing}
          className="md:hidden w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-3 rounded text-sm transition-colors border border-white/5"
        >
          {analyzing ? "Processing..." : "Run Pattern Analysis ✨"}
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-zinc-900 p-6 rounded-xl border border-white/5">
            <h3 className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Current Streak</h3>
            <p className="text-4xl font-bold text-white">{data.streak} <span className="text-sm text-zinc-500 font-normal">days</span></p>
         </div>
         <div className="bg-zinc-900 p-6 rounded-xl border border-white/5">
            <h3 className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Total Logs</h3>
            <p className="text-4xl font-bold text-white">{data.logs.length}</p>
         </div>
         <div className="bg-zinc-900 p-6 rounded-xl border border-white/5">
            <h3 className="text-zinc-500 text-xs uppercase tracking-wider mb-2">System Health</h3>
            <p className="text-4xl font-bold text-cyan-400">{data.lifeScore}%</p>
         </div>
      </div>

      <div className="bg-zinc-900 p-8 rounded-xl border border-white/5">
        <h3 className="text-white font-bold mb-6">Focus Consistency</h3>
        <div className="h-40 flex items-end gap-2">
           {displayLogs.slice(-14).map((log, i) => (
             <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
               <div 
                  className={`w-full rounded-t transition-all duration-500 ${log.focus >= 7 ? 'bg-cyan-500' : 'bg-zinc-700'}`} 
                  style={{ height: `${log.focus * 10}%` }}
               ></div>
               <span className="text-xs text-zinc-600 font-mono hidden md:block">{new Date(log.date).getDate()}</span>
               {/* Tooltip */}
               <div className="absolute bottom-full mb-2 bg-black border border-zinc-700 p-2 text-xs text-white rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                 Score: {log.focus}/10
               </div>
             </div>
           ))}
           {displayLogs.length === 0 && (
             <div className="w-full h-full flex items-center justify-center text-zinc-600 text-sm italic border-2 border-dashed border-zinc-800 rounded">
               Not enough data to visualize trends.
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

// --- SETTINGS ---
const SettingsView = ({ user, setUser, resetData }) => {
  return (
    <div className="max-w-2xl space-y-8">
       <div className="border-b border-white/10 pb-6">
        <h1 className="text-3xl font-bold text-white mb-2">System Configuration</h1>
      </div>

      <div className="space-y-6">
        <div className="bg-zinc-900 p-6 rounded-xl border border-white/5">
          <h3 className="text-white font-medium mb-4">User Profile</h3>
          <div className="space-y-4">
             <div>
               <label className="text-sm text-zinc-500">Name</label>
               <input 
                 value={user.name} onChange={(e) => setUser({...user, name: e.target.value})}
                 className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white mt-1"
               />
             </div>
             <div>
               <label className="text-sm text-zinc-500">Feedback Mode</label>
               <div className="flex gap-2 mt-1">
                 {['Soft', 'Honest', 'Brutal'].map(s => (
                   <button 
                    key={s}
                    onClick={() => setUser({...user, style: s})}
                    className={`px-4 py-2 text-sm rounded border ${user.style === s ? 'border-cyan-500 text-cyan-500' : 'border-zinc-800 text-zinc-500'}`}
                   >
                     {s}
                   </button>
                 ))}
               </div>
             </div>
          </div>
        </div>

        <div className="bg-zinc-900 p-6 rounded-xl border border-red-900/20">
          <h3 className="text-red-400 font-medium mb-2">Danger Zone</h3>
          <p className="text-zinc-500 text-sm mb-4">This will wipe all local data including goals, logs, and stats.</p>
          <button onClick={resetData} className="border border-red-900 text-red-500 px-4 py-2 rounded text-sm hover:bg-red-900/10 transition-colors">
            Factory Reset System
          </button>
        </div>
        
        <div className="text-center text-zinc-700 text-xs font-mono pt-8">
           LifeOS Version 1.0.0 // Production Build <br/>
           Data stored locally. Privacy secured.
        </div>
      </div>
    </div>
  );
};