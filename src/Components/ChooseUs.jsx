import { FiShield, FiTarget, FiTrendingUp, FiUsers, FiAward, FiActivity } from "react-icons/fi";
import { ScrollAnimation } from "./ScrollAnimation"; // Adjust path as needed

export default function ChooseUs() {
    const features = [
        {
            icon: <FiAward className="text-[#FF6B00] w-6 h-6" />,
            title: "Elite Coaching Strategy",
            description: "Train directly with specialized, verified master coaches focused strictly on aggressive structural performance benchmarks."
        },
        {
            icon: <FiTarget className="text-[#FF6B00] w-6 h-6" />,
            title: "Data-Driven Customization",
            description: "No generic routines. Get adaptive program metrics adjusted dynamically to match your active muscle recovery states."
        },
        {
            icon: <FiUsers className="text-[#FF6B00] w-6 h-6" />,
            title: "High-Octane Community",
            description: "Forge powerful connections inside an inner-circle forum of passionate athletes pushing past structural limits."
        },
        {
            icon: <FiTrendingUp className="text-[#FF6B00] w-6 h-6" />,
            title: "Integrated Recovery Systems",
            description: "Balance training intensity with professional biomechanical guidance, core mobility, and custom nutrition paths."
        }
    ];

    return (
        // Uses bg-background to perfectly respect your global.css variables in both modes
        <section className="relative w-full py-20 md:py-28 bg-background text-foreground overflow-hidden px-6 transition-colors duration-300">
            
            {/* Ambient Background Aura Glow - Low opacity so it looks good on both light and dark backgrounds */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-[#FF6B00]/5 dark:bg-[#FF6B00]/5 blur-[150px] pointer-events-none z-0" />
            
            <div className="relative z-10 container mx-auto max-w-6xl">
                
                {/* 1. SECTION HEADER */}
                <div className="flex flex-col items-center text-center mb-16 md:mb-24">
                    <span className="text-xs md:text-sm font-bold tracking-widest text-[#FF6B00] uppercase mb-3 bg-[#FF6B00]/10 px-4 py-1.5 rounded-full border border-[#FF6B00]/20">
                        Why Choose Omniflex
                    </span>
                    
                    <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-6 max-w-2xl leading-[1.15]">
                        We Dont Just Build Workouts. <br />
                        <span className="text-[#FF6B00]">We Forge Habits.</span>
                    </h2>
                    
                    <p className="text-base sm:text-lg text-default-500 max-w-xl font-light">
                        An uncompromised premium athletic ecosystem engineering custom tracks to transcend normal physical boundaries.
                    </p>
                </div>

                {/* 2. ASYMMETRIC STRUCTURAL SPLIT LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                    
                    {/* Left Frame: Premium Spotlight Callout */}
                    <div className="lg:col-span-5 h-full">
                        <ScrollAnimation x={-40} y={0}>
                            <div className="h-full relative group flex flex-col justify-between p-8 rounded-2xl bg-default-100/50 dark:bg-white/[0.02] border border-default-200 dark:border-white/10 hover:border-[#FF6B00]/40 overflow-hidden transition-all duration-500">
                                {/* Interactive Hover Glow */}
                                <div className="absolute -inset-px bg-gradient-to-br from-[#FF6B00]/10 dark:from-[#FF6B00]/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                
                                <div className="relative z-10">
                                    <div className="w-12 h-12 rounded-xl bg-[#FF6B00] flex items-center justify-center mb-8 shadow-lg shadow-[#FF6B00]/20">
                                        <FiShield className="text-white w-6 h-6" />
                                    </div>
                                    
                                    <h3 className="text-2xl font-bold mb-4 tracking-tight group-hover:text-[#FF6B00] dark:group-hover:text-[#FF6B00] transition-colors duration-300">
                                        The Omniflex Guarantee
                                    </h3>
                                    <p className="text-default-500 dark:text-zinc-400 font-light leading-relaxed mb-6">
                                        Every single routine layout, training session strategy, and macro milestone target is designed to adapt organically to your active timeline state. We protect your physical safety while systematically shattering plateaus.
                                    </p>
                                </div>

                                <div className="relative z-10 pt-6 border-t border-default-200 dark:border-white/5 flex items-center gap-4 text-default-400 dark:text-zinc-500 group-hover:text-default-600 dark:group-hover:text-zinc-300 transition-colors duration-300">
                                    <FiActivity className="w-5 h-5 animate-pulse text-[#FF6B00]/70" />
                                    <span className="text-xs uppercase font-semibold tracking-wider">Uncompromised Quality Standards</span>
                                </div>
                            </div>
                        </ScrollAnimation>
                    </div>

                    {/* Right Frame: Staggered Quadrant Presentation */}
                    <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {features.map((item, idx) => (
                            <ScrollAnimation key={idx} delay={idx * 0.1}>
                                <div className="h-full group relative p-6 rounded-2xl bg-default-100/50 dark:bg-white/[0.02] border border-default-200 dark:border-white/5 hover:bg-default-200/60 dark:hover:bg-white/[0.04] hover:border-default-300 dark:hover:border-white/10 transition-all duration-300 flex flex-col justify-between">
                                    <div>
                                        {/* Icon Border Box Wrapper */}
                                        <div className="w-10 h-10 rounded-lg bg-default-200 dark:bg-white/[0.03] border border-default-300 dark:border-white/10 flex items-center justify-center mb-5 group-hover:bg-[#FF6B00]/10 group-hover:border-[#FF6B00]/30 transition-all duration-300">
                                            {item.icon}
                                        </div>
                                        
                                        <h4 className="text-lg font-bold mb-2 tracking-tight text-default-800 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white transition-colors">
                                            {item.title}
                                        </h4>
                                        
                                        <p className="text-sm text-default-500 dark:text-zinc-400 font-light leading-relaxed">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            </ScrollAnimation>
                        ))}
                    </div>

                </div>

            </div>
        </section>
    );
}