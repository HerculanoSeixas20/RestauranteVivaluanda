import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, X, ArrowRight, Eye, CalendarCheck } from 'lucide-react';
import type { MenuCategory, MenuItem } from '../types/restaurant';
import { ResilientImage } from './ResilientImage';
import { LuxuryButton } from './LuxuryButton';

interface MenuSectionProps {
  categories: MenuCategory[];
  items: MenuItem[];
  isLoading: boolean;
  onReserveWithDish?: (dishName: string) => void;
}

export function MenuSection({
  categories,
  items,
  isLoading,
  onReserveWithDish,
}: MenuSectionProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [fullMenuOpen, setFullMenuOpen] = useState(false);
  const [inspectedDish, setInspectedDish] = useState<MenuItem | null>(null);

  const categoryLookup = useMemo(() => {
    const record: Record<string, MenuCategory> = {};
    for (const cat of categories) {
      record[cat.id] = cat;
    }
    return record;
  }, [categories]);

  const visibleItems = useMemo(() => {
    if (selectedCategoryId === 'all') {
      return items;
    }
    return items.filter((item) => item.categoryId === selectedCategoryId);
  }, [items, selectedCategoryId]);

  const selectedCategory =
    selectedCategoryId === 'all' ? null : categoryLookup[selectedCategoryId] ?? null;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFullMenuOpen(false);
        setInspectedDish(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleRequestWithDish = (dishName: string) => {
    setInspectedDish(null);
    setFullMenuOpen(false);
    onReserveWithDish?.(dishName);
    const target = document.getElementById('reservas');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="menu" className="bg-white text-[#171916] py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-10 border-b border-[#51483D]/15">
          <div className="max-w-2xl">
            <p className="text-xs tracking-[0.22em] uppercase text-[#51483D] font-semibold mb-3">
              Gastronomia · Destaques da Carta
            </p>
            <h2
              className="font-serif text-[#171916] font-normal leading-[1.1] text-balance"
              style={{ fontSize: 'clamp(2.1rem, 3.6vw, 3.25rem)' }}
            >
              Uma viagem de sabores.
            </h2>
          </div>

          <LuxuryButton
            variant="outline-light"
            size="md"
            onClick={() => setFullMenuOpen(true)}
          >
            <BookOpen className="w-4 h-4 text-[#C4A46A]" />
            Consultar Menu Completo
          </LuxuryButton>
        </div>

        {/* Category Filters with animated sliding pill indicator */}
        <div
          role="tablist"
          aria-label="Categorias do menu"
          className="mt-8 flex items-center gap-2 overflow-x-auto pb-3 border-b border-[#51483D]/10"
        >
          <button
            type="button"
            role="tab"
            aria-selected={selectedCategoryId === 'all'}
            onClick={() => setSelectedCategoryId('all')}
            className={`relative px-4 py-2.5 text-xs sm:text-[13px] font-medium tracking-[0.04em] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4A46A] ${
              selectedCategoryId === 'all'
                ? 'text-[#F3EBDD]'
                : 'text-[#51483D] hover:text-[#171916]'
            }`}
          >
            {selectedCategoryId === 'all' && (
              <motion.span
                layoutId="menu-tab-active"
                transition={{ type: 'spring', stiffness: 360, damping: 32 }}
                className="absolute inset-0 bg-[#171916] border border-[#C4A46A]/50"
              />
            )}
            <span className="relative z-10">Destaques</span>
          </button>

          {categories.map((category) => {
            const active = selectedCategoryId === category.id;
            return (
              <button
                key={category.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedCategoryId(category.id)}
                className={`relative px-4 py-2.5 text-xs sm:text-[13px] font-medium tracking-[0.04em] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4A46A] ${
                  active ? 'text-[#F3EBDD]' : 'text-[#51483D] hover:text-[#171916]'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="menu-tab-active"
                    transition={{ type: 'spring', stiffness: 360, damping: 32 }}
                    className="absolute inset-0 bg-[#171916] border border-[#C4A46A]/50"
                  />
                )}
                <span className="relative z-10">{category.name}</span>
              </button>
            );
          })}
        </div>

        {/* Menu Showcase Grid */}
        {isLoading ? (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-10">
            {[1, 2, 3, 4].map((skeleton) => (
              <div key={skeleton} className="animate-pulse">
                <div className="aspect-[4/3] bg-[#F3EBDD]" />
                <div className="mt-4 h-6 w-1/2 bg-[#F3EBDD]" />
                <div className="mt-2 h-4 w-5/6 bg-[#F3EBDD]/70" />
              </div>
            ))}
          </div>
        ) : visibleItems.length > 0 ? (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-14">
            {visibleItems.map((dish, idx) => {
              const categoryName = categoryLookup[dish.categoryId]?.name ?? 'Carta';
              return (
                <motion.article
                  key={dish.id}
                  layout
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{
                    duration: 0.55,
                    delay: Math.min(idx * 0.08, 0.24),
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="group flex flex-col border-b border-[#51483D]/15 pb-8"
                >
                  <div
                    onClick={() => setInspectedDish(dish)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setInspectedDish(dish);
                      }
                    }}
                    aria-label={`Ver detalhes de ${dish.name}`}
                    className="relative aspect-[4/3] w-full overflow-hidden bg-[#171916] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4A46A]"
                  >
                    <ResilientImage
                      src={dish.imageUrl}
                      alt={`${dish.name} — Restaurante Viva Luanda`}
                      fallbackTitle={dish.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      wrapperClassName="w-full h-full"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-[#171916]/65 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />
                    <span className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#171916]/85 backdrop-blur-md border border-[#C4A46A]/60 text-[#F3EBDD] text-[11px] font-semibold tracking-[0.1em] uppercase opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      <Eye className="w-3.5 h-3.5 text-[#C4A46A]" />
                      Ver Detalhes
                    </span>
                  </div>

                  <div className="mt-6 flex items-baseline justify-between gap-4">
                    <div>
                      <p className="text-xs tracking-[0.14em] uppercase text-[#51483D] font-medium">
                        {categoryName}
                      </p>
                      <h3 className="mt-1 font-serif text-2xl sm:text-[28px] text-[#171916] font-medium leading-tight">
                        {dish.name}
                      </h3>
                    </div>
                    <span className="text-xs sm:text-[13px] font-medium text-[#51483D] whitespace-nowrap shrink-0">
                      {dish.priceDisplay || 'Consulte a nossa equipa'}
                    </span>
                  </div>

                  <p className="mt-3 text-sm sm:text-[15px] text-[#51483D] leading-relaxed">
                    {dish.description}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <LuxuryButton
                      variant="obsidian"
                      size="sm"
                      onClick={() => setInspectedDish(dish)}
                    >
                      <Eye className="w-3.5 h-3.5 text-[#C4A46A]" />
                      Explorar Prato
                    </LuxuryButton>
                    <LuxuryButton
                      variant="outline-light"
                      size="sm"
                      onClick={() => handleRequestWithDish(dish.name)}
                    >
                      <CalendarCheck className="w-3.5 h-3.5 text-[#C4A46A]" />
                      Incluir na Reserva
                    </LuxuryButton>
                  </div>
                </motion.article>
              );
            })}
          </div>
        ) : (
          <div className="mt-12 py-14 px-6 sm:px-10 bg-[#F3EBDD]/55 border border-[#51483D]/15 text-center max-w-3xl mx-auto">
            <p className="text-xs tracking-[0.2em] uppercase text-[#51483D] font-semibold">
              {selectedCategory?.name}
            </p>
            <h3 className="mt-3 font-serif text-2xl sm:text-3xl text-[#171916]">
              Propostas disponíveis mediante consulta
            </h3>
            <p className="mt-3 text-sm sm:text-base text-[#51483D] leading-relaxed max-w-xl mx-auto">
              {selectedCategory?.description ||
                'A selecção desta secção varia de acordo com a disponibilidade diária da cozinha.'}{' '}
              Consulte a nossa equipa no restaurante ou ao solicitar a sua reserva.
            </p>
            <div className="mt-6 flex justify-center">
              <LuxuryButton variant="obsidian" size="md" href="#reservas">
                Solicitar informações com a equipa
                <ArrowRight className="w-3.5 h-3.5 text-[#C4A46A]" />
              </LuxuryButton>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Dish Quick-Inspect Modal */}
      <AnimatePresence>
        {inspectedDish && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-[#171916]/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dish-inspect-title"
            onClick={() => setInspectedDish(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#171916] text-[#F3EBDD] w-full max-w-2xl border border-[#C4A46A]/45 overflow-hidden shadow-2xl"
            >
              <div className="relative aspect-[16/10] w-full bg-black">
                <ResilientImage
                  src={inspectedDish.imageUrl}
                  alt={inspectedDish.name}
                  fallbackTitle={inspectedDish.name}
                  className="w-full h-full object-cover"
                  wrapperClassName="w-full h-full"
                />
                <button
                  type="button"
                  onClick={() => setInspectedDish(null)}
                  aria-label="Fechar pré-visualização do prato"
                  className="absolute top-4 right-4 w-10 h-10 bg-[#171916]/80 backdrop-blur-md border border-[#C4A46A]/50 text-[#F3EBDD] hover:text-[#C4A46A] inline-flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 sm:p-8 space-y-5">
                <div className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <p className="text-xs tracking-[0.18em] uppercase text-[#C4A46A]">
                      {categoryLookup[inspectedDish.categoryId]?.name ?? 'Carta'}
                    </p>
                    <h3
                      id="dish-inspect-title"
                      className="mt-1 font-serif text-3xl text-white font-normal"
                    >
                      {inspectedDish.name}
                    </h3>
                  </div>
                  <span className="text-xs text-[#F3EBDD]/75 whitespace-nowrap">
                    {inspectedDish.priceDisplay || 'Consulte a nossa equipa'}
                  </span>
                </div>

                <p className="text-sm sm:text-base text-[#F3EBDD]/85 leading-relaxed">
                  {inspectedDish.description}
                </p>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                  <LuxuryButton
                    variant="gold"
                    size="md"
                    onClick={() => handleRequestWithDish(inspectedDish.name)}
                  >
                    <CalendarCheck className="w-4 h-4" />
                    Solicitar Mesa com Esta Sugestão
                  </LuxuryButton>
                  <LuxuryButton
                    variant="glass"
                    size="md"
                    onClick={() => setInspectedDish(null)}
                  >
                    Fechar
                  </LuxuryButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Menu Modal */}
      <AnimatePresence>
        {fullMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-[#171916]/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="full-menu-modal-title"
            onClick={() => setFullMenuOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#F3EBDD] text-[#171916] w-full max-w-4xl max-h-[88vh] overflow-y-auto border border-[#C4A46A]/40 shadow-2xl"
            >
              <div className="sticky top-0 z-10 bg-[#171916] text-[#F3EBDD] px-6 sm:px-10 py-6 flex items-center justify-between border-b border-[#C4A46A]/30">
                <div>
                  <p className="text-[11px] tracking-[0.22em] uppercase text-[#C4A46A]">
                    Restaurante Viva Luanda
                  </p>
                  <h3
                    id="full-menu-modal-title"
                    className="font-serif text-2xl sm:text-3xl font-normal mt-1"
                  >
                    Carta Gastronómica
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setFullMenuOpen(false)}
                  aria-label="Fechar menu completo"
                  className="w-10 h-10 inline-flex items-center justify-center text-[#F3EBDD]/80 hover:text-[#C4A46A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4A46A]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-6 sm:px-10 py-8 space-y-10">
                <p className="text-sm text-[#51483D] border-b border-[#51483D]/15 pb-5">
                  Valores e disponibilidade diária confirmados presencialmente pela
                  nossa equipa. Faixa de referência: Kz 20.000+ por pessoa.
                </p>

                {categories.map((category) => {
                  const categoryItems = items.filter(
                    (item) => item.categoryId === category.id
                  );
                  return (
                    <div key={category.id} className="space-y-4">
                      <div className="flex items-baseline justify-between border-b border-[#171916]/20 pb-2">
                        <h4 className="font-serif text-2xl text-[#171916] font-medium">
                          {category.name}
                        </h4>
                        <span className="text-xs text-[#51483D]">
                          {categoryItems.length > 0
                            ? `${categoryItems.length} ${
                                categoryItems.length === 1 ? 'sugestão' : 'sugestões'
                              }`
                            : 'Sob consulta'}
                        </span>
                      </div>

                      {categoryItems.length > 0 ? (
                        <div className="divide-y divide-[#51483D]/15">
                          {categoryItems.map((item) => (
                            <div
                              key={item.id}
                              className="py-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2"
                            >
                              <div className="max-w-xl">
                                <h5 className="font-serif text-xl text-[#171916] font-medium">
                                  {item.name}
                                </h5>
                                <p className="mt-1 text-sm text-[#51483D]">
                                  {item.description}
                                </p>
                              </div>
                              <span className="text-xs font-medium text-[#51483D] whitespace-nowrap shrink-0">
                                {item.priceDisplay || 'Consulte a nossa equipa'}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-[#51483D] italic py-2">
                          Consulte a nossa equipa para conhecer as propostas disponíveis
                          nesta secção.
                        </p>
                      )}
                    </div>
                  );
                })}

                <div className="pt-6 border-t border-[#51483D]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="text-xs text-[#51483D]">
                    Rua de São Tomé, n.º 2, Miramar · +244 946 302 896
                  </span>
                  <LuxuryButton
                    variant="gold"
                    size="md"
                    href="#reservas"
                    onClick={() => setFullMenuOpen(false)}
                  >
                    Reservar Mesa
                  </LuxuryButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
