import { type MouseEvent, type ReactNode, useRef } from 'react';
import { motion } from 'motion/react';

export type LuxuryButtonVariant = 'gold' | 'obsidian' | 'glass' | 'outline-light';

interface BaseProps {
  variant?: LuxuryButtonVariant;
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

type LuxuryLinkProps = BaseProps & {
  href: string;
  target?: string;
  rel?: string;
  onClick?: () => void;
};

type LuxuryButtonElementProps = BaseProps & {
  href?: undefined;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
};

export type LuxuryButtonProps = LuxuryLinkProps | LuxuryButtonElementProps;

const VARIANT_CLASSES: Record<LuxuryButtonVariant, string> = {
  gold: 'bg-gradient-to-r from-[#C4A46A] via-[#d2b57f] to-[#C4A46A] text-[#171916] border border-[#e2c998]/60 shadow-[0_0_24px_rgba(196,164,106,0.22)] hover:shadow-[0_0_32px_rgba(196,164,106,0.45)]',
  obsidian:
    'bg-[#171916] text-[#F3EBDD] border border-[#C4A46A]/45 shadow-[0_4px_20px_rgba(23,25,22,0.22)] hover:border-[#C4A46A] hover:shadow-[0_0_26px_rgba(196,164,106,0.24)]',
  glass:
    'bg-white/[0.06] backdrop-blur-md text-[#F3EBDD] border border-[#F3EBDD]/35 hover:border-[#C4A46A] hover:text-[#C4A46A] hover:bg-white/[0.11] hover:shadow-[0_0_24px_rgba(196,164,106,0.18)]',
  'outline-light':
    'bg-transparent text-[#171916] border border-[#171916]/45 hover:bg-[#171916] hover:text-[#F3EBDD] hover:border-[#171916] hover:shadow-[0_8px_24px_rgba(23,25,22,0.16)]',
};

const SIZE_CLASSES: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'px-5 py-2.5 text-xs',
  md: 'px-6 py-3.5 text-xs',
  lg: 'px-8 py-4 text-xs sm:text-sm',
};

export function LuxuryButton(props: LuxuryButtonProps) {
  const { variant = 'gold', size = 'md', children, className = '' } = props;
  const elementRef = useRef<HTMLElement | null>(null);

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    const el = elementRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty('--mx', `${x}px`);
    el.style.setProperty('--my', `${y}px`);
  };

  const sharedClasses = `luxury-btn group inline-flex items-center justify-center gap-2.5 font-semibold tracking-[0.11em] uppercase whitespace-nowrap shrink-0 transition-[background-color,border-color,color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4A46A] ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`;

  const innerContent = (
    <>
      <span className="luxury-btn-sweep" aria-hidden="true" />
      {/* Precision architectural corner reticles */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 w-2 h-2 border-t border-l border-current opacity-40 group-hover:opacity-100 group-hover:w-3 group-hover:h-3 transition-all duration-200"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 w-2 h-2 border-b border-r border-current opacity-40 group-hover:opacity-100 group-hover:w-3 group-hover:h-3 transition-all duration-200"
      />
      <span className="relative z-10 inline-flex items-center justify-center gap-2.5">
        {children}
      </span>
    </>
  );

  if (typeof props.href === 'string') {
    return (
      <motion.a
        ref={(node) => {
          elementRef.current = node;
        }}
        href={props.href}
        target={props.target}
        rel={props.rel}
        onClick={props.onClick}
        onMouseMove={handleMouseMove}
        whileHover={{ y: -1.5 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
        className={sharedClasses}
      >
        {innerContent}
      </motion.a>
    );
  }

  return (
    <motion.button
      ref={(node) => {
        elementRef.current = node;
      }}
      type={props.type ?? 'button'}
      disabled={props.disabled}
      onClick={props.onClick}
      aria-label={props.ariaLabel}
      onMouseMove={handleMouseMove}
      whileHover={props.disabled ? undefined : { y: -1.5 }}
      whileTap={props.disabled ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
      className={`${sharedClasses} disabled:opacity-55 disabled:cursor-not-allowed`}
    >
      {innerContent}
    </motion.button>
  );
}
