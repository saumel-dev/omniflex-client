'use client' // This fixes the Next.js server-action prop error instantly!

import { FiMail, FiPhone, FiMapPin, FiTwitter, FiInstagram, FiYoutube, FiFacebook } from "react-icons/fi";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full bg-[#111827] text-zinc-400 border-t border-zinc-800/80 transition-colors duration-300">
            <div className="container mx-auto max-w-6xl px-2 py-10 md:py-10">

                {/* Top Layout Structure Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 items-start mb-12">

                    {/* Column 1: Core Brand Profile */}
                    <div className="md:col-span-4 space-y-5">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-black tracking-wider text-white">
                                OMNI<span className="text-[#FF6B00]">FLEX</span>
                            </span>
                        </div>
                        <p className="text-sm font-light leading-relaxed max-w-sm text-zinc-400">
                            Elevate your limits with engineering-backed training setups, targeted nutrition planning, and an elite structural support network built for performers.
                        </p>
                        {/* Social Connection Media Panels */}
                        <div className="flex items-center gap-3 pt-2">
                            {[
                                { icon: <FiTwitter className="w-4 h-4" />, href: "#" },
                                { icon: <FiInstagram className="w-4 h-4" />, href: "#" },
                                { icon: <FiYoutube className="w-4 h-4" />, href: "#" },
                                { icon: <FiFacebook className="w-4 h-4" />, href: "#" },
                            ].map((social, idx) => (
                                <a
                                    key={idx}
                                    href={social.href}
                                    className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-[#FF6B00] hover:border-[#FF6B00]/30 hover:bg-zinc-800/50 transition-all duration-200"
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Column 2: Navigation Links */}
                    <div className="md:col-span-2 space-y-4">
                        <h4 className="text-xs font-bold tracking-widest text-white uppercase">
                            Quick Navigation
                        </h4>
                        <ul className="space-y-2.5 text-sm font-light">
                            {[
                                { name: "Home Base", href: "#" },
                                { name: "All Classes", href: "#" },
                                { name: "Community Forum", href: "#" },
                                { name: "Member Portal", href: "#" },
                            ].map((link, idx) => (
                                <li key={idx}>
                                    <a href={link.href} className="hover:text-white transition-colors duration-200">
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Contact Information */}
                    <div className="md:col-span-3 space-y-4">
                        <h4 className="text-xs font-bold tracking-widest text-white uppercase">
                            Contact Desk
                        </h4>
                        <ul className="space-y-3.5 text-sm font-light">
                            <li className="flex gap-3 items-start">
                                <FiMapPin className="w-4 h-4 mt-0.5 text-[#FF6B00] flex-shrink-0" />
                                <span className="leading-tight">128 Pulse Blvd, Cyber District, Dhaka, Bangladesh</span>
                            </li>
                            <li className="flex gap-3 items-center">
                                <FiPhone className="w-4 h-4 text-[#FF6B00] flex-shrink-0" />
                                <span>+880 1712-345678</span>
                            </li>
                            <li className="flex gap-3 items-center">
                                <FiMail className="w-4 h-4 text-[#FF6B00] flex-shrink-0" />
                                <span className="hover:text-white transition-colors duration-200 cursor-pointer">
                                    contact@omniflex.com
                                </span>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Newsletter Box Container */}
                    <div className="md:col-span-3 space-y-4">
                        <h4 className="text-xs font-bold tracking-widest text-white uppercase">
                            Stay Updated
                        </h4>
                        <p className="text-xs font-light leading-relaxed text-zinc-400">
                            Subscribe to unlock elite workout guidelines, performance blueprints, and weekly athletic insight catalogs.
                        </p>
                        <form onSubmit={(e) => e.preventDefault()} className="space-y-2.5 pt-1">
                            <div className="relative flex items-center">
                                <input
                                    type="email"
                                    placeholder="Enter email address"
                                    className="w-full text-xs p-3.5 pr-14 rounded-xl border border-zinc-800 bg-zinc-900/60 text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]/20 transition-all"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 px-3 py-1.5 rounded-lg bg-[#FF6B00] hover:bg-[#E56000] text-white text-xs font-bold transition-all duration-200 active:scale-[0.96]"
                                >
                                    Join
                                </button>
                            </div>
                        </form>
                    </div>

                </div>

                {/* Separator Line */}
                <div className="w-full h-px bg-zinc-800/60 my-8" />

                {/* Bottom Section Layout */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-light">
                    <p>© {currentYear} OmniFlex Fitness. All Rights Reserved.</p>
                    <div className="flex items-center gap-6">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-white transition-colors">Support Center</a>
                    </div>
                </div>

            </div>
        </footer>
    );
}