'use client'
import { useState, useEffect } from "react";
import { Link, Button } from "@heroui/react";
import OmniflexLogo from "./OmniflexLogo";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes"; // Import useTheme

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme(); // Destructure theme settings

  // Wait until mounted on the client to safely show the theme state
  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "All Classes", href: "/all_classes" },
    { label: "Community Forum", href: "/forum" },
  ];

  const getLinkClass = (href, baseClasses = "") => {
    const isActive = pathname === href;
    return `${baseClasses} ${
      isActive 
        ? "text-[#FF6B00] underline underline-offset-4 decoration-2 decoration-[#FF6B00] font-medium" 
        : "text-foreground hover:text-[#FF6B00] no-underline"
    }`;
  };

  return (
    <nav className="relative z-40 container mx-auto bg-transparent">
      {/* --- DESKTOP & MOBILE HEADER ROW --- */}
      <header className="flex h-16 items-center justify-between px-6">

        {/* Left Section: Logo */}
        <div className="flex items-center">
          <OmniflexLogo />
        </div>

        {/* Center Section: Navigation Links (Desktop) */}
        <ul className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link 
                href={link.href} 
                underline="none"
                className={getLinkClass(link.href)}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right Section: Theme Toggle & Actions */}
        <div className="flex items-center gap-4">
          
          {/* Theme/Mode Button (Desktop) */}
          <button 
            aria-label="Toggle theme" 
            className="hidden md:block p-2 text-foreground hover:opacity-80 transition-opacity"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {/* Show different icons based on the active theme state */}
            {mounted && theme === "dark" ? (
              /* Sun Icon for Dark Mode (Switches to Light) */
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707m2.828 5.657a4 4 0 118 0 4 4 0 01-8 0z" />
              </svg>
            ) : (
              /* Moon Icon for Light Mode (Switches to Dark) */
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Desktop Right Actions */}
          <div className="hidden items-center gap-4 md:flex">
            <Link 
              href="/login" 
              underline="none"
              className={getLinkClass("/login")}
            >
              Login
            </Link>
            <Button>Register</Button>
          </div>

          {/* Mobile Menu Hamburger Trigger */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* --- CONTAINER DROPDOWN (Mobile) --- */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mx-4 mt-2 rounded-2xl border bg-background p-4 shadow-xl md:hidden">

          {/* Mobile Navigation Links */}
          <ul className="flex flex-col gap-1 pb-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link 
                  href={link.href} 
                  underline="none"
                  className={getLinkClass(link.href, "block w-full py-2.5 px-3 rounded-xl")}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Divider line before action row */}
          <div className="border-t my-2" />

          {/* Mobile Bottom Action Row */}
          <div className="flex items-center justify-between pt-2 px-1">
            <Link 
              href="/login" 
              underline="none"
              className={getLinkClass("/login", "py-2")}
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </Link>
            
            {/* Mobile Theme Toggle placed cleanly near actions */}
            <button 
              aria-label="Toggle theme" 
              className="p-2 border rounded-xl"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {mounted && theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>

            <Button>
              Register
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}