'use client'
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import OmniflexLogo from "./OmniflexLogo";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun } from "@gravity-ui/icons";
import { authClient } from "@/app/lib/auth-client";
import { MdOutlineLogout } from "react-icons/md";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const dropdownRef = useRef(null);

  // Better-Auth reactive session data hook
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  useEffect(() => {
    setMounted(true);

    // Close the user profile menu if clicked outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    setIsMenuOpen(false);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          router.refresh();
        }
      }
    });
  };

  const userInitials = user?.name ? user.name.slice(0, 2).toUpperCase() : "U";

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
                className={getLinkClass(link.href)}
              >
                {link.label}
              </Link>
            </li>
          ))}
          
          {/* FIXED: Dashboard displays here ONLY if the user is authenticated */}
          {mounted && user && (
            <li>
              <Link
                href="/dashboard"
                className={getLinkClass("/dashboard")}
              >
                Dashboard
              </Link>
            </li>
          )}
        </ul>

        {/* Right Section: Theme Toggle & Actions */}
        <div className="flex items-center gap-4 md:gap-6">

          {/* Theme Toggle Button */}
          <button
            aria-label="Toggle Theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center justify-center h-8 w-8 rounded-xl border border-default-200 bg-default-100/50 backdrop-blur-sm hover:bg-default-200 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <span className="flex items-center justify-center transition-none!">
              {!mounted ? (
                <div className="w-[15px] h-[15px]" />
              ) : theme === "dark" ? (
                <Sun width={15} height={15} className="transition-none!" />
              ) : (
                <Moon width={15} height={15} className="transition-none!" />
              )}
            </span>
          </button>

          {/* Desktop Actions / Profile View Menu Block */}
          <div className="hidden md:flex items-center text-sm">
            {!mounted || isPending ? (
              <div className="w-8 h-8 rounded-full bg-default-200 animate-pulse" />
            ) : user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center outline-none focus:outline-none transition-transform active:scale-95"
                >
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-xs overflow-hidden border border-primary ring-2 ring-primary/20 ring-offset-2 ring-offset-background cursor-pointer">
                    {user?.image ? (
                      <img 
                        src={user.image} 
                        alt={user.name || "User"} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span>{userInitials}</span>
                    )}
                  </div>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 flex flex-col rounded-2xl border border-divider bg-background p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* Header profile info panel */}
                    <div className="flex flex-col gap-0.5 px-3 py-2.5 border-b border-divider mb-1.5 pointer-events-none">
                      <p className="font-semibold text-sm text-foreground truncate">{user.name}</p>
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <p className="text-xs text-default-400 truncate max-w-[120px]">{user.email}</p>
                        <span className="text-[10px] font-mono tracking-wider uppercase bg-primary-500/10 text-primary px-1.5 py-0.5 rounded-md font-bold">
                          {user.role || "user"}
                        </span>
                      </div>
                    </div>

                    {/* FIXED: Dashboard Link completely removed from here */}

                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-between w-full h-10 px-3 text-sm font-medium text-danger rounded-xl hover:bg-danger-500/10 transition-colors text-left"
                    >
                      <span>Logout</span>
                      <MdOutlineLogout className="text-lg" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <Link
                  href="/login"
                  className={getLinkClass("/login")}
                >
                  Login
                </Link>

                <button className="bg-[#FF6B00] text-white font-semibold px-4 py-2 text-xs rounded-xl cursor-pointer hover:bg-[#E56000] active:scale-98 transition-all duration-200">
                  <Link href="/register" className="text-white no-underline hover:no-underline">
                    Register
                  </Link>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Trigger menu */}
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

      {/* --- MOBILE DROPDOWN LINKS LAYOUT AREA --- */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mx-4 mt-2 rounded-2xl border border-default-200 bg-background/95 backdrop-blur-lg p-4 shadow-xl md:hidden">

          {/* Mobile Context Card Profile wrapper display */}
          {mounted && user && (
            <div className="flex items-center gap-3 px-3 pb-3 mb-2 border-b border-default-100">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm overflow-hidden border border-primary">
                {user?.image ? (
                  <img 
                    src={user.image} 
                    alt={user.name || "User"} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span>{userInitials}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">{user.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-default-400 truncate max-w-[140px]">{user.email}</p>
                  <span className="text-[9px] bg-default-100 font-semibold px-1.5 py-0.5 rounded text-default-600 uppercase font-mono">
                    {user.role || "user"}
                  </span>
                </div>
              </div>
            </div>
          )}

          <ul className="flex flex-col gap-1 pb-4 text-sm">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={getLinkClass(link.href, "block w-full py-2.5 px-3 rounded-xl")}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}

            {mounted && user && (
              <li>
                <Link
                  href="/dashboard"
                  className={getLinkClass("/dashboard", "block w-full py-2.5 px-3 rounded-xl")}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              </li>
            )}
          </ul>

          <div className="border-t border-default-100 my-2" />

          <div className="flex items-center justify-between pt-2 px-1 text-sm">
            {mounted && user ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 font-semibold text-xs rounded-xl bg-danger-500/10 text-danger border border-danger-500/20 active:scale-98 transition-all"
              >
                Logout <MdOutlineLogout className="text-sm" />
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className={getLinkClass("/login", "py-2")}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <button className="bg-[#FF6B00] text-white font-semibold px-4 py-2 text-xs rounded-xl cursor-pointer hover:bg-[#E56000] active:scale-98 transition-all duration-200">
                  <Link href="/register" className="text-white no-underline hover:no-underline" onClick={() => setIsMenuOpen(false)}>
                    Register
                  </Link>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}