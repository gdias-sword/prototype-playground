import icAccessibility from '@/app/goncalo/thrive-summary-app-download/assets/ic-accessibility.svg';
import icChevronDown16 from '@/app/goncalo/thrive-summary-app-download/assets/ic-chevron-down-16.svg';
import icChevronDown20 from '@/app/goncalo/thrive-summary-app-download/assets/ic-chevron-down-20.svg';
import icWorld from '@/app/goncalo/thrive-summary-app-download/assets/ic-world.svg';
import { SwordLogo } from '@/design/assets/logos/sword';
import { cn } from '@/design/utils';
import { ArrowLeft, Menu } from 'lucide-react';
import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { useTuning, type Tuning } from './tuning';

function rise(tuning: Tuning, delay: number) {
  return {
    initial: { opacity: 0, y: tuning.stepDistance },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: tuning.stepDuration,
      delay,
      ease: [0.2, 0.8, 0, 1] as const,
    },
  };
}

export function assetSrc(asset: string | { src: string }) {
  return typeof asset === 'string' ? asset : asset.src;
}

export function Header() {
  return (
    <header className="relative z-20 flex h-16 shrink-0 items-center gap-12 px-6 lg:h-20 lg:px-16">
      <SwordLogo className="h-6 w-[97px]" />
      <div className="flex-1" />
      <div className="hidden items-center gap-6 text-[14px] leading-5 font-semibold tracking-[0.2px] lg:flex">
        <button
          type="button"
          className="flex cursor-pointer items-center gap-2"
        >
          <img alt="" src={assetSrc(icWorld)} />
          <span className="flex items-center gap-1">
            <span>
              US <span className="font-normal">(EN)</span>
            </span>
            <img alt="" src={assetSrc(icChevronDown16)} />
          </span>
        </button>
        <button
          type="button"
          aria-label="Accessibility"
          className="flex size-6 cursor-pointer items-center justify-center"
        >
          <img alt="" src={assetSrc(icAccessibility)} />
        </button>
        <button
          type="button"
          className="flex h-10 cursor-pointer items-center gap-2 rounded-xl text-[#1f222c]"
        >
          Member Name
          <img alt="" src={assetSrc(icChevronDown20)} />
        </button>
      </div>
      <button type="button" aria-label="Menu" className="p-2 lg:hidden">
        <Menu className="size-6" strokeWidth={1.75} />
      </button>
    </header>
  );
}

interface FooterProps {
  label?: string;
  note?: ReactNode;
  isSolid?: boolean;
  delay?: number;
  onPrevious?: () => void;
  onContinue: () => void;
}

export function Footer({
  label = 'Continue',
  note,
  isSolid = true,
  delay,
  onPrevious,
  onContinue,
}: FooterProps) {
  const tuning = useTuning();
  return (
    <motion.div
      {...rise(tuning, delay ?? tuning.footerDelay)}
      className={cn(
        'absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-4 px-6 py-6 lg:py-8',
        isSolid &&
          'bg-white/70 [mask-image:linear-gradient(to_bottom,transparent,black_24px)] backdrop-blur-xl',
      )}
    >
      {note}
      <div className="flex w-full items-center justify-center gap-4">
        {onPrevious && (
          <button
            type="button"
            onClick={onPrevious}
            aria-label="Previous"
            className="flex h-12 shrink-0 cursor-pointer items-center justify-center rounded-2xl bg-[#e8e8e8] text-[14px] leading-5 font-semibold tracking-[0.2px] transition-colors hover:bg-[#dedede] max-lg:w-12 lg:w-[180px]"
          >
            <ArrowLeft className="size-5 lg:hidden" strokeWidth={1.75} />
            <span className="max-lg:hidden">Previous</span>
          </button>
        )}
        <button
          type="button"
          onClick={onContinue}
          className="flex h-12 cursor-pointer items-center justify-center rounded-2xl bg-[#4a89e8] px-8 text-[14px] leading-5 font-semibold tracking-[0.2px] text-white transition-colors hover:bg-[#3f7bd6] max-lg:flex-1 lg:min-w-[180px]"
        >
          {label}
        </button>
      </div>
    </motion.div>
  );
}

export function Container({
  header,
  children,
}: {
  header: ReactNode;
  children?: ReactNode;
}) {
  const tuning = useTuning();
  return (
    <div className="mx-auto flex w-full max-w-[608px] flex-col gap-8 px-6 pt-6 pb-40 lg:gap-10 lg:pt-8">
      <motion.div
        {...rise(tuning, tuning.headerDelay)}
        className="flex flex-col gap-8 lg:gap-10"
      >
        {header}
      </motion.div>
      {children && (
        <motion.div
          {...rise(tuning, tuning.contentDelay)}
          className="flex flex-col gap-8 lg:gap-10"
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}

export function ProgressBar({
  total,
  current,
}: {
  total: number;
  current: number;
}) {
  return (
    <div className="-mt-2 flex gap-1 lg:-mt-4">
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={cn(
            'h-1 flex-1 rounded-full',
            index <= current ? 'bg-[#4a89e8]' : 'bg-[#c2c2c2]',
          )}
        />
      ))}
    </div>
  );
}

export function SubHeader({
  title,
  description,
}: {
  title: ReactNode;
  description?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-serif text-[28px] leading-9 tracking-[-0.4px]">
        {title}
      </h1>
      {description && (
        <p className="text-[16px] leading-[22px] tracking-[0.2px]">
          {description}
        </p>
      )}
    </div>
  );
}
