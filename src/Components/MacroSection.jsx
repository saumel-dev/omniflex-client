import { FiCheckCircle } from "react-icons/fi";
import MacroCalculatorForm from "./MacroCalculatorForm";

export default function MacroSection() {
  const guidePoints = [
    { title: "Precision Training Fuel", desc: "Generic calculation metrics fail athletes. Understand exactly how much metabolic fuel code your system needs." },
    { title: "Preserve Clean Lean Tissue", desc: "Ensure your macronutrient partition profile prevents lean tracking deterioration during heavy gym workloads." },
    { title: "Adaptive Biological Timing", desc: "Easily recalculate parameters as body composition matrices change over multi-week timeline cycles." }
  ];

  return (
    <section className="relative w-full py-20 md:py-28 dark::bg-[#111827] text-foreground overflow-hidden px-6 transition-colors duration-300 border-t border-default-100/40">
      
      {/* Dynamic Structural Accent Blur Background Layers */}
      <div className="absolute top-1/4 right-0 w-[450px] h-[450px] rounded-full bg-[#FF6B00]/5 dark:bg-[#FF6B00]/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] rounded-full bg-blue-500/5 dark:bg-blue-500/3 blur-[140px] pointer-events-none z-0" />

      <div className="relative z-10 container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* LEFT FRAMING: Creative Explanatory Value Statement Context */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs md:text-sm font-bold tracking-widest text-[#FF6B00] uppercase bg-[#FF6B00]/10 px-4 py-1.5 rounded-full border border-[#FF6B00]/20">
              Biometric Engine Tracker
            </span>
            
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.15]">
              Crush Your Limits with <span className="text-[#FF6B00]">Engineered Nutrition.</span>
            </h2>
            
            <p className="text-base text-default-500 font-light leading-relaxed max-w-xl">
              Workouts determine your physical stimulus; your nutrition determines your absolute performance ceiling. Use our real-time biometric tool to construct an analytical baseline for your transformation goal.
            </p>

            <div className="pt-4 space-y-4 max-w-lg">
              {guidePoints.map((point, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="mt-1 flex-shrink-0 w-5 h-5 text-[#FF6B00]">
                    <FiCheckCircle className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-default-800 dark:text-zinc-100">{point.title}</h4>
                    <p className="text-sm text-default-500 font-light">{point.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT FRAMING: The Interactive Utility Box Panel */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto lg:ml-auto">
            <div className="p-6 sm:p-8 rounded-2xl bg-default-100/60 dark:bg-white/[0.01] border border-default-200 dark:border-white/10 shadow-xl backdrop-blur-sm">
              <div className="mb-6">
                <h3 className="text-xl font-bold tracking-tight text-default-900 dark:text-white">Macro Target Analyzer</h3>
                <p className="text-xs text-default-400 dark:text-zinc-500 mt-1">Adjust metric parameters to view distribution breakdowns instantly.</p>
              </div>

              {/* Injected Interactive Elements Form */}
              <MacroCalculatorForm />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}