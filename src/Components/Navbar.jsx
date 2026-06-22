'use client'
import { useState, useEffect } from "react";
import { Link } from "@heroui/react";
import OmniflexLogo from "./OmniflexLogo";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun } from "@gravity-ui/icons";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

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
    return `${baseClasses} ${isActive
      ? "text-[#FF6B00] underline underline-offset-4 decoration-2 decoration-[#FF6B00] font-medium"
      : "text-foreground hover:text-[#FF6B00] no-underline"
      }`;
  };

  return (
    <nav className="fixed top-0 inset-x-0 z-50 w-full border-b border-default-100/40 bg-background/70 backdrop-blur-md transition-all duration-300">
      <header className="container mx-auto max-w-6xl flex h-16 items-center justify-between px-6">

        {/* Left Section: Logo */}
        <div className="flex items-center">
          <OmniflexLogo />
        </div>

        {/* Center Section: Navigation Links */}
        <ul className="hidden items-center gap-6 md:flex text-sm">
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
        <div className="flex items-center gap-4 md:gap-8">

          {/* Fixed Theme Toggle Button without formatting breaks */}
          <button
            aria-label="Toggle Theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center justify-center h-8 w-8 rounded-xl border border-default-200 bg-default-100/50 backdrop-blur-sm hover:bg-default-200 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <span className="flex items-center justify-center transition-none!">
              {/* Safely handle icon mounting state to prevent internal SVG property mismatches */}
              {!mounted ? (
                <div className="w-[15px] h-[15px]" />
              ) : theme === "dark" ? (
                <Sun width={15} height={15} className="transition-none!" />
              ) : (
                <Moon width={15} height={15} className="transition-none!" />
              )}
            </span>
          </button>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-8 text-sm">
            <Link
              href="/login"
              underline="none"
              className={getLinkClass("/login")}
            >
              Login
            </Link>

            <button className="bg-[#FF6B00] text-white font-semibold px-4 py-2 text-xs rounded-xl cursor-pointer hover:bg-[#E56000] active:scale-98 transition-all duration-200">
              <Link href="/register" underline="none" className="text-white no-underline hover:no-underline">
                Register
              </Link>
            </button>
          </div>

          {/* Mobile Hamburger Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Menu"
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

      {/* --- MOBILE DROPDOWN MENU --- */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mx-4 mt-2 rounded-2xl border border-default-200 bg-background/95 backdrop-blur-lg p-4 shadow-xl md:hidden">
          <ul className="flex flex-col gap-1 pb-4 text-sm">
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

          <div className="border-t border-default-100 my-2" />

          <div className="flex items-center justify-between pt-2 px-1 text-sm">
            <Link
              href="/login"
              underline="none"
              className={getLinkClass("/login", "py-2")}
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </Link>
            <button className="bg-[#FF6B00] text-white font-semibold px-4 py-2 text-xs rounded-xl cursor-pointer hover:bg-[#E56000] active:scale-98 transition-all duration-200">
              <Link href="/register" underline="none" className="text-white no-underline hover:no-underline" onClick={() => setIsMenuOpen(false)}>
                Register
              </Link>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}