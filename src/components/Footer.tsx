import { Facebook, Instagram, MessageCircle, Settings } from 'lucide-react';
import type { RestaurantSettings } from '../types/restaurant';
import { RESTAURANT_INFO, buildWhatsAppDirectUrl } from '../lib/restaurantMedia';

interface FooterProps {
  settings: RestaurantSettings;
  onOpenAdmin: () => void;
}

export function Footer({ settings, onOpenAdmin }: FooterProps) {
  return (
    <footer className="bg-[#171916] text-[#F3EBDD] border-t border-[#C4A46A]/20">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-14 border-b border-white/10">
          {/* Brand Column */}
          <div className="md:col-span-5">
            <a
              href="#home"
              className="inline-flex items-center gap-3 text-white hover:text-[#C4A46A] transition-colors"
            >
              <svg
                width="26"
                height="26"
                viewBox="0 0 32 32"
                fill="none"
                aria-hidden="true"
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
              <span className="font-serif text-xl tracking-[0.14em] uppercase font-medium">
                Viva Luanda
              </span>
            </a>

            <p className="mt-5 text-sm text-[#F3EBDD]/75 leading-relaxed max-w-sm">
              Um espaço dedicado à gastronomia, ao conforto e à arte de receber na
              zona do Miramar, em Luanda.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram do Restaurante Viva Luanda"
                className="w-10 h-10 border border-white/15 inline-flex items-center justify-center text-[#F3EBDD]/80 hover:border-[#C4A46A] hover:text-[#C4A46A] transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook do Restaurante Viva Luanda"
                className="w-10 h-10 border border-white/15 inline-flex items-center justify-center text-[#F3EBDD]/80 hover:border-[#C4A46A] hover:text-[#C4A46A] transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={buildWhatsAppDirectUrl()}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp do Restaurante Viva Luanda"
                className="w-10 h-10 border border-white/15 inline-flex items-center justify-center text-[#F3EBDD]/80 hover:border-[#C4A46A] hover:text-[#C4A46A] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation Column */}
          <div className="md:col-span-3">
            <h3 className="text-xs tracking-[0.2em] uppercase text-[#C4A46A] font-semibold">
              Navegação
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-[#F3EBDD]/80">
              <li>
                <a href="#home" className="hover:text-[#C4A46A] transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#sobre" className="hover:text-[#C4A46A] transition-colors">
                  Sobre Nós
                </a>
              </li>
              <li>
                <a href="#menu" className="hover:text-[#C4A46A] transition-colors">
                  Menu
                </a>
              </li>
              <li>
                <a href="#galeria" className="hover:text-[#C4A46A] transition-colors">
                  Galeria & Experiência
                </a>
              </li>
              <li>
                <a href="#reservas" className="hover:text-[#C4A46A] transition-colors">
                  Solicitar Reserva
                </a>
              </li>
              <li>
                <a href="#contactos" className="hover:text-[#C4A46A] transition-colors">
                  Contactos
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="md:col-span-4">
            <h3 className="text-xs tracking-[0.2em] uppercase text-[#C4A46A] font-semibold">
              Contactos & Morada
            </h3>
            <div className="mt-5 space-y-3 text-sm text-[#F3EBDD]/80 leading-relaxed">
              <p>{RESTAURANT_INFO.address}</p>
              <p>
                Telefone:{' '}
                <a
                  href={RESTAURANT_INFO.phoneHref}
                  className="text-white hover:text-[#C4A46A] transition-colors tabular-nums"
                >
                  {RESTAURANT_INFO.phoneDisplay}
                </a>
              </p>
              <p>
                WhatsApp:{' '}
                <a
                  href={buildWhatsAppDirectUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-[#C4A46A] transition-colors tabular-nums"
                >
                  {RESTAURANT_INFO.phoneDisplay}
                </a>
              </p>
              <p className="text-xs text-[#F3EBDD]/60">
                Serviços: Dine-in · Takeaway · Delivery
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#F3EBDD]/60">
          <p>
            © {new Date().getFullYear()} {RESTAURANT_INFO.name}. Todos os direitos
            reservados.
          </p>
          <button
            type="button"
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-1.5 text-[#F3EBDD]/70 hover:text-[#C4A46A] transition-colors py-1"
          >
            <Settings className="w-3.5 h-3.5" />
            Área de Gestão
          </button>
        </div>
      </div>
    </footer>
  );
}
