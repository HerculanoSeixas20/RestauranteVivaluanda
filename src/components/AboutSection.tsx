import { motion } from 'motion/react';
import { RESTAURANT_IMAGES } from '../lib/restaurantMedia';
import { ResilientImage } from './ResilientImage';

const QUALITIES = [
  {
    index: '01',
    title: 'Ambiente sofisticado',
    detail: 'Espaço pensado com sobriedade, conforto e iluminação acolhedora no Miramar.',
  },
  {
    index: '02',
    title: 'Gastronomia de qualidade',
    detail: 'Pratos confeccionados com atenção ao detalhe, sabor e apresentação.',
  },
  {
    index: '03',
    title: 'Atendimento atencioso',
    detail: 'Uma equipa dedicada a receber cada convidado com cordialidade e rigor.',
  },
] as const;

export function AboutSection() {
  return (
    <section
      id="sobre"
      className="bg-[#F3EBDD] text-[#171916] py-20 sm:py-28 border-b border-[#51483D]/15"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-stretch">
          {/* Editorial Interior Photograph */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 relative overflow-hidden bg-[#171916]"
          >
            <div className="aspect-[4/3] lg:aspect-auto lg:h-full w-full overflow-hidden">
              <ResilientImage
                src={RESTAURANT_IMAGES.about}
                alt="Interior acolhedor e elegante do Restaurante Viva Luanda no Miramar"
                fallbackTitle="Restaurante Viva Luanda · Miramar"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                wrapperClassName="w-full h-full min-h-[320px]"
              />
            </div>
          </motion.div>

          {/* Editorial Narrative */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 flex flex-col justify-between py-2"
          >
            <div>
              <p className="text-xs tracking-[0.22em] uppercase text-[#51483D] font-semibold mb-4">
                Sobre Nós · Miramar, Luanda
              </p>

              <h2
                className="font-serif text-[#171916] font-normal leading-[1.12] text-balance"
                style={{ fontSize: 'clamp(2rem, 3.4vw, 3rem)' }}
              >
                Mais do que um restaurante. Uma experiência.
              </h2>

              <p className="mt-6 text-base sm:text-[17px] text-[#51483D] leading-[1.75] max-w-xl">
                O Restaurante Viva Luanda é um espaço dedicado à gastronomia, ao
                conforto e à arte de receber. Localizado na prestigiada zona do
                Miramar, em Luanda, oferece um ambiente elegante e acolhedor, ideal
                para encontros especiais, almoços de negócios e momentos de convívio.
              </p>
            </div>

            <div className="mt-10 pt-6 border-t border-[#51483D]/20 divide-y divide-[#51483D]/15">
              {QUALITIES.map((item) => (
                <div
                  key={item.index}
                  className="py-4 first:pt-2 last:pb-0 flex items-baseline gap-5"
                >
                  <span className="font-serif text-lg text-[#C4A46A] font-semibold tabular-nums shrink-0">
                    {item.index}.
                  </span>
                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl text-[#171916] font-medium">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm text-[#51483D] leading-relaxed">
                      {item.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
