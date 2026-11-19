import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { LuxuryButton } from './LuxuryButton';

const NAV_LINKS = [
  { label: 'Home', href: '#home', id: 'home' },
  { label: 'Sobre Nós', href: '#sobre', id: 'sobre' },
  { label: 'Menu', href: '#menu', id: 'menu' },
  { label: 'Galeria', href: '#galeria', id: 'galeria' },
  { label: 'Experiência', href: '#avaliacoes', id: 'avaliacoes' },
  { label: 'Contactos', href: '#contactos', id: 'contactos' },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>('home');

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);

      const scrollPos = window.scrollY + 140;
      let current = 'home';
      for (const link of NAV_LINKS) {
        const el = document.getElementById(link.id);
        if (el && el.offsetTop <= scrollPos) {
          current = link.id;
        }
      }
      setActiveId(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleLinkClick = () => {
    setMobileOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-300 ${
        scrolled || mobileOpen
          ? 'bg-[#171916]/95 backdrop-blur-md border-b border-[#C4A46A]/20'
          : 'bg-gradient-to-b from-[#171916]/80 to-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 lg:h-20 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line brand wordmark */}
        <a
          href="#home"
          className="inline-flex items-center gap-3 text-white hover:text-[#C4A46A] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4A46A] rounded-sm py-1"
          aria-label="Restaurante Viva Luanda — Início"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 32 32"
            fill="none"
            aria-hidden="true"
            className="shrink-0"
          >
            <rect
              x="1.5"
              y="1.5"
              width="29"
              height="29"
              stroke="#C4A46A"
              strokeWidth="1.2"
            />
            <path
              d="M9.5 10L16 22.5L22.5 10"
              stroke="#F3EBDD"
              strokeWidth="1.5"
              strokeLinecap="square"
            />
            <path d="M14 22.5H22.5" stroke="#C4A46A" strokeWidth="1.3" />
          </svg>
          <span className="font-serif text-xl sm:text-2xl tracking-[0.14em] uppercase font-medium">
            Viva Luanda
          </span>
        </a>

        {/* Zone 2: Single-line navigation links with active scroll indicator */}
        <nav
          aria-label="Navegação principal"
          className="hidden lg:flex items-center gap-6 xl:gap-8"
        >
          {NAV_LINKS.map((link) => {
            const isActive = activeId === link.id;
            return (
              <a
                key={link.href}
                href={link.href}
                className={`relative py-1.5 text-[13px] font-medium tracking-[0.06em] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4A46A] rounded-sm ${
                  isActive
                    ? 'text-[#C4A46A]'
                    : 'text-[#F3EBDD]/85 hover:text-[#C4A46A]'
                }`}
              >
                {link.label}
                {isActive && (
                  <motion.span
                    layoutId="navbar-active-underline"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    className="absolute left-0 right-0 bottom-0 h-[1.5px] bg-[#C4A46A]"
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Futuristic gold CTA + Mobile menu trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:block">
            <LuxuryButton variant="gold" size="sm" href="#reservas">
              Reservar Mesa
            </LuxuryButton>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation-drawer"
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            className="lg:hidden inline-flex items-center justify-center w-11 h-11 text-[#F3EBDD] hover:text-[#C4A46A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4A46A]"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Animated mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-navigation-drawer"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden bg-[#171916] border-t border-[#C4A46A]/20 px-6 py-8"
          >
            <nav aria-label="Menu móvel" className="flex flex-col space-y-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={handleLinkClick}
                  className={`py-3 text-base font-serif tracking-wide border-b border-white/10 transition-colors ${
                    activeId === link.id
                      ? 'text-[#C4A46A]'
                      : 'text-[#F3EBDD] hover:text-[#C4A46A]'
                  }`}
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-5">
                <LuxuryButton
                  variant="gold"
                  size="md"
                  href="#reservas"
                  onClick={handleLinkClick}
                  className="w-full"
                >
                  Reservar Mesa
                </LuxuryButton>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
