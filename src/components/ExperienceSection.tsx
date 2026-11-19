import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import { RESTAURANT_IMAGES } from '../lib/restaurantMedia';
import { ResilientImage } from './ResilientImage';
import { LuxuryButton } from './LuxuryButton';

interface GalleryItem {
  id: string;
  src: string;
  title: string;
  subtitle: string;
  alt: string;
  spanClass: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'jantares-especiais',
    src: RESTAURANT_IMAGES.romantic,
    title: 'Jantares Especiais',
    subtitle: 'Iluminação intimista e serviço dedicado para noites memoráveis.',
    alt: 'Mesa para jantar romântico à luz de velas no Restaurante Viva Luanda',
    spanClass: 'md:col-span-7',
  },
  {
    id: 'almocos-negocios',
    src: RESTAURANT_IMAGES.business,
    title: 'Almoços de Negócios',
    subtitle: 'Tranquilidade, discrição e conforto no coração do Miramar.',
    alt: 'Mesa preparada para almoço de negócios no Restaurante Viva Luanda',
    spanClass: 'md:col-span-5',
  },
  {
    id: 'momentos-inesqueciveis',
    src: RESTAURANT_IMAGES.hero,
    title: 'Momentos Inesquecíveis',
    subtitle: 'Arquitectura contemporânea e hospitalidade cuidada ao pormenor.',
    alt: 'Ambiente nocturno da sala principal do Restaurante Viva Luanda',
    spanClass: 'md:col-span-5',
  },
  {
    id: 'gastronomia-detalhe',
    src: RESTAURANT_IMAGES.garoupa,
    title: 'Apresentação Cuidada',
    subtitle: 'Pratos confeccionados e empratados com rigor gastronómico.',
    alt: 'Prato de Garoupa servido no Restaurante Viva Luanda',
    spanClass: 'md:col-span-7',
  },
];

const HIGHLIGHTS = [
  {
    title: 'Jantares Especiais',
    description: 'Celebrações a dois ou em grupo num ambiente sereno e elegante.',
    galleryIndex: 0,
  },
  {
    title: 'Almoços de Negócios',
    description: 'Atendimento atencioso e mesas confortáveis para reuniões de trabalho.',
    galleryIndex: 1,
  },
  {
    title: 'Momentos Inesquecíveis',
    description: 'O equilíbrio entre gastronomia, conforto e a arte de receber em Luanda.',
    galleryIndex: 2,
  },
] as const;

export function ExperienceSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [hoveredGalleryIndex, setHoveredGalleryIndex] = useState<number | null>(null);

  useEffect(() => {
    if (activeIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveIndex(null);
      if (e.key === 'ArrowRight') {
        setActiveIndex((prev) =>
          prev === null ? null : (prev + 1) % GALLERY_ITEMS.length
        );
      }
      if (e.key === 'ArrowLeft') {
        setActiveIndex((prev) =>
          prev === null
            ? null
            : (prev - 1 + GALLERY_ITEMS.length) % GALLERY_ITEMS.length
        );
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeIndex]);

  const activePhoto = activeIndex !== null ? GALLERY_ITEMS[activeIndex] : null;

  return (
    <section
      id="galeria"
      className="bg-[#171916] text-[#F3EBDD] py-20 sm:py-28 border-t border-[#C4A46A]/15"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Header + 3 Interactive Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-14 border-b border-white/10">
          <div className="lg:col-span-5">
            <p className="text-xs tracking-[0.22em] uppercase text-[#C4A46A] font-medium mb-4">
              Experiência & Galeria
            </p>
            <h2
              className="font-serif text-white font-normal leading-[1.1] text-balance"
              style={{ fontSize: 'clamp(2.1rem, 3.6vw, 3.25rem)' }}
            >
              Um ambiente pensado para si.
            </h2>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6 lg:pt-2">
            {HIGHLIGHTS.map((item) => {
              const isHighlighted = hoveredGalleryIndex === item.galleryIndex;
              return (
                <button
                  key={item.title}
                  type="button"
                  onMouseEnter={() => setHoveredGalleryIndex(item.galleryIndex)}
                  onMouseLeave={() => setHoveredGalleryIndex(null)}
                  onClick={() => setActiveIndex(item.galleryIndex)}
                  className={`text-left border-t pt-4 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4A46A] ${
                    isHighlighted
                      ? 'border-[#C4A46A] -translate-y-0.5'
                      : 'border-[#C4A46A]/40 hover:border-[#C4A46A]'
                  }`}
                >
                  <h3 className="font-serif text-xl text-white font-medium flex items-center justify-between gap-2">
                    <span>{item.title}</span>
                    <Expand className="w-3.5 h-3.5 text-[#C4A46A] opacity-70" />
                  </h3>
                  <p className="mt-2 text-sm text-[#F3EBDD]/75 leading-relaxed">
                    {item.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Asymmetric Interactive Gallery */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-12 gap-6">
          {GALLERY_ITEMS.map((item, idx) => {
            const isLinkedActive = hoveredGalleryIndex === idx;
            return (
              <motion.button
                key={item.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.6,
                  delay: idx * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`${item.spanClass} group relative overflow-hidden bg-[#232520] text-left aspect-[4/3] md:aspect-auto md:h-[360px] lg:h-[420px] border transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4A46A] ${
                  isLinkedActive
                    ? 'border-[#C4A46A]'
                    : 'border-white/5 hover:border-[#C4A46A]/60'
                }`}
                aria-label={`Ampliar fotografia: ${item.title}`}
              >
                <ResilientImage
                  src={item.src}
                  alt={item.alt}
                  fallbackTitle={item.title}
                  className={`w-full h-full object-cover transition-transform duration-700 ${
                    isLinkedActive ? 'scale-105' : 'group-hover:scale-105'
                  }`}
                  wrapperClassName="w-full h-full"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[#171916]/90 via-[#171916]/25 to-transparent transition-opacity duration-300"
                />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 flex items-end justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-2xl sm:text-[26px] text-white font-normal">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-[#F3EBDD]/80 max-w-md">
                      {item.subtitle}
                    </p>
                  </div>
                  <span
                    className={`w-11 h-11 border inline-flex items-center justify-center shrink-0 transition-all duration-200 ${
                      isLinkedActive
                        ? 'bg-[#C4A46A] border-[#C4A46A] text-[#171916]'
                        : 'border-[#C4A46A]/50 text-[#C4A46A] bg-[#171916]/60 backdrop-blur-sm group-hover:bg-[#C4A46A] group-hover:text-[#171916]'
                    }`}
                  >
                    <Expand className="w-4 h-4" />
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Interactive Lightbox */}
      <AnimatePresence>
        {activePhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-[#171916]/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-label={activePhoto.title}
            onClick={() => setActiveIndex(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl"
            >
              <div className="flex items-center justify-between text-[#F3EBDD] mb-4">
                <div>
                  <h3 className="font-serif text-2xl text-white">
                    {activePhoto.title}
                  </h3>
                  <p className="text-sm text-[#F3EBDD]/75">{activePhoto.subtitle}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveIndex(null)}
                  aria-label="Fechar galeria"
                  className="w-11 h-11 border border-white/15 inline-flex items-center justify-center text-[#F3EBDD] hover:border-[#C4A46A] hover:text-[#C4A46A] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative aspect-[16/10] w-full overflow-hidden bg-black border border-[#C4A46A]/30">
                <ResilientImage
                  src={activePhoto.src}
                  alt={activePhoto.alt}
                  fallbackTitle={activePhoto.title}
                  className="w-full h-full object-cover"
                  wrapperClassName="w-full h-full"
                />
              </div>

              <div className="mt-5 flex items-center justify-between text-xs text-[#F3EBDD]/70">
                <span className="tabular-nums">
                  {(activeIndex ?? 0) + 1} / {GALLERY_ITEMS.length}
                </span>
                <div className="flex items-center gap-3">
                  <LuxuryButton
                    variant="glass"
                    size="sm"
                    onClick={() =>
                      setActiveIndex((prev) =>
                        prev === null
                          ? 0
                          : (prev - 1 + GALLERY_ITEMS.length) % GALLERY_ITEMS.length
                      )
                    }
                    ariaLabel="Fotografia anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </LuxuryButton>
                  <LuxuryButton
                    variant="glass"
                    size="sm"
                    onClick={() =>
                      setActiveIndex((prev) =>
                        prev === null ? 0 : (prev + 1) % GALLERY_ITEMS.length
                      )
                    }
                    ariaLabel="Próxima fotografia"
                  >
                    Seguinte
                    <ChevronRight className="w-4 h-4" />
                  </LuxuryButton>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
