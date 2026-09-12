"use client";

import { useState, useEffect } from "react";
import { Calculator, ReceiptText, ChevronRight, AlertTriangle, ArrowLeft, ShieldCheck, Diamond, TrendingUp } from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";

export default function Home() {
  const [view, setView] = useState<"home" | "calculator" | "result">("home");
  const [mode, setMode] = useState<"calculate" | "check_bill">("calculate");
  const [rates, setRates] = useState<any>(null);
  const [selectedHomeKarat, setSelectedHomeKarat] = useState<"10K" | "14K" | "18K" | "22K" | "24K">("18K");
  const [homeDisplayKarat, setHomeDisplayKarat] = useState("22K");
  
  // Form State
  const [fineness, setFineness] = useState("916");
  const [homeSelectedFineness, setHomeSelectedFineness] = useState<number>(916);
  const [weight, setWeight] = useState("");
  const [customRate, setCustomRate] = useState(""); // The user's override for the selected karat's rate
  const [huid, setHuid] = useState("");
  const [makingCharges, setMakingCharges] = useState("");
  const [makingType, setMakingType] = useState<"percentage" | "flat">("percentage");
  const [wastage, setWastage] = useState("");
  const [stoneCharges, setStoneCharges] = useState("0");
  const [jewellerQuote, setJewellerQuote] = useState("");

  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetch("/api/rates")
      .then(res => res.json())
      .then(data => setRates(data))
      .catch(err => console.error("Failed to fetch rates:", err));
  }, []);

  const hallmarkMap: Record<number, { karat: number; purity: number }> = {
    417: { karat: 10, purity: 41.7 },
    583: { karat: 14, purity: 58.3 },
    750: { karat: 18, purity: 75.0 },
    916: { karat: 22, purity: 91.6 },
    999: { karat: 24, purity: 99.9 }
  };

  const handleFinenessChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFineness(e.target.value);
    setCustomRate(""); // Clear the custom rate override when switching karats
  };

  const parsedFineness = parseInt(fineness) || 916;
  const hallmarkData = hallmarkMap[parsedFineness];
  const detectedKarat = hallmarkData ? `${hallmarkData.karat}K` : "Unknown";
  const detectedPurity = hallmarkData ? `${hallmarkData.purity}%` : "N/A";

  // The default live rate for the selected Karat
  const apiRateForKarat = rates?.rates?.[detectedKarat] || 0;
  
  // Use custom override if provided, else use live API rate
  const effectiveRate = customRate ? parseFloat(customRate) : apiRateForKarat;

  // The backend API expects a base 24K rate to do its own math (rate * fineness/999).
  // To allow the backend to output our specific effectiveRate, we reverse-engineer the 24K rate.
  const rate24kForBackend = parsedFineness > 0 ? effectiveRate * (999.0 / parsedFineness) : 0;

  const handleCalculate = async () => {
    try {
      const res = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fineness: parsedFineness,
          weight: parseFloat(weight) || 0,
          gold_rate_24k: rate24kForBackend,
          making_charges: parseFloat(makingCharges) || 0,
          making_charges_type: makingType,
          wastage: parseFloat(wastage) || 0,
          stone_charges: parseFloat(stoneCharges) || 0,
          jeweller_quote: jewellerQuote ? parseFloat(jewellerQuote) : null,
          huid: huid || null
        })
      });
      const data = await res.json();
      setResult(data);
      setView("result");
    } catch (err) {
      console.error(err);
    }
  };

  const slideVariants: Variants = {
    initial: { opacity: 0, y: 30, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, y: -20, scale: 0.98, transition: { duration: 0.3 } }
  };

  return (
    <main className="min-h-screen p-4 sm:p-8 flex justify-center items-center font-sans">
      <div className="w-full max-w-md relative z-10">
        <AnimatePresence mode="wait">
          {view === "home" && (
            <motion.div 
              key="home"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="premium-glass rounded-[2rem] p-8 flex flex-col items-center space-y-8"
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/20 mb-2">
                  <Diamond className="text-black" size={32} strokeWidth={1.5} />
                </div>
                <h1 className="text-4xl font-bold tracking-tighter text-white">AURA</h1>
                <h2 className="text-xs font-semibold tracking-[0.3em] text-yellow-500/90 uppercase">Gold Valuation Engine</h2>
              </div>

              <div className="w-full bg-black/50 rounded-2xl p-6 border border-white/5 backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent"></div>
                
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-yellow-500" />
                    <h3 className="text-xs text-gray-300 font-bold tracking-widest uppercase">Live Spot Rate</h3>
                  </div>
                  {rates?.updated_at && (
                    <span className="text-[10px] font-bold text-green-400 flex items-center gap-1.5 uppercase tracking-wider bg-green-500/10 px-2 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                      {new Date(rates.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-black/30 rounded-xl p-3 border border-white/5 group transition hover:border-yellow-500/20">
                    <div className="relative">
                      <select 
                        value={selectedHomeKarat}
                        onChange={(e) => setSelectedHomeKarat(e.target.value as any)}
                        className="bg-transparent text-2xl font-bold text-gray-100 outline-none appearance-none cursor-pointer pr-6 relative z-10"
                      >
                        <option value="22K" className="bg-[#090a0f] text-white">22K (916)</option>
                        <option value="18K" className="bg-[#090a0f] text-white">18K (750)</option>
                        <option value="14K" className="bg-[#090a0f] text-white">14K (583)</option>
                        <option value="10K" className="bg-[#090a0f] text-white">10K (417)</option>
                      </select>
                      <div className="absolute right-0 top-1/2 -mt-1 pointer-events-none text-yellow-500">
                         <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-mono text-gold-gradient font-bold">₹{rates?.rates?.[selectedHomeKarat]?.toLocaleString() || "---"}</span>
                      <span className="text-xs text-gray-500 ml-1">/g</span>
                    </div>
                  </div>

                  <div className="h-[1px] w-full bg-white/5"></div>
                  
                  <div className="flex justify-between items-end px-2">
                    <span className="text-xl font-medium text-gray-400">24K (999)</span>
                    <div className="text-right">
                      <span className="text-lg font-mono text-yellow-400/80">₹{rates?.rates?.["24K"]?.toLocaleString() || "---"}</span>
                      <span className="text-xs text-gray-500 ml-1">/g</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full space-y-4 pt-4">
                <button 
                  onClick={() => { setMode("calculate"); setJewellerQuote(""); setView("calculator"); }}
                  className="w-full premium-button rounded-xl py-4 px-6 flex items-center justify-between group"
                >
                  <span className="flex items-center gap-3 font-bold tracking-wide"><Calculator size={20} /> CALCULATE VALUE</span>
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => { setMode("check_bill"); setView("calculator"); }}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-4 px-6 rounded-xl transition-all flex items-center justify-between group"
                >
                  <span className="flex items-center gap-3 tracking-wide"><ReceiptText size={20} className="text-gray-400" /> Verify Jeweller Bill</span>
                  <ChevronRight size={20} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}

          {view === "calculator" && (
            <motion.div 
              key="calculator"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="premium-glass rounded-[2rem] p-6 sm:p-8 flex flex-col h-[85vh]"
            >
              <div className="flex items-center gap-4 mb-6">
                <button onClick={() => setView("home")} className="p-2 hover:bg-white/10 rounded-full transition bg-black/20 border border-white/5">
                  <ArrowLeft size={18} />
                </button>
                <h2 className="text-lg font-bold tracking-wider uppercase text-gold-gradient">
                  {mode === "calculate" ? "Valuation Engine" : "Bill Verification"}
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
                
                {/* Weight & Fineness */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="premium-input rounded-xl p-3 flex flex-col">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Weight (g)</label>
                    <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="10.50" className="bg-transparent outline-none font-mono text-lg text-white" />
                  </div>
                  <div className="premium-input rounded-xl p-3 flex flex-col relative group">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Hallmark</label>
                    <select 
                      value={fineness} 
                      onChange={handleFinenessChange} 
                      className="bg-transparent outline-none font-mono text-lg text-white appearance-none cursor-pointer w-full"
                    >
                      <option value="999" className="bg-[#090a0f] text-white">999 (24K)</option>
                      <option value="916" className="bg-[#090a0f] text-white">916 (22K)</option>
                      <option value="750" className="bg-[#090a0f] text-white">750 (18K)</option>
                      <option value="583" className="bg-[#090a0f] text-white">583 (14K)</option>
                      <option value="417" className="bg-[#090a0f] text-white">417 (10K)</option>
                    </select>
                    {/* Custom dropdown arrow */}
                    <div className="absolute right-3 top-1/2 mt-1 pointer-events-none text-yellow-500/50">
                       <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>
                </div>

                {/* Rate & HUID */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="premium-input rounded-xl p-3 flex flex-col">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex justify-between">
                      <span>{detectedKarat} Rate (₹/g)</span>
                    </label>
                    <input 
                      type="number" 
                      value={customRate} 
                      onChange={e => setCustomRate(e.target.value)} 
                      placeholder={apiRateForKarat ? `${apiRateForKarat}` : "Live Rate"} 
                      className="bg-transparent outline-none font-mono text-lg text-white placeholder-gray-600" 
                    />
                  </div>
                  <div className="premium-input rounded-xl p-3 flex flex-col">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex justify-between">
                      <span>HUID</span> <span className="text-gray-600">Opt</span>
                    </label>
                    <input type="text" value={huid} onChange={e => setHuid(e.target.value.toUpperCase())} placeholder="ABC123" className="bg-transparent outline-none font-mono text-lg text-white uppercase" />
                  </div>
                </div>

                {/* Dynamic Detection Card */}
                <AnimatePresence>
                  {parsedFineness > 0 && detectedKarat !== "Unknown" && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-gradient-to-br from-yellow-900/30 to-black border border-yellow-500/20 rounded-xl p-5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 text-yellow-400 font-bold tracking-wide mb-1">
                              <ShieldCheck size={18} /> {detectedKarat} Gold Selected
                            </div>
                            <div className="text-sm text-yellow-500/70 font-medium tracking-wide">{detectedPurity} Purity</div>
                          </div>
                        </div>
                        <div className="flex justify-between items-end pt-3 border-t border-yellow-500/10">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Effective Rate</span>
                          <span className="font-mono text-lg text-gold-gradient font-bold">₹{effectiveRate.toLocaleString(undefined, { maximumFractionDigits: 2 })} <span className="text-xs font-sans text-gray-500 font-normal">/ gram</span></span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Charges */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="premium-input rounded-xl p-3 flex flex-col relative group">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Making</label>
                    <div className="flex items-center">
                      <input type="number" value={makingCharges} onChange={e => setMakingCharges(e.target.value)} placeholder="10" className="bg-transparent outline-none font-mono text-lg text-white w-full" />
                      <button onClick={() => setMakingType(makingType === "percentage" ? "flat" : "percentage")} className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded transition hover:bg-yellow-500/20">
                        {makingType === "percentage" ? "%" : "₹"}
                      </button>
                    </div>
                  </div>
                  <div className="premium-input rounded-xl p-3 flex flex-col">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Wastage (%)</label>
                    <input type="number" value={wastage} onChange={e => setWastage(e.target.value)} placeholder="5" className="bg-transparent outline-none font-mono text-lg text-white" />
                  </div>
                </div>
                
                {/* Jeweller Quote (Check Bill Mode) */}
                <AnimatePresence>
                  {mode === "check_bill" && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="premium-input bg-blue-900/10 border-blue-500/30 focus-within:border-blue-400/50 rounded-xl p-3 flex flex-col mt-4">
                        <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Jeweller's Bill Total (₹)</label>
                        <input type="number" value={jewellerQuote} onChange={e => setJewellerQuote(e.target.value)} placeholder="e.g. 150000" className="bg-transparent outline-none font-mono text-lg text-white" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button 
                onClick={handleCalculate}
                className="w-full premium-button font-bold tracking-widest text-sm py-4 rounded-xl mt-6 shrink-0"
              >
                GENERATE REPORT
              </button>
            </motion.div>
          )}

          {view === "result" && result && (
            <motion.div 
              key="result"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              className="premium-glass rounded-[2rem] p-6 sm:p-8 flex flex-col"
            >
              <div className="flex items-center gap-4 mb-6">
                <button onClick={() => setView("calculator")} className="p-2 hover:bg-white/10 rounded-full transition bg-black/20 border border-white/5">
                  <ArrowLeft size={18} />
                </button>
                <h2 className="text-lg font-bold tracking-wider uppercase text-gold-gradient">Valuation Report</h2>
              </div>

              {/* Digital Receipt */}
              <div className="bg-black/60 rounded-2xl p-6 border border-white/5 relative overflow-hidden mb-6 shadow-inner">
                {/* Decorative cutouts */}
                <div className="absolute -left-3 top-1/2 w-6 h-6 bg-[#090a0f] rounded-full transform -translate-y-1/2"></div>
                <div className="absolute -right-3 top-1/2 w-6 h-6 bg-[#090a0f] rounded-full transform -translate-y-1/2"></div>
                
                <div className="flex justify-between items-end border-b border-white/5 pb-4 mb-4 border-dashed">
                    <div>
                      <div className="text-sm font-bold text-yellow-500 tracking-wide">{result.detected_karat} GOLD</div>
                      {result.huid && <div className="text-xs text-gray-500 font-mono mt-1">HUID: {result.huid}</div>}
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Rate / gram</div>
                      <div className="font-mono text-gray-300">₹{result.effective_rate.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                    </div>
                </div>
                
                <div className="space-y-3 font-mono text-sm">
                  <div className="flex justify-between text-gray-400"><span>Net Weight</span><span className="text-gray-300">{weight}g</span></div>
                  <div className="flex justify-between text-gray-400"><span>Gold Value</span><span className="text-gray-300">₹{result.gold_value.toLocaleString()}</span></div>
                  {result.wastage_value > 0 && <div className="flex justify-between text-gray-400"><span>Wastage</span><span className="text-gray-300">₹{result.wastage_value.toLocaleString()}</span></div>}
                  {result.making_charges_value > 0 && <div className="flex justify-between text-gray-400"><span>Making Chg.</span><span className="text-gray-300">₹{result.making_charges_value.toLocaleString()}</span></div>}
                  <div className="flex justify-between text-gray-400"><span>GST (3%)</span><span className="text-gray-300">₹{result.gst_value.toLocaleString()}</span></div>
                </div>
                
                <div className="border-t border-white/10 pt-4 mt-4 flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Estimated Total</span>
                  <span className="font-mono text-2xl text-gold-gradient font-bold">₹{result.estimated_total.toLocaleString()}</span>
                </div>
              </div>

              {/* Comparison Section */}
              {result.jeweller_quote && (
                <div className={`rounded-2xl p-6 border relative overflow-hidden ${
                    result.rating === "Fair Price" ? "bg-green-950/30 border-green-500/30" :
                    result.rating === "Slightly Higher" ? "bg-yellow-950/30 border-yellow-500/30" :
                    "bg-red-950/30 border-red-500/30"
                  }`}>
                  
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Jeweller's Bill</div>
                      <div className="font-mono text-xl text-white font-bold">₹{result.jeweller_quote.toLocaleString()}</div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Difference</div>
                      <div className={`font-mono text-lg font-bold flex items-center gap-1 justify-end ${
                        result.difference <= 0 ? "text-green-400" : "text-red-400"
                      }`}>
                        {result.difference > 0 ? "+" : ""}₹{result.difference.toLocaleString()} 
                      </div>
                    </div>
                  </div>

                  <div className={`text-center font-bold tracking-widest text-sm uppercase py-2 rounded-lg ${
                    result.rating === "Fair Price" ? "bg-green-500/10 text-green-400" :
                    result.rating === "Slightly Higher" ? "bg-yellow-500/10 text-yellow-400" :
                    "bg-red-500/10 text-red-400"
                  }`}>
                    {result.rating}
                  </div>
                </div>
              )}
              
              {!result.jeweller_quote && (
                <button 
                  onClick={() => setView("home")}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold tracking-widest text-sm py-4 rounded-xl transition-all mt-auto"
                >
                  START OVER
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
