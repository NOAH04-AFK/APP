import React, { useState, useEffect } from 'react';
import { Layout, Cpu, Scan, BarChart2, Users, LogOut, Plus, Trash2, CheckCircle, AlertTriangle, X, Search, Filter, Monitor, Zap, ArrowRight, Star, Save, Folder, Clock, ChevronRight } from 'lucide-react';
import { ViewState, User, Build, PCComponent, ComponentType } from './types';
import { validateBuildWithGemini, estimatePerformance } from './services/geminiService';
import { Scanner } from './components/Scanner';
import { Forum } from './components/Forum';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// --- EXPANDED COMPONENT DB ---
const GENERATE_IMAGE = (text: string, color: string) => `https://placehold.co/150x150/${color}/FFF?text=${text.replace(/ /g, '+')}`;

const MOCK_PARTS: PCComponent[] = [
  // CPUs
  { id: 'cpu1', name: 'Intel Core i9-14900K', type: ComponentType.CPU, price: 589, specs: 'LGA1700, 24 Cores', image: GENERATE_IMAGE('i9-14900K', '007bff') },
  { id: 'cpu2', name: 'Intel Core i7-14700K', type: ComponentType.CPU, price: 409, specs: 'LGA1700, 20 Cores', image: GENERATE_IMAGE('i7-14700K', '007bff') },
  { id: 'cpu3', name: 'Intel Core i5-13600K', type: ComponentType.CPU, price: 299, specs: 'LGA1700, 14 Cores', image: GENERATE_IMAGE('i5-13600K', '007bff') },
  { id: 'cpu4', name: 'AMD Ryzen 9 7950X3D', type: ComponentType.CPU, price: 699, specs: 'AM5, 16 Cores', image: GENERATE_IMAGE('Ryzen+9', 'ff5722') },
  { id: 'cpu5', name: 'AMD Ryzen 7 7800X3D', type: ComponentType.CPU, price: 399, specs: 'AM5, 8 Cores', image: GENERATE_IMAGE('Ryzen+7', 'ff5722') },
  
  // GPUs
  { id: 'gpu1', name: 'NVIDIA RTX 4090', type: ComponentType.GPU, price: 1599, specs: '24GB GDDR6X', image: GENERATE_IMAGE('RTX+4090', '76b900') },
  { id: 'gpu2', name: 'NVIDIA RTX 4080 Super', type: ComponentType.GPU, price: 999, specs: '16GB GDDR6X', image: GENERATE_IMAGE('RTX+4080', '76b900') },
  { id: 'gpu3', name: 'NVIDIA RTX 4070 Ti', type: ComponentType.GPU, price: 799, specs: '12GB GDDR6X', image: GENERATE_IMAGE('RTX+4070', '76b900') },
  { id: 'gpu4', name: 'AMD Radeon RX 7900 XTX', type: ComponentType.GPU, price: 999, specs: '24GB GDDR6', image: GENERATE_IMAGE('RX+7900', 'e91e63') },
  { id: 'gpu5', name: 'AMD Radeon RX 7800 XT', type: ComponentType.GPU, price: 499, specs: '16GB GDDR6', image: GENERATE_IMAGE('RX+7800', 'e91e63') },

  // Motherboards
  { id: 'mb1', name: 'ASUS ROG Maximus Z790', type: ComponentType.MOTHERBOARD, price: 699, specs: 'LGA1700, E-ATX', image: GENERATE_IMAGE('Z790+ROG', '333') },
  { id: 'mb2', name: 'MSI MAG B760 Tomahawk', type: ComponentType.MOTHERBOARD, price: 189, specs: 'LGA1700, ATX', image: GENERATE_IMAGE('B760+MSI', '333') },
  { id: 'mb3', name: 'Gigabyte X670E AORUS', type: ComponentType.MOTHERBOARD, price: 499, specs: 'AM5, E-ATX', image: GENERATE_IMAGE('X670E', '333') },
  
  // RAM
  { id: 'ram1', name: 'Corsair Dominator 64GB', type: ComponentType.RAM, price: 289, specs: 'DDR5 6000MHz', image: GENERATE_IMAGE('DDR5+64G', '673ab7') },
  { id: 'ram2', name: 'G.Skill Trident Z5 32GB', type: ComponentType.RAM, price: 119, specs: 'DDR5 6000MHz', image: GENERATE_IMAGE('DDR5+32G', '673ab7') },
  { id: 'ram3', name: 'Kingston Fury 16GB', type: ComponentType.RAM, price: 69, specs: 'DDR4 3200MHz', image: GENERATE_IMAGE('DDR4+16G', '673ab7') },

  // Storage
  { id: 'sto1', name: 'Samsung 990 Pro 2TB', type: ComponentType.STORAGE, price: 169, specs: 'NVMe Gen5', image: GENERATE_IMAGE('SSD+2TB', '009688') },
  { id: 'sto2', name: 'WD Black SN850X 1TB', type: ComponentType.STORAGE, price: 99, specs: 'NVMe Gen4', image: GENERATE_IMAGE('SSD+1TB', '009688') },

  // PSU
  { id: 'psu1', name: 'Corsair RM1000x', type: ComponentType.PSU, price: 189, specs: '1000W Gold', image: GENERATE_IMAGE('1000W', 'ff9800') },
  { id: 'psu2', name: 'EVGA SuperNOVA 850W', type: ComponentType.PSU, price: 139, specs: '850W Gold', image: GENERATE_IMAGE('850W', 'ff9800') },

  // Case
  { id: 'case1', name: 'NZXT H9 Flow', type: ComponentType.CASE, price: 159, specs: 'Dual Chamber ATX', image: GENERATE_IMAGE('H9+Flow', '607d8b') },
  { id: 'case2', name: 'Lian Li O11 Dynamic', type: ComponentType.CASE, price: 149, specs: 'ATX Tempered Glass', image: GENERATE_IMAGE('O11+Dyn', '607d8b') },
];

// --- VISUAL COMPONENTS ---

const AnimatedBackground = () => (
    <>
        <div className="fixed inset-0 bg-[#020617] -z-20"></div>
        {/* Giant Logo in Background */}
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] animate-pulse pointer-events-none -z-10">
            <GameLogo size={800} />
        </div>
        {/* Grid Container */}
        <div className="cyber-grid-container">
            <div className="cyber-grid"></div>
        </div>
        {/* Particles */}
        {Array.from({length: 15}).map((_, i) => (
             <div key={i} className="particle" style={{
                 left: `${Math.random() * 100}%`,
                 width: `${Math.random() * 3 + 1}px`,
                 height: `${Math.random() * 3 + 1}px`,
                 animationDuration: `${10 + Math.random() * 20}s`,
                 animationDelay: `${Math.random() * 10}s`
             }} />
        ))}
    </>
);

const GameLogo = ({ size = 40 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">
    {/* Outer Ring (Pink Neon) */}
    <circle cx="50" cy="50" r="45" stroke="#ec4899" strokeWidth="2" className="opacity-80 drop-shadow-[0_0_5px_#ec4899]" />
    
    {/* Main Triangle (Cyan Neon) */}
    <path d="M50 15 L82 78 H18 Z" stroke="#06b6d4" strokeWidth="3" fill="none" strokeLinejoin="round" className="drop-shadow-[0_0_5px_#06b6d4]" />
    
    {/* Inner Tech Lines */}
    <path d="M50 25 L50 35" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" />
    <path d="M70 78 L65 68" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" />
    <path d="M30 78 L35 68" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" />

    {/* Center Chip */}
    <rect x="40" y="40" width="20" height="20" rx="4" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
    <path d="M44 45 H56 M44 50 H56 M44 55 H56" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" />
    
    {/* Corner Dots */}
    <circle cx="50" cy="15" r="2" fill="#fff" className="animate-pulse" />
    <circle cx="82" cy="78" r="2" fill="#fff" className="animate-pulse" />
    <circle cx="18" cy="78" r="2" fill="#fff" className="animate-pulse" />
  </svg>
);

// --- MAIN APP COMPONENT ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>(ViewState.AUTH);
  
  // Build State
  const [currentBuild, setCurrentBuild] = useState<Build>({
    id: 'temp',
    name: 'Mi PC Personalizada',
    components: [],
    totalPrice: 0
  });

  const [savedBuilds, setSavedBuilds] = useState<Build[]>([]);
  
  // Validation State
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{compatible: boolean, issues: string[]} | null>(null);

  // Benchmark State
  const [benchmarking, setBenchmarking] = useState(false);
  const [benchmarkData, setBenchmarkData] = useState<any>(null);

  // Component Filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Load saved builds on startup
  useEffect(() => {
    const saved = localStorage.getItem('pc_builder_saves');
    if (saved) {
      try {
        setSavedBuilds(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load builds", e);
      }
    }
  }, []);

  // Auth Handlers
  const handleGuestLogin = () => {
    setUser({ username: 'Invitado', isGuest: true });
    setView(ViewState.DASHBOARD);
  };
  
  const handleLogin = (username: string) => {
    setUser({ username, isGuest: false });
    setView(ViewState.DASHBOARD);
  };

  // Build Helpers
  const addComponent = (part: PCComponent) => {
    const updated = { ...currentBuild, components: [...currentBuild.components, part] };
    updated.totalPrice = updated.components.reduce((sum, p) => sum + p.price, 0);
    setCurrentBuild(updated);
    setValidationResult(null); 
    setBenchmarkData(null);
  };

  const removeComponent = (id: string) => {
    const updated = { ...currentBuild, components: currentBuild.components.filter(c => c.id !== id) };
    updated.totalPrice = updated.components.reduce((sum, p) => sum + p.price, 0);
    setCurrentBuild(updated);
    setValidationResult(null);
    setBenchmarkData(null);
  };

  const clearBuild = () => {
      setCurrentBuild({...currentBuild, components: [], totalPrice: 0});
      setValidationResult(null);
      setBenchmarkData(null);
  }

  const saveCurrentBuild = () => {
    if (currentBuild.components.length === 0) {
      alert("No puedes guardar una build vacía.");
      return;
    }
    const name = prompt("Nombre para esta configuración:", currentBuild.name);
    if (name) {
      const newBuild: Build = {
        ...currentBuild,
        id: Date.now().toString(),
        name: name,
        date: new Date().toLocaleDateString()
      };
      const updatedSaves = [newBuild, ...savedBuilds];
      setSavedBuilds(updatedSaves);
      localStorage.setItem('pc_builder_saves', JSON.stringify(updatedSaves));
      alert("Configuración guardada exitosamente.");
    }
  };

  const deleteSavedBuild = (id: string) => {
    if(confirm("¿Estás seguro de eliminar esta configuración?")) {
      const updatedSaves = savedBuilds.filter(b => b.id !== id);
      setSavedBuilds(updatedSaves);
      localStorage.setItem('pc_builder_saves', JSON.stringify(updatedSaves));
    }
  };

  const loadSavedBuild = (build: Build) => {
    setCurrentBuild({ ...build }); // Create copy to avoid ref issues
    setValidationResult(null);
    setBenchmarkData(null);
    setView(ViewState.BUILDER);
  };

  // AI Actions
  const runValidation = async () => {
    if (currentBuild.components.length === 0) return;
    setValidating(true);
    const result = await validateBuildWithGemini(currentBuild.components);
    setValidationResult(result);
    setValidating(false);
  };

  const runBenchmark = async () => {
    if (currentBuild.components.length === 0) return;
    setBenchmarking(true);
    const result = await estimatePerformance(currentBuild.components);
    setBenchmarkData(result);
    setBenchmarking(false);
  };

  // Filtering Logic
  const filteredParts = MOCK_PARTS.filter(part => {
      const matchesSearch = part.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'ALL' || part.type === selectedCategory;
      return matchesSearch && matchesCategory;
  });

  const categories = ['ALL', ...Object.values(ComponentType)];

  // Views
  if (view === ViewState.AUTH) {
    return (
        <>
            <AnimatedBackground />
            <AuthScreen onGuest={handleGuestLogin} onLogin={handleLogin} />
        </>
    );
  }

  if (view === ViewState.SCANNER) {
    return (
      <Scanner 
        onClose={() => setView(ViewState.BUILDER)} 
        onComponentFound={(c) => {
          addComponent(c);
          setView(ViewState.BUILDER);
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen font-sans text-gray-100 pb-20 relative overflow-hidden">
      <AnimatedBackground />
      
      {/* --- APP HEADER --- */}
      <header className="bg-slate-900/60 backdrop-blur-xl border-b border-slate-700/50 p-4 sticky top-0 z-50 flex justify-between items-center shadow-lg shadow-black/20">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView(ViewState.DASHBOARD)}>
            <div className="group-hover:rotate-180 transition-transform duration-700">
                <GameLogo size={40} />
            </div>
            <div>
                <h1 className="font-bold text-lg tracking-tight text-white leading-tight">PCBuilder<span className="text-cyan-400 text-glow">AI</span></h1>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white text-glow">{user?.username}</p>
                <div className="flex items-center justify-end gap-1">
                    <span className={`w-2 h-2 rounded-full ${user?.isGuest ? 'bg-gray-500' : 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]'}`}></span>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">{user?.isGuest ? 'Invitado' : 'Pro'}</p>
                </div>
            </div>
            <button onClick={() => setView(ViewState.AUTH)} className="p-2 text-slate-400 hover:text-red-400 transition hover:bg-white/5 rounded-lg">
                <LogOut size={20} />
            </button>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="p-4 max-w-7xl mx-auto relative z-10">
        
        {/* DASHBOARD OVERVIEW */}
        {view === ViewState.DASHBOARD && (
            <>
                <div className="mb-8 mt-4 animate-fade-in text-center lg:text-left">
                    <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Bienvenido, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">{user?.username}</span></h2>
                    <p className="text-slate-400 text-lg">Tu centro de comando para hardware de PC de próxima generación.</p>
                </div>

                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                    <DashboardCard 
                        title="Constructor AI" 
                        desc="Arma y valida compatibilidad"
                        icon={<Cpu size={32} />}
                        color="cyan"
                        onClick={() => setView(ViewState.BUILDER)}
                    />
                    <DashboardCard 
                        title="Escáner Inteligente" 
                        desc="Identifica hardware con cámara"
                        icon={<Scan size={32} />}
                        color="purple"
                        onClick={() => setView(ViewState.SCANNER)}
                    />
                    <DashboardCard 
                        title="Mis Builds" 
                        desc="Ver configuraciones guardadas"
                        icon={<Folder size={32} />}
                        color="pink"
                        onClick={() => setView(ViewState.SAVED_BUILDS)}
                    />
                    <DashboardCard 
                        title="Benchmark AI" 
                        desc="Estima FPS y rendimiento"
                        icon={<BarChart2 size={32} />}
                        color="blue"
                        onClick={() => setView(ViewState.BENCHMARK)}
                    />
                </div>

                {/* Promo Area */}
                <div className="mt-10 p-8 rounded-3xl bg-gradient-to-r from-indigo-900/60 to-purple-900/60 backdrop-blur-md border border-indigo-500/30 relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <Star className="text-yellow-400 fill-yellow-400" size={16} />
                            <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Build de la Semana</h3>
                        </div>
                        <h3 className="text-3xl font-black text-white mb-2">HyperBeast V2 <span className="text-cyan-400">Project</span></h3>
                        <p className="text-indigo-100/80 text-base max-w-xl mb-6">La configuración definitiva con i9-14900K y RTX 4090. Optimizada por AI para flujo de aire máximo y ruido mínimo.</p>
                        <button onClick={() => setView(ViewState.FORUM)} className="bg-white text-indigo-900 px-6 py-3 rounded-xl text-sm font-bold hover:bg-cyan-50 transition shadow-[0_0_20px_rgba(255,255,255,0.3)]">Ver en el Foro</button>
                    </div>
                    <Cpu className="absolute -right-10 -bottom-10 text-white/5 w-80 h-80 rotate-12 group-hover:scale-110 transition-transform duration-700" />
                </div>
            </>
        )}

        {/* BUILDER VIEW */}
        {view === ViewState.BUILDER && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-[calc(100vh-140px)]">
                
                {/* Left Column: Build List */}
                <div className="lg:col-span-4 flex flex-col gap-4 lg:h-full animate-fade-in">
                    <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-700/50 flex flex-col h-[500px] lg:h-full overflow-hidden">
                        <div className="p-4 border-b border-slate-700/50 bg-black/20 flex justify-between items-center sticky top-0">
                            <div>
                                <h2 className="font-bold text-base text-white flex items-center gap-2"><Monitor size={16} className="text-cyan-400"/> Tu Configuración</h2>
                                <p className="text-[10px] text-slate-400">{currentBuild.components.length} componentes</p>
                            </div>
                            <div className="text-right">
                                <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-bold">Total</span>
                                <span className="font-mono font-bold text-xl text-cyan-400 text-glow">${currentBuild.totalPrice}</span>
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                            {currentBuild.components.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-500 p-8 text-center border-2 border-dashed border-slate-700/50 rounded-lg m-2 bg-slate-800/20">
                                    <Monitor size={48} className="mb-4 opacity-30" />
                                    <p className="font-medium text-slate-400">Tu PC está vacía</p>
                                    <p className="text-xs mt-1 opacity-60">Selecciona componentes del panel derecho.</p>
                                </div>
                            ) : (
                                currentBuild.components.map((c) => (
                                    <div key={c.id} className="bg-slate-800/40 hover:bg-slate-800/80 p-2 rounded-lg flex items-center gap-2 border border-slate-700/50 hover:border-cyan-500/50 transition group backdrop-blur-sm">
                                        <img src={c.image || GENERATE_IMAGE(c.name, '333')} alt={c.name} className="w-10 h-10 rounded bg-slate-900 object-cover" />
                                        <div className="flex-1 min-w-0">
                                            <span className="text-[9px] font-bold text-cyan-400 uppercase block tracking-wider leading-none mb-0.5">{c.type}</span>
                                            <span className="text-xs font-medium text-white truncate block">{c.name}</span>
                                            <span className="text-[10px] text-slate-400 truncate block leading-tight">{c.specs}</span>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="text-xs font-bold text-white">${c.price}</span>
                                            <button onClick={() => removeComponent(c.id)} className="text-slate-500 hover:text-red-400 transition p-1">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Actions Footer */}
                        <div className="p-3 bg-black/20 border-t border-slate-700/50 backdrop-blur-xl">
                             {/* Validation Result */}
                             {validationResult && (
                                <div className={`mb-3 p-2 rounded-lg border flex items-start gap-2 ${validationResult.compatible ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                                    <div className="mt-0.5">
                                        {validationResult.compatible ? <CheckCircle className="text-green-500" size={16}/> : <AlertTriangle className="text-red-500" size={16}/>}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={`font-bold text-xs ${validationResult.compatible ? 'text-green-400' : 'text-red-400'}`}>
                                            {validationResult.compatible ? 'Compatible' : 'Incompatible'}
                                        </h3>
                                        {!validationResult.compatible && (
                                            <ul className="list-disc ml-4 text-[10px] text-red-300 mt-1 space-y-1">
                                                {validationResult.issues.map((issue, idx) => <li key={idx}>{issue}</li>)}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-3 gap-2">
                                <button 
                                    onClick={clearBuild}
                                    className="px-2 py-2.5 rounded-lg font-bold text-slate-400 bg-slate-800/50 hover:bg-slate-700/50 transition text-xs border border-slate-700/50"
                                >
                                    Limpiar
                                </button>
                                <button
                                    onClick={saveCurrentBuild}
                                    className="px-2 py-2.5 rounded-lg font-bold text-cyan-400 bg-cyan-950/30 hover:bg-cyan-900/50 transition text-xs border border-cyan-500/30 flex items-center justify-center gap-1"
                                >
                                    <Save size={14} /> Guardar
                                </button>
                                <button 
                                    onClick={runValidation}
                                    disabled={validating || currentBuild.components.length === 0}
                                    className={`px-2 py-2.5 rounded-lg font-bold text-white transition flex items-center justify-center gap-2 text-xs shadow-lg shadow-indigo-500/20 border border-transparent ${
                                        validating ? 'bg-slate-600 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-indigo-500/30'
                                    }`}
                                >
                                    {validating ? <Zap size={14} className="animate-spin" /> : <Zap size={14} />}
                                    {validating ? 'Validar' : 'Validar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Component Picker */}
                <div className="lg:col-span-8 flex flex-col gap-4 h-full overflow-hidden animate-fade-in" style={{animationDelay: '0.1s'}}>
                    <div className="flex flex-col gap-4 sticky top-0 z-10 pb-2">
                        {/* Search Bar */}
                        <div className="relative group">
                            <Search className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-cyan-400 transition-colors" size={20} />
                            <input 
                                type="text" 
                                placeholder="Buscar componentes (ej. RTX 4090, i9...)" 
                                className="w-full bg-slate-900/60 backdrop-blur-xl border border-slate-700 text-white pl-12 pr-4 py-3 rounded-2xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition placeholder-slate-500 shadow-lg"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Categories */}
                        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                            {categories.map(cat => (
                                <button 
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition border backdrop-blur-md ${
                                        selectedCategory === cat 
                                        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.3)]' 
                                        : 'bg-slate-900/40 text-slate-400 border-slate-700 hover:bg-slate-800/60'
                                    }`}
                                >
                                    {cat === 'ALL' ? 'Todos' : cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 pb-20">
                            {filteredParts.length === 0 ? (
                                <div className="col-span-full text-center text-slate-500 py-10 bg-slate-900/20 rounded-2xl border border-slate-800 border-dashed">
                                    No se encontraron componentes.
                                </div>
                            ) : (
                                filteredParts.map(part => (
                                    <button 
                                        key={part.id}
                                        onClick={() => addComponent(part)}
                                        className="bg-slate-900/40 backdrop-blur-md p-3 rounded-2xl border border-slate-700/50 hover:border-cyan-500/50 hover:bg-slate-800/60 transition group text-left flex flex-col h-full shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-1 duration-300"
                                    >
                                        <div className="flex items-start gap-3 mb-2">
                                            <img src={part.image} alt={part.name} className="w-16 h-16 rounded-xl bg-slate-950 object-cover border border-slate-700/50 group-hover:border-cyan-500/30 transition" />
                                            <div>
                                                <span className="text-[10px] text-cyan-500 font-bold uppercase tracking-wider">{part.type}</span>
                                                <h4 className="font-bold text-sm text-gray-100 leading-tight line-clamp-2 mt-0.5 group-hover:text-cyan-200 transition">{part.name}</h4>
                                            </div>
                                        </div>
                                        <div className="mt-auto pt-3 flex justify-between items-center border-t border-white/5 w-full">
                                            <p className="text-[10px] text-slate-400 truncate max-w-[60%] font-medium">{part.specs}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-white text-sm">${part.price}</span>
                                                <div className="w-7 h-7 bg-cyan-500 rounded-lg flex items-center justify-center text-slate-900 shadow-[0_0_10px_rgba(6,182,212,0.4)] group-hover:scale-110 transition">
                                                    <Plus size={16} strokeWidth={3} />
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* SAVED BUILDS VIEW */}
        {view === ViewState.SAVED_BUILDS && (
            <div className="animate-fade-in max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => setView(ViewState.DASHBOARD)} className="bg-slate-800 p-2 rounded-lg hover:bg-slate-700 transition">
                        <ChevronRight className="rotate-180" />
                    </button>
                    <h2 className="text-3xl font-black text-white">Mis Builds Guardadas</h2>
                </div>

                {savedBuilds.length === 0 ? (
                    <div className="text-center py-20 bg-slate-900/60 rounded-3xl border border-slate-700/50 backdrop-blur-xl">
                        <Folder size={64} className="mx-auto text-slate-600 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No tienes configuraciones guardadas</h3>
                        <p className="text-slate-400 mb-6">Ve al constructor y guarda tu primera PC.</p>
                        <button onClick={() => setView(ViewState.BUILDER)} className="bg-cyan-600 px-6 py-3 rounded-xl text-white font-bold hover:bg-cyan-500 transition">
                            Ir al Constructor
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {savedBuilds.map((build) => (
                            <div key={build.id} className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-cyan-500/30 transition shadow-lg group">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-white group-hover:text-cyan-400 transition">{build.name}</h3>
                                        <div className="flex items-center gap-2 text-slate-400 text-xs mt-1">
                                            <Clock size={12} />
                                            <span>{build.date || 'Reciente'}</span>
                                        </div>
                                    </div>
                                    <span className="bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full text-sm font-mono font-bold border border-cyan-500/20">
                                        ${build.totalPrice}
                                    </span>
                                </div>
                                
                                <div className="space-y-2 mb-6">
                                    {build.components.slice(0, 3).map(c => (
                                        <div key={c.id} className="flex items-center gap-2 text-sm text-slate-300">
                                            <div className="w-1.5 h-1.5 bg-slate-500 rounded-full"></div>
                                            <span className="truncate">{c.name}</span>
                                        </div>
                                    ))}
                                    {build.components.length > 3 && (
                                        <p className="text-xs text-slate-500 pl-3.5">+ {build.components.length - 3} componentes más</p>
                                    )}
                                </div>

                                <div className="flex gap-3 mt-auto">
                                    <button 
                                        onClick={() => loadSavedBuild(build)}
                                        className="flex-1 bg-slate-700 hover:bg-cyan-600 hover:text-white text-slate-200 py-2 rounded-lg text-sm font-bold transition flex justify-center items-center gap-2"
                                    >
                                        <Monitor size={16} /> Cargar
                                    </button>
                                    <button 
                                        onClick={() => deleteSavedBuild(build.id)}
                                        className="px-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {/* BENCHMARK VIEW */}
        {view === ViewState.BENCHMARK && (
             <div className="max-w-4xl mx-auto animate-fade-in">
                 <div className="bg-slate-900/60 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-slate-700/50">
                    <div className="flex items-center gap-4 mb-6 border-b border-slate-700/50 pb-6">
                        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-4 rounded-2xl shadow-lg shadow-purple-500/20">
                            <BarChart2 className="text-white" size={32}/>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white">Predicción de Rendimiento</h2>
                            <p className="text-slate-400 text-sm">Análisis predictivo basado en benchmarks reales</p>
                        </div>
                    </div>

                    {!benchmarkData ? (
                         <div className="text-center py-10">
                            {currentBuild.components.length === 0 ? (
                                <div className="space-y-4">
                                    <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-700/50">
                                        <Monitor className="text-slate-500" size={40} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">No hay PC para analizar</h3>
                                    <p className="text-slate-400 mb-6 max-w-sm mx-auto">Tu banco de pruebas está vacío. Construye tu PC primero.</p>
                                    <button 
                                        onClick={() => setView(ViewState.BUILDER)}
                                        className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 mx-auto shadow-lg shadow-cyan-500/20"
                                    >
                                        Ir al Constructor <ArrowRight size={18} />
                                    </button>
                                </div>
                            ) : (
                                <div className="animate-fade-in">
                                    <div className="bg-black/30 p-6 rounded-2xl border border-slate-700/50 mb-8 max-w-lg mx-auto text-left backdrop-blur-sm">
                                        <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-4 border-b border-white/5 pb-2">Analizando Configuración:</h3>
                                        <ul className="space-y-2">
                                            {currentBuild.components.slice(0, 5).map(c => (
                                                <li key={c.id} className="flex justify-between text-sm pb-1">
                                                    <span className="text-slate-400">{c.type}:</span>
                                                    <span className="text-white font-medium truncate ml-2 text-right">{c.name}</span>
                                                </li>
                                            ))}
                                            {currentBuild.components.length > 5 && (
                                                <li className="text-xs text-center text-slate-500 pt-2 border-t border-white/5 mt-2">+ {currentBuild.components.length - 5} componentes más</li>
                                            )}
                                        </ul>
                                    </div>
                                    
                                    <button 
                                        onClick={runBenchmark}
                                        disabled={benchmarking}
                                        className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-white transition flex items-center justify-center gap-3 mx-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-105 shadow-xl shadow-purple-500/30 border border-purple-500/30"
                                    >
                                        {benchmarking ? (
                                            <>
                                                <Scan className="animate-spin" /> Simulando Rendimiento...
                                            </>
                                        ) : (
                                            'Calcular FPS Estimados'
                                        )}
                                    </button>
                                </div>
                            )}
                         </div>
                    ) : (
                        <div className="animate-fade-in space-y-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-slate-900/50 p-6 rounded-2xl text-center border border-purple-500/30 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-purple-500/10 group-hover:bg-purple-500/20 transition"></div>
                                    <span className="block text-purple-400 text-xs uppercase font-bold tracking-widest mb-2">Gaming Score</span>
                                    <span className="text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">{benchmarkData.gamingScore}</span>
                                </div>
                                <div className="bg-slate-900/50 p-6 rounded-2xl text-center border border-blue-500/30 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-blue-500/10 group-hover:bg-blue-500/20 transition"></div>
                                    <span className="block text-blue-400 text-xs uppercase font-bold tracking-widest mb-2">Workstation</span>
                                    <span className="text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">{benchmarkData.workstationScore}</span>
                                </div>
                            </div>

                            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-4 backdrop-blur-sm">
                                <div className="bg-amber-500/20 p-2 rounded-lg">
                                    <AlertTriangle className="text-amber-500 shrink-0" />
                                </div>
                                <div>
                                    <h4 className="text-amber-400 font-bold text-sm uppercase tracking-wide">Análisis de Cuello de Botella</h4>
                                    <p className="text-amber-100/90 text-sm mt-1">{benchmarkData.bottleneck}</p>
                                </div>
                            </div>

                            <div className="h-80 w-full bg-slate-900/40 p-6 rounded-2xl border border-slate-700/50">
                                <h4 className="text-slate-400 text-xs font-bold uppercase mb-6 flex items-center gap-2"><Monitor size={14}/> Estimación de FPS (1440p Ultra)</h4>
                                <ResponsiveContainer width="100%" height="90%">
                                    <BarChart data={benchmarkData.estimatedFPS}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                                        <XAxis dataKey="game" tick={{fontSize: 12, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                                        <YAxis tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                                        <Tooltip 
                                            contentStyle={{backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc', boxShadow: '0 4px 20px rgba(0,0,0,0.5)'}}
                                            cursor={{fill: '#334155', opacity: 0.4}}
                                        />
                                        <Bar dataKey="fps" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={50} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            
                            <button onClick={() => setBenchmarkData(null)} className="text-slate-500 text-sm hover:text-white underline mx-auto block hover:text-glow transition">
                                Realizar nueva prueba
                            </button>
                        </div>
                    )}
                 </div>
             </div>
        )}

        {/* FORUM VIEW */}
        {view === ViewState.FORUM && (
            <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden min-h-[80vh]">
                 <Forum user={user} currentBuild={currentBuild} />
            </div>
        )}

      </main>

      {/* --- BOTTOM NAVIGATION (MOBILE) --- */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-xl border-t border-slate-700/50 flex justify-around p-3 z-50 md:hidden pb-safe">
        <NavButton active={view === ViewState.DASHBOARD} onClick={() => setView(ViewState.DASHBOARD)} icon={<Layout size={24} />} label="Inicio" />
        <NavButton active={view === ViewState.BUILDER} onClick={() => setView(ViewState.BUILDER)} icon={<Cpu size={24} />} label="Build" />
        <div className="-mt-10">
             <button onClick={() => setView(ViewState.SCANNER)} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-4 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.6)] border-4 border-slate-900 active:scale-95 transition hover:scale-110">
                <Scan size={24} />
             </button>
        </div>
        <NavButton active={view === ViewState.BENCHMARK} onClick={() => setView(ViewState.BENCHMARK)} icon={<BarChart2 size={24} />} label="Stats" />
        <NavButton active={view === ViewState.FORUM} onClick={() => setView(ViewState.FORUM)} icon={<Users size={24} />} label="Foro" />
      </nav>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.5); 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569; 
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #06b6d4; 
        }
        .pb-safe {
            padding-bottom: env(safe-area-inset-bottom, 20px);
        }
      `}</style>
    </div>
  );
}

const DashboardCard = ({ title, desc, icon, color, onClick }: any) => {
    const colorClasses: any = {
        cyan: 'bg-cyan-500/5 text-cyan-400 border-cyan-500/20 hover:border-cyan-500/50 hover:bg-cyan-500/10 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]',
        purple: 'bg-purple-500/5 text-purple-400 border-purple-500/20 hover:border-purple-500/50 hover:bg-purple-500/10 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]',
        blue: 'bg-blue-500/5 text-blue-400 border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-500/10 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]',
        orange: 'bg-orange-500/5 text-orange-400 border-orange-500/20 hover:border-orange-500/50 hover:bg-orange-500/10 hover:shadow-[0_0_20px_rgba(249,115,22,0.15)]',
        pink: 'bg-pink-500/5 text-pink-400 border-pink-500/20 hover:border-pink-500/50 hover:bg-pink-500/10 hover:shadow-[0_0_20px_rgba(236,72,153,0.15)]',
    };

    return (
        <button 
            onClick={onClick}
            className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col items-center text-center gap-4 group h-full hover:-translate-y-2 backdrop-blur-sm ${colorClasses[color]}`}
        >
            <div className={`w-18 h-18 p-4 rounded-2xl flex items-center justify-center bg-slate-900/80 group-hover:scale-110 transition-transform duration-300 shadow-inner border border-white/5`}>
                {icon}
            </div>
            <div>
                <h3 className="font-bold text-xl text-white group-hover:text-glow transition-all">{title}</h3>
                <p className="text-slate-400 text-sm mt-2 leading-relaxed">{desc}</p>
            </div>
        </button>
    )
}

const NavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
    <button 
        onClick={onClick} 
        className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-cyan-400 scale-110' : 'text-slate-500 hover:text-slate-300'}`}
    >
        {icon}
        <span className="text-[10px] font-medium">{label}</span>
    </button>
);

const AuthScreen = ({ onGuest, onLogin }: { onGuest: () => void, onLogin: (name: string) => void }) => {
    const [isRegister, setIsRegister] = useState(false);
    const [name, setName] = useState('');

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative z-10">
            <div className="bg-slate-900/70 border border-slate-700/50 w-full max-w-md rounded-3xl p-8 shadow-2xl relative z-10 backdrop-blur-xl animate-fade-in">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-6 relative">
                        <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full"></div>
                        <div className="p-6 bg-slate-950/80 rounded-3xl shadow-2xl shadow-cyan-500/20 border border-cyan-500/30 relative z-10">
                            <GameLogo size={80} />
                        </div>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight">PCBuilder<span className="text-cyan-400 text-glow">AI</span></h1>
                    <p className="text-slate-400 mt-2 text-sm font-medium tracking-wide">THE FUTURE OF PC BUILDING</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <input 
                            type="text" 
                            placeholder="Nombre de usuario" 
                            className="w-full bg-black/40 border border-slate-700 text-white p-4 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition placeholder-slate-500 text-center"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    {isRegister && (
                         <input 
                         type="password" 
                         placeholder="Contraseña" 
                         className="w-full bg-black/40 border border-slate-700 text-white p-4 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition placeholder-slate-500 text-center"
                     />
                    )}

                    <button 
                        onClick={() => name ? onLogin(name) : alert('Ingresa un nombre')}
                        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-cyan-500/25 transition transform active:scale-95 border border-cyan-400/20"
                    >
                        {isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}
                    </button>

                    <button 
                        onClick={onGuest}
                        className="w-full bg-white/5 border border-white/10 text-slate-300 font-semibold py-4 rounded-xl hover:bg-white/10 transition"
                    >
                        Continuar como Invitado
                    </button>
                </div>

                <div className="mt-8 text-center pt-6 border-t border-slate-700/50">
                    <button 
                        onClick={() => setIsRegister(!isRegister)}
                        className="text-sm text-cyan-400 font-medium hover:text-cyan-300 transition hover:underline"
                    >
                        {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿Nuevo aquí? Crea una cuenta gratis'}
                    </button>
                </div>
            </div>
        </div>
    )
}