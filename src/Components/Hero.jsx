'use client'
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react"; // Use "framer-motion" if your project uses older import syntax
import { Button, Link } from "@heroui/react";

export default function Hero() {
    // Array of words for the typing text loop effect
    const words = ["Strongest", "Healthiest", "Relentless", "Toughest"];
    const [currentWordIdx, setCurrentWordIdx] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentWordIdx((prev) => (prev + 1) % words.length);
        }, 3000); // Swaps words every 3 seconds
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="relative min-h-screen w-full overflow-hidden flex items-center justify-center px-6 py-12 md:py-20 bg-background">

            {/* 1. BACKGROUND IMAGE WITH ACCENT OVERLAY */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
                style={{ backgroundImage: `url('/hero.jpg')` }} // Ensure hero.jpg is placed inside your public/ folder
            />
            {/* Dark tint wrapper to ensure clean contrast text */}
            <div className="absolute inset-0 bg-black/75 md:bg-black/70 z-10" />

            {/* 2. EVEN SIDE-EDGE GLOWS (As marked on your screenshot) */}
            {/* Left Edge Glow */}
            <div className="absolute top-1/2 -translate-y-1/2 -left-32 w-80 h-[80%] rounded-full bg-[#FF6B00]/15 blur-[100px] md:blur-[140px] z-20 pointer-events-none" />
            {/* Right Edge Glow */}
            <div className="absolute top-1/2 -translate-y-1/2 -right-32 w-80 h-[80%] rounded-full bg-[#FF6B00]/15 blur-[100px] md:blur-[140px] z-20 pointer-events-none" />

            {/* 3. MAIN CONTENT LAYER */}
            <div className="relative z-30 container mx-auto flex flex-col items-center text-center max-w-4xl">

                {/* Small Tagline Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#FF6B00]/30 bg-[#FF6B00]/10 backdrop-blur-md mb-6"
                >
                    <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-pulse" />
                    <span className="text-xs md:text-sm font-medium text-[#FF6B00] tracking-wide uppercase">
                        Premium Fitness Platform
                    </span>
                </motion.div>

                {/* Optimized Headline - Fully Responsive with Smooth Width Anchoring */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.2] sm:leading-[1.15] mb-6 text-center"
                >
                    <span className="flex flex-col sm:flex-row items-center justify-center gap-x-4 gap-y-2 flex-wrap">
                        <span>Forge Your</span>

                        {/* Dynamic Text Box */}
                        <span className="relative inline-block text-[#FF6B00] h-[1.15em] min-w-[220px] sm:min-w-[290px] md:min-w-[360px] text-center sm:text-left">
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={currentWordIdx}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    transition={{ type: "spring", stiffness: 140, damping: 14 }}
                                    className="absolute inset-0 w-full text-center"
                                >
                                    {words[currentWordIdx]}
                                </motion.span>
                            </AnimatePresence>
                        </span>

                        <span>Self</span>
                    </span>
                </motion.h1>

                {/* Paragraph Description */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-base sm:text-lg md:text-xl text-zinc-300 max-w-2xl font-light leading-relaxed mb-10"
                >
                    Join <span className="text-white font-medium">Omniflex</span> — where top certified trainers, dynamic custom programs, and a goal-driven community forum push you past your boundaries.
                </motion.p>

                {/* CTA Button Action Row */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto"
                >
                    {/* Primary Button Wrapper - Glow on Hover */}
                    <div className="relative group w-3/4 max-w-[260px] sm:w-auto sm:max-w-none">
                        {/* Orange Outer Glow Layer with matching ease-out timeline */}
                        <div className="absolute -inset-1 bg-[#FF6B00] rounded-xl blur-md opacity-0 group-hover:opacity-60 transition-all duration-500 ease-out scale-95 group-hover:scale-105 pointer-events-none" />


                        <Link href="/all_classes" className={"no-underline"}><Button
                            className="relative w-full sm:w-auto bg-[#FF6B00] font-semibold text-base h-12 px-8 rounded-xl text-white no-underline shadow-lg transition-all duration-500 ease-out hover:scale-105 active:scale-98"
                        >Explore Classes</Button></Link>

                    </div>

                    {/* Secondary Button Wrapper - Glow on Hover */}
                    <div className="relative group w-3/4 max-w-[260px] sm:w-auto sm:max-w-none">
                        {/* Subtle White/Light Glow Layer with matching ease-out timeline */}
                        <div className="absolute -inset-1 bg-white rounded-xl blur-md opacity-0 group-hover:opacity-20 transition-all duration-500 ease-out scale-95 group-hover:scale-105 pointer-events-none" />

                        <Button
                            as={Link}
                            href="/register"
                            variant="bordered"
                            className="relative w-full border-white/20 text-white font-medium text-base h-12 px-8 rounded-xl bg-white/5 backdrop-blur-sm transition-all duration-500 ease-out hover:bg-white/10 hover:border-white/40 hover:scale-105 active:scale-98"
                        >
                            Join Free
                        </Button>
                    </div>
                </motion.div>

            </div>
        </section>
    );
}