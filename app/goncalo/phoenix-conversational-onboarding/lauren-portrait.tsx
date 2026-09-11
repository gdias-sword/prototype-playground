import { cn } from '@/design/utils';
import virtualPt from './assets/virtual-pt.png';
import { PT } from './script';

const src = typeof virtualPt === 'string' ? virtualPt : virtualPt.src;

export const laurenPortraitSrc = src;

export function LaurenPortrait({
  className,
  decorative = false,
}: {
  className?: string;
  decorative?: boolean;
}) {
  return (
    <img
      alt={decorative ? '' : PT}
      aria-hidden={decorative || undefined}
      src={src}
      className={cn(
        'size-full rounded-full object-cover object-[center_22%]',
        className,
      )}
    />
  );
}
