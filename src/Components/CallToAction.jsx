import { Link } from "@heroui/react";
import { FiArrowRight, FiActivity, FiBriefcase } from "react-icons/fi";

export default function CallToAction() {
    return (
        <section className="relative w-full py-16 md:py-24 bg-background text-foreground overflow-hidden px-6 transition-colors duration-300 border-t border-default-100/40">

            {/* Structural Ambient Glow Backdrop */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] rounded-full bg-[#FF6B00]/5 blur-[130px] pointer-events-none z-0" />

            <div className="relative z-10 container mx-auto max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">

                    {/* CARD 1: MEMBER DRILL-DOWN PATHWAY */}
                    <div className="group relative flex flex-col justify-between p-8 rounded-2xl bg-default-100/40 dark:bg-white/[0.01] border border-default-200 dark:border-white/5 hover:border-[#FF6B00]/40 transition-all duration-300 overflow-hidden">
                        <div className="absolute -inset-px bg-gradient-to-br from-[#FF6B00]/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                        <div className="relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-[#FF6B00]/10 flex items-center justify-center mb-6 text-[#FF6B00] border border-[#FF6B00]/20">
                                <FiActivity className="w-5 h-5 stroke-[2.5]" />
                            </div>
                            <h3 className="text-2xl font-black tracking-tight mb-3">
                                Ready to Transform Your <span className="text-[#FF6B00]">Performance?</span>
                            </h3>
                            <p className="text-sm text-default-500 font-light leading-relaxed mb-8 max-w-md">
                                Unlock structured athletic programs, manage dynamic fitness milestones, and synchronize your recovery loops alongside certified master coaches.
                            </p>
                        </div>

                        <div className="relative z-10">
                            <Link
                                href="/all_classes"
                                underline="none"
                                className="inline-flex items-center gap-2 text-xs uppercase font-bold tracking-wider text-[#FF6B00] hover:text-[#E56000] transition-colors no-underline"
                            >
                                Explore Classes <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>

                    {/* CARD 2: EXPERT / TRAINER PATHWAY (Replaces the generic demo banner) */}
                    <div className="group relative flex flex-col justify-between p-8 rounded-2xl bg-default-100/40 dark:bg-white/[0.01] border border-default-200 dark:border-white/5 hover:border-[#FF6B00]/40 transition-all duration-300 overflow-hidden">
                        <div className="absolute -inset-px bg-gradient-to-br from-[#FF6B00]/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                        <div className="relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-[#FF6B00]/10 flex items-center justify-center mb-6 text-[#FF6B00] border border-[#FF6B00]/20">
                                <FiBriefcase className="w-5 h-5 stroke-[2.5]" />
                            </div>
                            <h3 className="text-2xl font-black tracking-tight mb-3">
                                Join the Elite Omniflex <span className="text-[#FF6B00]">Roster.</span>
                            </h3>
                            <p className="text-sm text-default-500 font-light leading-relaxed mb-8 max-w-md">
                                Are you a certified athletic builder? Author custom class modules, scale your personal community following, and lead high-octane training tracks.
                            </p>
                        </div>

                        <div className="relative z-10">
                            {/* This link aligns perfectly with your bootcamp's become-a-trainer application route requirements */}
                            <Link
                                href="/become-trainer"
                                underline="none"
                                className="inline-flex items-center gap-3 bg-[#FF6B00] text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl hover:bg-[#E56000] active:scale-[0.98] shadow-md shadow-[#FF6B00]/10 transition-all duration-200 no-underline"
                            >
                                Start Today <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}