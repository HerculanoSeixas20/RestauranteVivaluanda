import { type MouseEvent, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowDown, ArrowUpRight, Sparkles } from 'lucide-react';
import { RESTAURANT_IMAGES } from '../lib/restaurantMedia';
import { ResilientImage } from './ResilientImage';
import { LuxuryButton } from './LuxuryButton';

export function HeroSection() {
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setParallax({ x: nx * -14, y: ny * -10 });
  };

  return (
    <section
      id="home"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setParallax({ x: 0, y: 0 })}
      className="relative min-h-screen w-full overflow-hidden bg-[#171916] flex items-center"
    >
      {/* Background luxury dining room photograph with subtle interactive parallax */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ scale: 1.06, opacity: 0.85 }}
          animate={{
            scale: 1.03,
            opacity: 1,
            x: parallax.x,
            y: parallax.y,
          }}
          transition={{
            scale: { duration: 1.4, ease: [0.16, 1, 0.3, 1] },
            opacity: { duration: 1.1 },
            x: { type: 'spring', stiffness: 70, damping: 24 },
            y: { type: 'spring', stiffness: 70, damping: 24 },
          }}
          className="w-full h-full"
        >
          <ResilientImage
            src={RESTAURANT_IMAGES.hero}
            alt="Sala principal do Restaurante Viva Luanda no Miramar com mesas elegantes e iluminação acolhedora"
            loading="eager"
            className="w-full h-full object-cover object-center"
            wrapperClassName="w-full h-full"
          />
        </motion.div>
        {/* Measured scrim for crisp WCAG AA contrast */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-[#171916]/80 via-[#171916]/55 to-[#171916]/90"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#171916]/80 via-[#171916]/35 to-transparent"
        />
      </div>

      {/* Hero Editorial Content */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-5 sm:px-8 pt-28 pb-24">
        <div className="max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-xs sm:text-sm tracking-[0.22em] uppercase text-[#C4A46A] font-medium mb-6"
          >
            Restaurante Viva Luanda · Miramar, Luanda
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif text-white font-normal leading-[1.08] tracking-[-0.01em] text-balance"
            style={{ fontSize: 'clamp(2.5rem, 4.8vw, 4.35rem)' }}
          >
            Uma experiência de sabor que merece ser vivida.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 text-base sm:text-lg text-[#F3EBDD]/90 leading-relaxed max-w-xl font-light"
          >
            Descubra o prazer da gastronomia num ambiente sofisticado, onde cada
            detalhe foi pensado para proporcionar momentos inesquecíveis.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <LuxuryButton variant="gold" size="lg" href="#reservas">
              <Sparkles className="w-4 h-4" />
              Reservar uma Mesa
            </LuxuryButton>
            <LuxuryButton variant="glass" size="lg" href="#menu">
              Explorar Menu
              <ArrowUpRight className="w-4 h-4 text-[#C4A46A] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </LuxuryButton>
          </motion.div>
        </div>
      </div>

      {/* Subtle Scroll Indicator */}
      <motion.a
        href="#sobre"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        aria-label="Descer para saber mais sobre o Restaurante Viva Luanda"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-[#F3EBDD]/70 hover:text-[#C4A46A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4A46A] p-2"
      >
        <span className="text-[11px] tracking-[0.22em] uppercase">Descobrir</span>
        <motion.span
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ArrowDown className="w-4 h-4 text-[#C4A46A]" />
        </motion.span>
      </motion.a>
    </section>
  );
}
