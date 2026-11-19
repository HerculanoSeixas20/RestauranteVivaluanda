import { ExternalLink, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { RESTAURANT_INFO } from '../lib/restaurantMedia';
import { LuxuryButton } from './LuxuryButton';

const FEEDBACK_THEMES = [
  {
    index: '01',
    theme: 'Ambiente acolhedor',
    summary: 'Atmosfera tranquila e envolvente para partilhar à mesa sem pressa.',
  },
  {
    index: '02',
    theme: 'Decoração elegante',
    summary: 'Estética contemporânea com iluminação quente e acabamentos cuidados.',
  },
  {
    index: '03',
    theme: 'Gastronomia gourmet',
    summary: 'Pratos preparados com atenção ao sabor e à apresentação no prato.',
  },
  {
    index: '04',
    theme: 'Atendimento atencioso',
    summary: 'Acompanhamento próximo e cordial desde a chegada até ao final da refeição.',
  },
  {
    index: '05',
    theme: 'Boa experiência de jantar',
    summary: 'Referência procurada no Miramar para jantares especiais e convívio.',
  },
] as const;

export function ReviewsSection() {
  return (
    <section
      id="avaliacoes"
      className="bg-[#F3EBDD] text-[#171916] py-20 sm:py-28 border-b border-[#51483D]/15"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Verified Google Rating Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5"
          >
            <p className="text-xs tracking-[0.22em] uppercase text-[#51483D] font-semibold mb-4">
              Reconhecimento Público
            </p>
            <h2
              className="font-serif text-[#171916] font-normal leading-[1.12] text-balance"
              style={{ fontSize: 'clamp(2rem, 3.4vw, 3rem)' }}
            >
              A experiência dos nossos clientes.
            </h2>

            <div className="mt-8 pt-8 border-t border-[#51483D]/20">
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-5xl sm:text-6xl text-[#171916] font-normal tabular-nums">
                  {RESTAURANT_INFO.ratingValue}
                </span>
                <span className="text-xl text-[#51483D] font-serif tabular-nums">
                  / {RESTAURANT_INFO.ratingMax}
                </span>
              </div>

              <div
                className="mt-3 flex items-center gap-1"
                aria-label="Classificação de 4.2 em 5 estrelas no Google"
              >
                {[1, 2, 3, 4].map((star) => (
                  <Star
                    key={star}
                    className="w-4 h-4 fill-[#C4A46A] text-[#C4A46A]"
                  />
                ))}
                <Star className="w-4 h-4 text-[#C4A46A]" />
              </div>

              <p className="mt-3 text-sm text-[#51483D] font-medium tabular-nums">
                {RESTAURANT_INFO.reviewCount} avaliações no Google
              </p>

              <p className="mt-4 text-sm text-[#51483D] leading-relaxed max-w-sm">
                Aspectos frequentemente destacados pelos visitantes na listagem
                pública do restaurante no Google Maps.
              </p>

              <div className="mt-8">
                <LuxuryButton
                  variant="obsidian"
                  size="md"
                  href={RESTAURANT_INFO.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver Avaliações no Google
                  <ExternalLink className="w-3.5 h-3.5 text-[#C4A46A]" />
                </LuxuryButton>
              </div>
            </div>
          </motion.div>

          {/* Verified Feedback Themes (no fabricated quotes) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 divide-y divide-[#51483D]/15 border-t border-b border-[#51483D]/15"
          >
            {FEEDBACK_THEMES.map((item) => (
              <div
                key={item.index}
                className="group py-5 sm:py-6 px-3 -mx-3 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-8 hover:bg-white/45 transition-colors duration-200"
              >
                <span className="font-serif text-base text-[#C4A46A] font-semibold tabular-nums shrink-0 transition-transform duration-200 group-hover:translate-x-1">
                  {item.index}
                </span>
                <div className="flex-1 transition-transform duration-200 group-hover:translate-x-1">
                  <h3 className="font-serif text-2xl text-[#171916] font-medium">
                    {item.theme}
                  </h3>
                  <p className="mt-1 text-sm text-[#51483D] leading-relaxed">
                    {item.summary}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
