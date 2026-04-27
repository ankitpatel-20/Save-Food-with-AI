/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent, ReactNode } from 'react';
import { 
  Package, 
  Users, 
  MapPin, 
  Clock, 
  ArrowRight, 
  Truck, 
  CheckCircle2, 
  AlertTriangle,
  Leaf,
  Plus,
  Loader2,
  ChevronRight,
  TrendingUp,
  Globe,
  Map as MapIcon,
  RefreshCw,
  Trash2,
  X,
  PieChart as PieIcon,
  BarChart as BarIcon,
  Activity,
  Mail,
  Phone,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  Legend 
} from 'recharts';
import { FoodItem, Recipient, AllocationPlan } from './types';
import { generateAllocationPlan } from './lib/gemini';
import MapComponent from './components/MapComponent';
import AIChatAgent from './components/AIChatAgent';

// Mock Recipients with NYC coordinates
const MOCK_RECIPIENTS: Recipient[] = [
  { 
    id: 'r1', 
    name: 'Downtown Shelter', 
    type: 'Shelter', 
    needs: 'Cooked meals', 
    capacity: 50, 
    location: '456 Main St', 
    distance: 2.4, 
    urgency: 9, 
    coordinates: [40.7228, -74.0060],
    description: "Centrally located shelter focused on providing immediate hot meals to the homeless population in Lower Manhattan.",
    hours: "Open 24/7",
    contact: "+1 (212) 555-0101",
    lastActivity: "20 mins ago"
  },
  { 
    id: 'r2', 
    name: 'Hope Food Bank', 
    type: 'NGO', 
    needs: 'Dry goods, Vegetables', 
    capacity: 200, 
    location: '789 Hope Ave', 
    distance: 5.1, 
    urgency: 7, 
    coordinates: [40.7328, -74.0160],
    description: "One of the largest food distribution centers in the area, specializing in long-term storage and bulk distribution of non-perishables.",
    hours: "09:00 AM - 06:00 PM",
    contact: "+1 (212) 555-0102",
    lastActivity: "1 hour ago"
  },
  { 
    id: 'r3', 
    name: 'Community Kitchen', 
    type: 'Community Center', 
    needs: 'Fresh produce, Bread', 
    capacity: 30, 
    location: '101 Peace St', 
    distance: 1.2, 
    urgency: 8, 
    coordinates: [40.7028, -73.9960] ,
    description: "A local hub that prepares and serves over 500 meals daily to elderly residents and low-income families.",
    hours: "07:00 AM - 08:00 PM",
    contact: "+1 (212) 555-0103",
    lastActivity: "45 mins ago"
  },
  { 
    id: 'r4', 
    name: 'Mercy NGO', 
    type: 'NGO', 
    needs: 'Dairy, Perishables', 
    capacity: 100, 
    location: '202 Grace Rd', 
    distance: 8.5, 
    urgency: 6, 
    coordinates: [40.7128, -73.9860],
    description: "Mercy NGO specializes in refrigerated transport and distribution of dairy and fresh meats to smaller local pantries.",
    hours: "06:00 AM - 10:00 PM",
    contact: "+1 (212) 555-0104",
    lastActivity: "3 hours ago"
  },
  { 
    id: 'r5', 
    name: 'St. Marys Kitchen', 
    type: 'NGO', 
    needs: 'Frozen foods', 
    capacity: 150, 
    location: '303 Saint St', 
    distance: 4.2, 
    urgency: 5, 
    coordinates: [40.7428, -73.9760],
    description: "Equipped with industrial freezer storage, St. Marys acts as a critical link for frozen meat and vegetable donations.",
    hours: "08:00 AM - 04:00 PM",
    lastActivity: "5 hours ago"
  },
  { 
    id: 'r6', 
    name: 'Harlem Youth Center', 
    type: 'Community Center', 
    needs: 'Snacks, Fruits', 
    capacity: 80, 
    location: '125th St', 
    distance: 6.7, 
    urgency: 9, 
    coordinates: [40.8116, -73.9465],
    description: "Providing after-school meals and nutritional support to over 200 students daily in the Harlem area.",
    hours: "02:00 PM - 09:00 PM",
    lastActivity: "Active"
  },
  { 
    id: 'r7', 
    name: 'East Side Pantry', 
    type: 'NGO', 
    needs: 'Canned goods', 
    capacity: 300, 
    location: '1st Ave', 
    distance: 3.8, 
    urgency: 4, 
    coordinates: [40.7644, -73.9591],
    description: "A major volunteer-run pantry supporting the Upper East Side's low-income families and senior citizens.",
    hours: "10:00 AM - 02:00 PM",
    lastActivity: "Closed"
  },
  { 
    id: 'r8', 
    name: 'Brooklyn Table', 
    type: 'Shelter', 
    needs: 'Hot meals', 
    capacity: 60, 
    location: 'Fulton St', 
    distance: 5.5, 
    urgency: 10, 
    coordinates: [40.6932, -73.9851],
    description: "Critical emergency shelter in Brooklyn providing immediate food and bedding to displaced individuals.",
    hours: "Open 24/7",
    lastActivity: "Live"
  },
  { id: 'r9', name: 'Queens Family', type: 'NGO', needs: 'Baby food, Milk', capacity: 120, location: 'Queens Blvd', distance: 9.2, urgency: 8, coordinates: [40.7282, -73.8448] },
  { id: 'r10', name: 'Bronx Unity', type: 'Community Center', needs: 'Fresh veg', capacity: 45, location: 'Grand Concourse', distance: 11.5, urgency: 7, coordinates: [40.8273, -73.9225] },
  { id: 'r11', name: 'West Village Care', type: 'Shelter', needs: 'Sandwiches', capacity: 25, location: 'Bleecker St', distance: 1.8, urgency: 9, coordinates: [40.7323, -74.0017] },
  { id: 'r12', name: 'SoHo Hub', type: 'Community Center', needs: 'Baked goods', capacity: 40, location: 'Broadway', distance: 0.9, urgency: 6, coordinates: [40.7233, -74.0030] },
  { id: 'r13', name: 'Tribeca Support', type: 'NGO', needs: 'Pet food', capacity: 50, location: 'Canal St', distance: 1.4, urgency: 3, coordinates: [40.7194, -74.0048] },
  { id: 'r14', name: 'Financial Pantry', type: 'NGO', needs: 'Ready meals', capacity: 70, location: 'Wall St', distance: 2.1, urgency: 8, coordinates: [40.7060, -74.0088] },
  { id: 'r15', name: 'LES Solidarity', type: 'Shelter', needs: 'Soup, Salad', capacity: 40, location: 'Delancey St', distance: 2.3, urgency: 9, coordinates: [40.7186, -73.9881] },
  { id: 'r16', name: 'Midtown Mission', type: 'NGO', needs: 'Breakfast items', capacity: 200, location: '42nd St', distance: 4.5, urgency: 7, coordinates: [40.7589, -73.9851] },
  { id: 'r17', name: 'Hells Help', type: 'Community Center', needs: 'Pasta, Rice', capacity: 55, location: '9th Ave', distance: 4.8, urgency: 5, coordinates: [40.7622, -73.9915] },
  { id: 'r18', name: 'Central Hub', type: 'NGO', needs: 'Organic meat', capacity: 30, location: 'CPW', distance: 5.2, urgency: 2, coordinates: [40.7812, -73.9665] },
  { id: 'r19', name: 'Morningside', type: 'Shelter', needs: 'Hot coffee, Tea', capacity: 35, location: 'W 116th St', distance: 7.1, urgency: 9, coordinates: [40.8077, -73.9627] },
  { id: 'r20', name: 'Inwood Family', type: 'NGO', needs: 'Grains, Legumes', capacity: 90, location: 'Dyckman St', distance: 13.2, urgency: 4, coordinates: [40.8647, -73.9272] },
  { id: 'r21', name: 'UWS Volunteers', type: 'Community Center', needs: 'Desserts', capacity: 40, location: 'W 72nd St', distance: 5.8, urgency: 3, coordinates: [40.7789, -73.9814] },
  { id: 'r22', name: 'Bleecker Meals', type: 'Shelter', needs: 'Pizza, Pasta', capacity: 45, location: 'Bleecker St', distance: 1.7, urgency: 8, coordinates: [40.7303, -74.0007] },
];

const MOCK_DONORS = [
  'Harvest Gourmet',
  'City Bakery',
  'Fresh Market',
  'Green Grocer',
  'Organic Hub',
  'Metro Food'
];

type AppView = 'donations' | 'partners' | 'map' | 'impact';

export default function App() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allocation, setAllocation] = useState<AllocationPlan | null>(null);
  const [showMap, setShowMap] = useState(true);
  const [activeTab, setActiveTab] = useState<AppView>('donations');
  const [pulseTime, setPulseTime] = useState(new Date().toLocaleTimeString());
  const [liveStats, setLiveStats] = useState({
    waste: 1.2,
    people: 4820,
    co2: 3.1,
    ngos: 124
  });

  // Simulation of "Real-time" pulse
  useEffect(() => {
    // Initial "Sync" simulation
    const initialSync = setTimeout(() => {
      setLiveStats(prev => ({
        ...prev,
        waste: +(prev.waste + 0.05).toFixed(3),
        people: prev.people + 12,
        co2: +(prev.co2 + 0.2).toFixed(1),
        ngos: prev.ngos + 1
      }));
    }, 1500);

    const pulseTimer = setInterval(() => {
      setPulseTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      // Subtle fluctuations for realism
      setLiveStats(prev => ({
        ...prev,
        waste: +(prev.waste + (Math.random() * 0.005)).toFixed(3),
        people: prev.people + (Math.random() > 0.8 ? 1 : 0)
      }));
    }, 4000);
    return () => {
      clearInterval(pulseTimer);
      clearTimeout(initialSync);
    };
  }, []);
  
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("ALLOCATION ENGINE OPTIMIZED");
  const [showProfile, setShowProfile] = useState(false);
  
  const [formData, setFormData] = useState<Omit<FoodItem, 'id'>>({
    donorName: 'Harvest Gourmet',
    type: 'Assorted Pastries and Sandwiches',
    quantity: '15 kg (approx. 60 units)',
    expiryTime: 'Expires in 4 hours',
    location: '123 Baker Bay',
    coordinates: [40.7128, -74.0060]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (formData.donorName.length < 3) newErrors.donorName = "Min 3 characters";
    if (!formData.type.trim()) newErrors.type = "Type is required";
    if (!/\d/.test(formData.quantity)) newErrors.quantity = "Must include number (e.g. 10kg)";
    if (!formData.expiryTime.trim()) newErrors.expiryTime = "Expiry window required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitDonation = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const donation: FoodItem = { ...formData, id: 'd-' + Date.now() };
      const plan = await generateAllocationPlan(donation, MOCK_RECIPIENTS);
      setAllocation(plan);
      setErrors({}); // Clear errors on success

      // Update global live stats based on the new donation
      const addedWeight = parseFloat(donation.quantity) / 1000 || 0.015;
      const addedPeople = plan.impactSummary.peopleFed || 12;
      
      setLiveStats(prev => ({
        ...prev,
        waste: +(prev.waste + addedWeight).toFixed(3),
        people: prev.people + addedPeople,
        co2: +(prev.co2 + (addedWeight * 2.5)).toFixed(1) // Assuming 2.5kg CO2 per kg food
      }));

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      
      // Reset form (optional, decided to keep it for quick testing but clearing is cleaner)
      setFormData({
        donorName: '',
        type: '',
        quantity: '',
        expiryTime: '',
        location: '123 Baker Bay',
        coordinates: [40.7128, -74.0060]
      });

    } catch (error) {
      console.error("Allocation failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);

  const handleClearAllocation = () => {
    setAllocation(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-600 selection:text-white flex flex-col">
      {/* Sidebar / Navigation */}
      <nav className="fixed top-0 left-0 h-full w-16 bg-slate-900 flex flex-col items-center py-6 gap-6 z-50 overflow-hidden">
        {/* Toast Notification */}
        <AnimatePresence>
          {showToast && (
            <motion.div 
              initial={{ opacity: 0, y: 50, x: 80 }}
              animate={{ opacity: 1, y: 0, x: 80 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed bottom-12 left-0 z-[60] bg-slate-900 border border-slate-700 text-white px-4 py-2.5 rounded-lg shadow-2xl flex items-center gap-3 text-xs font-bold"
            >
              <div className="w-6 h-6 bg-emerald-600 rounded flex items-center justify-center">
                <CheckCircle2 size={14} />
              </div>
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>
        <div 
          onClick={() => setActiveTab('donations')}
          className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-900/20 cursor-pointer active:scale-95 transition-transform"
        >
          S
        </div>
        <div className="flex flex-col gap-4 flex-1">
          <button 
            onClick={() => setActiveTab('donations')}
            className={`p-2.5 rounded-lg transition-all ${activeTab === 'donations' ? 'text-emerald-500 bg-slate-800' : 'text-slate-500 hover:text-emerald-500 hover:bg-slate-800/50'}`}
          >
            <Package size={20} />
          </button>
          <button 
            onClick={() => setActiveTab('partners')}
            className={`p-2.5 rounded-lg transition-all ${activeTab === 'partners' ? 'text-emerald-500 bg-slate-800' : 'text-slate-500 hover:text-emerald-500 hover:bg-slate-800/50'}`}
          >
            <Users size={20} />
          </button>
          <button 
            onClick={() => setActiveTab('map')}
            className={`p-2.5 rounded-lg transition-all ${activeTab === 'map' ? 'text-emerald-500 bg-slate-800' : 'text-slate-500 hover:text-emerald-500 hover:bg-slate-800/50'}`}
          >
            <MapPin size={20} />
          </button>
          <div className="w-8 h-px bg-slate-800 my-2"></div>
          <button 
            onClick={() => setActiveTab('impact')}
            className={`p-2.5 rounded-lg transition-all ${activeTab === 'impact' ? 'text-emerald-500 bg-slate-800' : 'text-slate-500 hover:text-emerald-500 hover:bg-slate-800/50'}`}
          >
            <TrendingUp size={20} />
          </button>
        </div>
        <button 
          onClick={() => window.open('https://github.com', '_blank')}
          className="p-2.5 text-slate-500 hover:text-emerald-400 transition-colors"
        >
          <Globe size={20} />
        </button>
      </nav>

      {/* Main Container */}
      <div className="pl-16 flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-14 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold tracking-tight text-slate-800">Save Food with <span className="text-emerald-600">AI</span></h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">Logistics Engine Active</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Current Pulse</p>
              <div className="flex items-center gap-2 justify-end">
                <RefreshCw size={10} className="text-emerald-500 animate-spin-slow" />
                <p className="text-xs font-semibold text-slate-700">{liveStats.waste.toFixed(2)} Tons Diverted</p>
              </div>
            </div>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowProfile(true)}
              className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 shadow-sm overflow-hidden cursor-pointer"
            >
               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Admin`} alt="User" />
            </motion.button>
          </div>
        </header>

        {/* User Profile Modal */}
        <AnimatePresence>
          {showProfile && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowProfile(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
              >
                <button 
                  onClick={() => setShowProfile(false)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors z-10"
                >
                  <X size={20} />
                </button>

                <div className="h-24 bg-slate-900 relative">
                  <div className="absolute -bottom-10 left-8">
                     <div className="w-20 h-20 rounded-2xl border-4 border-white bg-emerald-50 shadow-lg overflow-hidden">
                       <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Admin`} alt="Alex Rivera" />
                     </div>
                  </div>
                </div>

                <div className="pt-14 p-8">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-slate-800">Alex Rivera</h2>
                    <p className="text-sm font-medium text-slate-500">Lead Logistics Coordinator</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-8">
                     <div className="text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Batches</p>
                        <p className="text-lg font-bold text-slate-800">1,248</p>
                     </div>
                     <div className="text-center border-x border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Experience</p>
                        <p className="text-lg font-bold text-slate-800">4.2 yrs</p>
                     </div>
                     <div className="text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Status</p>
                        <p className="text-xs font-bold text-emerald-600 mt-1">Active Now</p>
                     </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-slate-50">
                     <div className="flex items-center gap-3 text-slate-600">
                        <Mail size={16} className="text-slate-400" />
                        <span className="text-sm">alex.rivera@logistics.ai</span>
                     </div>
                     <div className="flex items-center gap-3 text-slate-600">
                        <Phone size={16} className="text-slate-400" />
                        <span className="text-sm">+1 (212) 555-0891</span>
                     </div>
                  </div>

                  <div className="mt-8 flex flex-wrap gap-2">
                     <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase border border-emerald-100">Verified Admin</span>
                     <span className="px-3 py-1 bg-slate-50 text-slate-600 rounded-full text-[10px] font-bold uppercase border border-slate-100">Logistics Lead</span>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Global Stats bar */}
        <div className="border-b border-slate-200 bg-white/50 backdrop-blur-sm px-8 py-4">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard label="Waste Diverted" value={liveStats.waste} suffix=" Tons" decimals={1} percentage="98.4%" />
            <StatCard label="People Served" value={liveStats.people} isInteger={true} percentage="+12%" />
            <StatCard label="CO2 Reduced" value={liveStats.co2} suffix=" Tons" decimals={1} percentage="Active" />
            <StatCard label="Active NGOs" value={liveStats.ngos} isInteger={true} percentage="Verified" />
          </div>
        </div>

        {/* Grid Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'donations' ? (
            <motion.main 
              key="donations"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 grid grid-cols-12 gap-4 p-4 max-w-[1600px] mx-auto w-full"
            >
          
          {/* Left Column: Input Batches & Emergency (Col 3) */}
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
               <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">New Entry Logistics</h2>
                <form onSubmit={handleSubmitDonation} className="space-y-4">
                  <div className={`p-3 rounded-lg border transition-all ${errors.donorName ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex justify-between items-center mb-1">
                      <label className={`text-[10px] font-bold uppercase ${errors.donorName ? 'text-rose-600' : 'text-slate-500'}`}>Donor Source</label>
                      {errors.donorName && <span className="text-[9px] text-rose-500 font-bold uppercase">{errors.donorName}</span>}
                    </div>
                    <div className="relative group">
                      <input 
                        type="text" 
                        list="donor-suggestions"
                        value={formData.donorName}
                        onChange={e => setFormData({...formData, donorName: (e.target as HTMLInputElement).value})}
                        className={`w-full bg-transparent font-bold text-sm outline-none ${errors.donorName ? 'text-rose-800' : 'text-slate-800'}`}
                        placeholder="Search or enter donor..."
                      />
                      <datalist id="donor-suggestions">
                        {MOCK_DONORS.map(d => <option key={d} value={d} />)}
                      </datalist>
                    </div>
                  </div>
                  
                  {/* Quick Pick Donors */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {MOCK_DONORS.slice(0, 3).map(donor => (
                      <button
                        key={donor}
                        type="button"
                        onClick={() => setFormData({...formData, donorName: donor})}
                        className={`text-[9px] font-bold px-2 py-1 rounded border transition-colors ${
                          formData.donorName === donor 
                            ? 'bg-emerald-600 border-emerald-600 text-white' 
                            : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300'
                        }`}
                      >
                        {donor}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className={`p-3 rounded-lg border transition-all ${errors.quantity ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-100'}`}>
                      <div className="flex justify-between items-center mb-1">
                        <label className={`text-[10px] font-bold uppercase ${errors.quantity ? 'text-rose-600' : 'text-slate-500'}`}>Quantity</label>
                        {errors.quantity && <span className="text-[8px] text-rose-500 font-bold uppercase">{errors.quantity}</span>}
                      </div>
                      <input 
                        type="text" 
                        value={formData.quantity}
                        onChange={e => setFormData({...formData, quantity: (e.target as HTMLInputElement).value})}
                        className={`w-full bg-transparent font-bold text-sm outline-none ${errors.quantity ? 'text-rose-800' : 'text-slate-800'}`}
                      />
                    </div>
                    <div className={`p-3 rounded-lg border transition-all ${errors.type ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-100'}`}>
                      <div className="flex justify-between items-center mb-1">
                        <label className={`text-[10px] font-bold uppercase ${errors.type ? 'text-rose-600' : 'text-emerald-600'}`}>Type</label>
                        {errors.type && <span className="text-[8px] text-rose-500 font-bold uppercase">{errors.type}</span>}
                      </div>
                      <input 
                        type="text" 
                        value={formData.type}
                        onChange={e => setFormData({...formData, type: (e.target as HTMLInputElement).value})}
                        className={`w-full bg-transparent font-bold text-sm outline-none ${errors.type ? 'text-rose-800' : 'text-emerald-800'}`}
                      />
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg border transition-all ${errors.expiryTime ? 'bg-rose-50 border-rose-200' : 'bg-amber-50 border-amber-200'}`}>
                    <div className="flex justify-between items-center mb-1">
                      <label className={`text-[10px] font-bold uppercase ${errors.expiryTime ? 'text-rose-600' : 'text-amber-600'}`}>Expiry Window</label>
                      {errors.expiryTime && <span className="text-[9px] text-rose-500 font-bold uppercase">{errors.expiryTime}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-amber-200 rounded-full overflow-hidden">
                        <div className={`h-full bg-amber-500 ${errors.expiryTime ? 'bg-rose-500' : ''}`} style={{ width: '75%' }}></div>
                      </div>
                      <input 
                        type="text" 
                        value={formData.expiryTime}
                        onChange={e => setFormData({...formData, expiryTime: (e.target as HTMLInputElement).value})}
                        className={`bg-transparent font-bold text-xs outline-none w-24 text-right ${errors.expiryTime ? 'text-rose-700' : 'text-amber-700'}`}
                      />
                    </div>
                  </div>
                  <button 
                    disabled={isSubmitting}
                    className="w-full py-3 bg-slate-900 text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : "Analyze Allocation"}
                  </button>
               </form>
               
               {/* Recent Batches Mini-List */}
               <div className="mt-6 pt-6 border-t border-slate-100">
                  <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Recent Source Logs</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'City Bakery', type: 'Assorted Bread', qty: '12kg', time: '2h ago' },
                      { name: 'Green Grocer', type: 'Fresh Veggies', qty: '25kg', time: '5h ago' },
                      { name: 'Metro Food', type: 'Ready Meals', qty: '40 units', time: '1d ago' },
                    ].map((batch, i) => (
                      <div key={i} className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                              <Package size={12} />
                           </div>
                           <div className="leading-tight">
                              <p className="text-[10px] font-bold text-slate-700">{batch.name}</p>
                              <p className="text-[9px] text-slate-400">{batch.type} • {batch.qty}</p>
                           </div>
                        </div>
                        <span className="text-[8px] font-bold text-slate-300">{batch.time}</span>
                      </div>
                    ))}
                  </div>
               </div>
            </div>

            {/* Emergency Alerts */}
            <div className="bg-rose-600 text-white p-5 rounded-xl shadow-lg flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10">
                <AlertTriangle size={60} />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-white/20 p-1.5 rounded-lg animate-pulse">
                  <AlertTriangle size={18} />
                </div>
                <h3 className="font-bold uppercase text-[10px] tracking-widest">Emergency Protocol</h3>
                <span className="ml-auto text-[8px] font-black bg-rose-500 px-1.5 py-0.5 rounded border border-rose-400">URGENT</span>
              </div>
              <p className="text-xs opacity-95 leading-relaxed mb-4 font-medium">
                {allocation?.emergencyRecommendations || "High spoilage risk detected! Immediate delivery needed to prevent 15kg of waste."}
              </p>
              <div className="text-[9px] font-bold text-rose-200 uppercase mb-4 tracking-tight border-l-2 border-rose-300 pl-2">
                Action: Dispatch priority transport (Bypasses 4h queue)
              </div>
              <button 
                onClick={() => {
                  setToastMessage("EXPRESS COURIER DISPATCHED");
                  setShowToast(true);
                  setTimeout(() => setShowToast(false), 3000);
                }}
                className="w-full py-2.5 bg-white text-rose-700 rounded-lg font-bold text-xs shadow-sm uppercase tracking-wider hover:bg-rose-50 transition-colors active:scale-95 flex items-center justify-center gap-2"
              >
                <Zap size={14} /> Trigger Express Courier
              </button>
            </div>
          </div>

          {/* Center Column: Allocation & Table (Col 6) */}
          <div className="col-span-12 lg:col-span-6 flex flex-col gap-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden min-h-[440px]">
              <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                <h2 className="font-bold text-slate-700 text-sm">Logistics Dashboard</h2>
                <div className="flex items-center gap-2">
                   {allocation && (
                     <button 
                      onClick={handleClearAllocation}
                      className="flex items-center gap-2 px-3 py-1 bg-white border border-rose-200 text-rose-600 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-rose-50 transition-all shadow-sm"
                     >
                       <Trash2 size={12} /> Clear
                     </button>
                   )}
                   <button 
                    onClick={() => setShowMap(!showMap)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all ${
                      showMap ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-100 shadow-lg' : 'bg-white text-slate-600 border-slate-200 shadow-sm'
                    }`}
                   >
                     {showMap ? <BarIcon size={12} /> : <MapIcon size={12} />}
                     {showMap ? 'View List' : 'View Map'}
                   </button>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Optimized Real-time</span>
                </div>
              </div>
              
              <div className="flex-1 overflow-hidden flex flex-col">
                {showMap ? (
                  <div className="flex-1 p-2">
                    <MapComponent 
                      donation={{...formData, id: 'current'} as FoodItem} 
                      recipients={MOCK_RECIPIENTS} 
                      allocation={allocation} 
                    />
                  </div>
                ) : (
                  <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                          <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recipient NGO</th>
                          <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Priority Score</th>
                          <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Allocation</th>
                          <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {allocation ? (
                          allocation.priorityRanking.map((rank, i) => (
                            <tr key={rank.recipientId} className={i === 0 ? "bg-emerald-50/30" : "hover:bg-slate-50/50 transition-colors"}>
                              <td className="px-5 py-4">
                                <p className="font-bold text-xs text-slate-800">{rank.recipientName}</p>
                                <p className="text-[10px] text-slate-500 font-medium">Distance weighted match • {MOCK_RECIPIENTS.find(r => r.id === rank.recipientId)?.distance || "2.4"}km</p>
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <span className="font-mono font-bold text-xs text-slate-700">{rank.score}</span>
                                  <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full ${rank.score > 90 ? 'bg-emerald-500' : 'bg-slate-300'}`} 
                                      style={{ width: `${rank.score}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-4">
                                <span className="font-bold text-xs text-slate-800 font-mono">
                                  {i === 0 ? (allocation.impactSummary.kgSaved * 0.6).toFixed(1) : (allocation.impactSummary.kgSaved * 0.4 / (allocation.priorityRanking.length - 1)).toFixed(1)}kg
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-tight ${
                                  i === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                }`}>
                                  {i === 0 ? 'Ideal Match' : 'Queued'}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          MOCK_RECIPIENTS.slice(0, 8).map((recipient) => (
                            <tr key={recipient.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-5 py-4">
                                <p className="font-bold text-xs text-slate-800">{recipient.name}</p>
                                <p className="text-[10px] text-slate-500 font-medium">{recipient.distance}km away • {recipient.type}</p>
                              </td>
                              <td className="px-5 py-4 text-center">
                                <span className="text-[10px] font-bold text-slate-400 font-mono">--</span>
                              </td>
                              <td className="px-5 py-4">
                                <span className="text-[10px] font-bold text-slate-400 font-mono italic">Awaiting Analysis</span>
                              </td>
                              <td className="px-5 py-4">
                                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-400 text-[9px] font-bold uppercase tracking-tight">
                                  Standby
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* AI Insights Insight */}
            <div className="bg-white border border-emerald-200 p-4 rounded-xl shadow-sm flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0">
                <CheckCircle2 size={16} />
              </div>
              <div className="space-y-1">
                <h3 className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">AI Strategy Insight</h3>
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  {allocation?.bestPlan || "Standing by. System will suggest route grouping to minimize transit distance and reduce CO2 emissions by up to 15%."}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Logistics & Impact (Col 3) */}
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
            {/* Delivery Sequence (Dark) */}
            <div className="bg-slate-900 rounded-xl overflow-hidden shadow-xl flex flex-col min-h-[360px]">
              <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
                <h3 className="text-white font-bold text-[10px] uppercase tracking-widest">Delivery Sequence</h3>
                <div className="flex items-center gap-1.5 font-mono text-[9px] text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded">
                  <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
                  Route #A-42
                </div>
              </div>
              <div className="p-6 flex-1 space-y-6 relative">
                 <div className="absolute left-[35px] top-6 bottom-6 w-px bg-slate-700 border-l border-dashed border-slate-700"></div>
                 <AnimatePresence>
                   {!allocation ? (
                     <div className="h-full flex flex-col items-center justify-center opacity-30 text-white gap-2">
                        <MapPin size={32} />
                        <p className="text-[10px] uppercase font-bold tracking-widest">Awaiting Plan</p>
                     </div>
                   ) : (
                     allocation.suggestedRoute.map((route, idx) => (
                        <motion.div 
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          key={idx} 
                          className="relative flex items-start gap-5 group"
                        >
                          <div className={`w-5 h-5 rounded-full border-2 border-slate-900 z-10 flex items-center justify-center ${
                            route.step === 1 ? 'bg-emerald-500' : 'bg-slate-700'
                          }`}>
                            <div className="w-1.5 h-1.5 bg-slate-900 rounded-full"></div>
                          </div>
                          <div className="pt-0.5">
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter mb-0.5">Drop {idx + 1}</p>
                            <p className="text-white font-bold text-xs tracking-tight group-hover:text-emerald-400 transition-colors uppercase">{route.location}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{route.action}</p>
                          </div>
                        </motion.div>
                     ))
                   )}
                 </AnimatePresence>
              </div>
              <div className="p-4 bg-slate-800/40 border-t border-slate-800">
                 <div className="flex justify-between items-center mb-1">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Total Distance</p>
                    <p className="text-white font-bold text-sm font-mono">18.4 km</p>
                 </div>
              </div>
            </div>

            {/* Impact Forecast */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Impact Forecast</h2>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[9px] font-bold text-emerald-600 uppercase">Live Analysis</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-600 font-medium">Efficiency Score</p>
                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">AI Prediction Rate</p>
                  </div>
                  <p className="text-lg font-bold text-emerald-600 font-mono underline underline-offset-4 decoration-2 decoration-emerald-200">
                    {allocation ? `${(96 + Math.random() * 3).toFixed(1)}%` : "94.2%"}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-600 font-medium">Potential Beneficiaries</p>
                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">Based on quantity</p>
                  </div>
                  <p className="text-lg font-bold text-slate-800 font-mono">
                    {allocation ? allocation.impactSummary.peopleFed : Math.floor(parseInt(formData.quantity) * 4) || "0"}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <button 
                    onClick={() => {
                      if (allocation) {
                        setToastMessage("LOGISTICS BATCH DISPATCHED");
                        setShowToast(true);
                        setTimeout(() => setShowToast(false), 3000);
                        setAllocation(null);
                        // Significant jump on dispatch
                        setLiveStats(prev => ({
                          ...prev,
                          waste: prev.waste + 0.015,
                          people: prev.people + 15
                        }));
                      } else {
                        // Allow triggering analysis if button clicked while on standby
                        handleSubmitDonation(new Event('submit') as any);
                      }
                    }}
                    className={`w-full py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 ${
                      allocation 
                        ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200' 
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'
                    }`}
                  >
                    {allocation ? 'Dispatch Unit' : 'Initialize Batch'}
                  </button>
                </div>
              </div>
            </div>
          </div>
            </motion.main>
          ) : activeTab === 'partners' ? (
            <motion.main 
              key="partners"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 p-8 max-w-7xl mx-auto w-full"
            >
              <h2 className="text-2xl font-bold mb-6 text-slate-800">NGO Partners</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_RECIPIENTS.map(r => (
                  <div 
                    key={r.id} 
                    onClick={() => setSelectedRecipient(r)}
                    className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-emerald-200"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <Users size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{r.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{r.type}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Distance</span>
                        <span className="font-bold text-slate-700">{r.distance} km</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Urgency Level</span>
                        <span className={`font-bold ${r.urgency > 8 ? 'text-rose-500' : 'text-emerald-500'}`}>{r.urgency}/10</span>
                      </div>
                      <div className="pt-3 border-t border-slate-50">
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Needs</p>
                        <p className="text-xs text-slate-600 italic">"{r.needs}"</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* NGO Detail Modal */}
              <AnimatePresence>
                {selectedRecipient && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setSelectedRecipient(null)}
                      className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <motion.div 
                      layoutId={`card-${selectedRecipient.id}`}
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 20 }}
                      className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
                    >
                      <button 
                        onClick={() => setSelectedRecipient(null)}
                        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors z-10"
                      >
                        <X size={20} />
                      </button>

                      <div className="h-32 bg-emerald-600 flex items-end p-8">
                        <div className="translate-y-12 flex items-end gap-6">
                           <div className="w-24 h-24 bg-white rounded-2xl shadow-xl border-4 border-white flex items-center justify-center text-emerald-600">
                             <Users size={40} />
                           </div>
                           <div className="mb-4">
                              <h2 className="text-2xl font-bold text-white shadow-sm">{selectedRecipient.name}</h2>
                              <div className="flex gap-2">
                                <span className="px-2 py-0.5 bg-emerald-500/50 text-white text-[10px] font-bold uppercase rounded border border-white/20">{selectedRecipient.type}</span>
                                <span className="px-2 py-0.5 bg-emerald-500/50 text-white text-[10px] font-bold uppercase rounded border border-white/20">Verified Partner</span>
                              </div>
                           </div>
                        </div>
                      </div>

                      <div className="pt-20 p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-6">
                          <section>
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">About & Mission</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                              {selectedRecipient.description || "A dedicated community partner focused on rapid food distribution and waste reduction. Providing essential support to high-need areas in NYC through an optimized logistics network."}
                            </p>
                          </section>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                              <div className="flex items-center gap-2 text-emerald-600 mb-1">
                                <MapPin size={14} />
                                <span className="text-[10px] font-bold uppercase">Location</span>
                              </div>
                              <p className="text-xs font-bold text-slate-700">{selectedRecipient.location}</p>
                              <p className="text-[10px] text-slate-400 mt-1">{selectedRecipient.distance} km from hub</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                              <div className="flex items-center gap-2 text-emerald-600 mb-1">
                                <Clock size={14} />
                                <span className="text-[10px] font-bold uppercase">Operating Hours</span>
                              </div>
                              <p className="text-xs font-bold text-slate-700">{selectedRecipient.hours || "07:00 AM - 09:00 PM"}</p>
                              <p className="text-[10px] text-slate-400 mt-1">Open 7 days a week</p>
                            </div>
                          </div>

                          <section>
                             <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Immediate Requirements</h3>
                             <div className="flex flex-wrap gap-2">
                               {selectedRecipient.needs.split(',').map(need => (
                                 <span key={need} className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-xs font-medium">
                                   {need.trim()}
                                 </span>
                               ))}
                             </div>
                          </section>
                        </div>

                        <div className="space-y-6">
                           <div className="bg-slate-900 rounded-xl p-5 text-white">
                              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Performance</h3>
                              <div className="space-y-4">
                                <div>
                                  <div className="flex justify-between items-center mb-1 text-[10px] uppercase font-bold">
                                    <span className="text-slate-400">Throughput</span>
                                    <span className="text-emerald-400">{selectedRecipient.capacity} kg/d</span>
                                  </div>
                                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="w-3/4 h-full bg-emerald-500"></div>
                                  </div>
                                </div>
                                <div className="pt-4 border-t border-slate-800">
                                   <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Last Delivery</p>
                                   <p className="text-xs font-bold">{selectedRecipient.lastActivity || "2 hours ago"}</p>
                                </div>
                              </div>
                           </div>

                           <div className="space-y-3">
                              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Connect</h3>
                              <p className="text-xs font-bold text-slate-700">{selectedRecipient.contact || "+1 (212) 555-0123"}</p>
                              <button className="w-full py-3 bg-emerald-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-900/20">
                                Request Inventory Sync
                              </button>
                           </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </motion.main>
          ) : activeTab === 'map' ? (
            <motion.main 
              key="map-full"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex-1 p-4"
            >
              <div className="w-full h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
                <MapComponent 
                  donation={{...formData, id: 'full-map'} as FoodItem} 
                  recipients={MOCK_RECIPIENTS} 
                  allocation={allocation} 
                />
              </div>
            </motion.main>
          ) : (
            <motion.main 
              key="impact"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto w-full space-y-8"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Sustainability Impact</h2>
                  <p className="text-slate-500 font-medium">Real-time logistics efficiency and waste reduction metrics.</p>
                </div>
                <div className="flex gap-2">
                  <div className="px-4 py-2 bg-white rounded-lg border border-slate-200 shadow-sm flex items-center gap-3">
                    <Activity size={16} className="text-emerald-500" />
                    <div className="text-left">
                      <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Status</p>
                      <p className="text-xs font-bold text-slate-700">Live Optimization</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-6">
                {/* Main Trend Chart */}
                <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="font-bold text-slate-800">Waste Diversion Trends</h3>
                      <p className="text-xs text-slate-400">Total volume (kg) saved across all sectors over the last 7 days.</p>
                    </div>
                    <select className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[10px] font-bold outline-none">
                      <option>Last 7 Days</option>
                      <option>Monthly</option>
                    </select>
                  </div>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { date: 'Apr 21', kg: 420 },
                        { date: 'Apr 22', kg: 380 },
                        { date: 'Apr 23', kg: 510 },
                        { date: 'Apr 24', kg: 640 },
                        { date: 'Apr 25', kg: 590 },
                        { date: 'Apr 26', kg: 720 },
                        { date: 'Apr 27', kg: 840 },
                      ]}>
                        <defs>
                          <linearGradient id="colorKg" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                        />
                        <Area type="monotone" dataKey="kg" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorKg)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Distribution Chart */}
                <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                  <h3 className="font-bold text-slate-800 mb-1">Resource Mix</h3>
                  <p className="text-xs text-slate-400 mb-8">Share of food types diverted from landfill.</p>
                  <div className="flex-1 min-h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Produce', value: 45 },
                            { name: 'Bakery', value: 25 },
                            { name: 'Prepared', value: 20 },
                            { name: 'Dairy', value: 10 },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {[ '#10b981', '#34d399', '#6ee7b7', '#a7f3d0' ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {[
                      { label: 'Produce', color: 'bg-emerald-500' },
                      { label: 'Bakery', color: 'bg-emerald-400' },
                      { label: 'Prepared', color: 'bg-emerald-300' },
                      { label: 'Dairy', color: 'bg-emerald-200' },
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                        <span className="text-[10px] font-bold text-slate-600 uppercase">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* NGO Support Chart */}
                <div className="col-span-12 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                      <BarIcon size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">Partner Capacity Utilization</h3>
                      <p className="text-xs text-slate-400">Comparing current deliveries against NGO throughput limits.</p>
                    </div>
                  </div>
                  <div className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Hope Food Bank', capacity: 200, current: 156 },
                        { name: 'Downtown Shelter', capacity: 120, current: 112 },
                        { name: 'Mercy NGO', capacity: 180, current: 45 },
                        { name: 'Community Center', capacity: 90, current: 82 },
                        { name: 'St. Marys Kitchen', capacity: 150, current: 128 },
                      ]}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} />
                        <Tooltip 
                           contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                        />
                        <Bar dataKey="capacity" fill="#f1f5f9" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="current" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </motion.main>
          )}
        </AnimatePresence>

        {/* Status Bar Footer */}
        <footer className="h-8 bg-slate-900 text-slate-500 text-[10px] px-6 flex items-center justify-between uppercase tracking-[0.2em] font-bold border-t border-slate-800 relative z-40">
          <div className="flex gap-6">
            <span>Save Food <span className="text-emerald-500">v2.04</span></span>
            <span className="hidden md:inline">Node: NW-Region-8</span>
            <span className="text-emerald-400/50">Pulse Frequency {pulseTime}</span>
          </div>
          <div className="flex gap-6 items-center">
            <span className="animate-pulse flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> Live Feed</span>
            <span className="text-white">System: Active</span>
          </div>
        </footer>
        <AIChatAgent />
      </div>
    </div>
  );
}

function Counter({ value, decimals = 0, suffix = "" }: { value: number; decimals?: number; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const start = displayValue;
    const end = value;
    const duration = 1000; // 1 second animation
    let startTime: number | null = null;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function: easeOutExpo
      const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = start + (end - start) * easedProgress;
      
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <span>{displayValue.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</span>;
}

function StatCard({ 
  label, 
  value, 
  percentage, 
  suffix = "", 
  decimals = 0, 
  isInteger = false 
}: { 
  label: string; 
  value: number; 
  percentage: string;
  suffix?: string;
  decimals?: number;
  isInteger?: boolean;
}) {
  const progress = Math.min(Math.max((value % 100), 10), 95);

  return (
    <div className="flex flex-col gap-1 transition-all">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <span className="text-[9px] font-mono text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">{percentage}</span>
      </div>
      <p className="text-xl font-bold text-slate-800 tracking-tight font-mono">
        <Counter value={value} decimals={isInteger ? 0 : decimals} suffix={suffix} />
      </p>
      <div className="w-full h-1 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-emerald-500 rounded-full opacity-30"
        ></motion.div>
      </div>
    </div>
  );
}
