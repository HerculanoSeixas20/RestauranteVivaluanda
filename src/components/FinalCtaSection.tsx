import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { RESTAURANT_IMAGES } from '../lib/restaurantMedia';
import { ResilientImage } from './ResilientImage';
import { LuxuryButton } from './LuxuryButton';

export function FinalCtaSection() {
  return (
    <section className="relative py-28 sm:py-36 bg-[#171916] text-white overflow-hidden">
      <div className="absolute inset-0">
        <ResilientImage
          src={RESTAURANT_IMAGES.romantic}
          alt="Ambiente nocturno acolhedor no Restaurante Viva Luanda"
          className="w-full h-full object-cover"
          wrapperClassName="w-full h-full"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[#171916]/78"
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-xs tracking-[0.24em] uppercase text-[#C4A46A] font-medium mb-4">
            Miramar · Luanda
          </p>
          <h2
            className="font-serif font-normal text-white leading-[1.1] text-balance"
            style={{ fontSize: 'clamp(2.25rem, 4.2vw, 3.6rem)' }}
          >
            Viva momentos. Descubra sabores.
          </h2>
          <p className="mt-5 text-base sm:text-lg text-[#F3EBDD]/85 max-w-xl mx-auto leading-relaxed font-light">
            Esperamos por si para transformar uma simples refeição numa experiência
            especial.
          </p>

          <div className="mt-10 flex justify-center">
            <LuxuryButton variant="gold" size="lg" href="#reservas">
              <Sparkles className="w-4 h-4" />
              Reservar Agora
            </LuxuryButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
