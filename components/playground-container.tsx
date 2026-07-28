import { mergeTailwindClasses as cn } from '@/utils/tailwind';

interface PlaygroundContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PlaygroundContainer({
  children,
  className,
}: PlaygroundContainerProps) {
  return (
    <main
      className={cn(
        'mx-auto flex w-full max-w-(--breakpoint-lg) grow flex-col gap-15 px-5 pt-10 pb-36 md:gap-20 md:px-10 lg:w-[calc(100%-20rem)] lg:pb-18',
        className,
      )}
    >
      {children}
    </main>
  );
}
