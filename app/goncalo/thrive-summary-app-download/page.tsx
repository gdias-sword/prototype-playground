import { SwordLogo } from '@/design/assets/logos/sword';
import { cn } from '@/design/utils';
import appStore from './assets/app-store.svg';
import googlePlay from './assets/google-play.svg';
import icAccessibility from './assets/ic-accessibility.svg';
import icApple from './assets/ic-apple.svg';
import icChevronDown16 from './assets/ic-chevron-down-16.svg';
import icChevronDown20 from './assets/ic-chevron-down-20.svg';
import icStar from './assets/ic-star.svg';
import icWorld from './assets/ic-world.svg';
import pageGradient from './assets/page-gradient.svg';
import qrCode from './assets/qr.svg';
import swordSymbol from './assets/sword-symbol.svg';
import {
  CelebrationBloom,
  CelebrationHeadline,
  CelebrationMark,
  Rise,
} from './celebration';
import {
  OnboardingFrame,
  OnboardingMedia,
  OnboardingMobileStage,
  OnboardingWash,
} from './onboarding-panel';

const MEMBER_FIRST_NAME = 'Gonçalo';

function assetSrc(asset: string | { src: string }) {
  return typeof asset === 'string' ? asset : asset.src;
}

export default function ThriveSummaryAppDownload() {
  return <Screen />;
}

function Screen() {
  return (
    <OnboardingFrame>
      <div className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-white text-[#0d0d0d] max-lg:bg-linear-to-b max-lg:from-white max-lg:to-[#c7ddfb]">
        <PageGradient />
        <OnboardingWash />
        <OnboardingMedia />
        <Header />
        <main className="relative z-2 mx-auto flex min-h-0 w-full max-w-[1080px] flex-1 flex-col overflow-y-auto px-6 pt-[max(64px,calc(env(safe-area-inset-top)+40px))] lg:flex-row lg:items-center lg:overflow-visible lg:px-16 lg:py-10 xl:px-0">
          <Content />
        </main>
        <Rise
          delay={1}
          className="relative z-2 shrink-0 px-6 pt-4 pb-[max(16px,env(safe-area-inset-bottom))] lg:hidden"
        >
          <DownloadBar />
        </Rise>
      </div>
    </OnboardingFrame>
  );
}

function PageGradient() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-1 hidden overflow-hidden lg:block">
      <div className="absolute bottom-[-1840px] left-1/2 size-[2000px] -translate-x-1/2">
        <img
          alt=""
          src={assetSrc(pageGradient)}
          className="absolute top-[-12%] left-[-12%] block max-w-none"
        />
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="relative z-4 hidden h-20 shrink-0 items-center gap-12 px-6 lg:flex lg:px-16">
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
    </header>
  );
}

function Content() {
  return (
    <div className="flex w-full flex-1 flex-col gap-6 lg:max-w-[min(600px,calc(57.34vw-128px))] lg:flex-none lg:gap-10">
      <div className="relative">
        <CelebrationBloom />
        <div className="relative z-1 flex flex-col">
          <CelebrationMark celebration="confetti" />
          <Rise delay={0.5} className="pt-4 lg:pt-6">
            <CelebrationHeadline celebration="confetti" ending="!">
              You’re all set, {MEMBER_FIRST_NAME}
            </CelebrationHeadline>
          </Rise>
          <Rise delay={0.7} className="pt-2 lg:pt-4">
            <p className="max-w-[460px] text-[15px] leading-[22px] tracking-[0.2px] text-[#0d0d0d]/70 lg:text-[18px] lg:leading-[26px]">
              Your first 5-minute session is next. Download the app to start.
            </p>
          </Rise>
        </div>
      </div>
      <OnboardingMobileStage />
      <Rise delay={0.9} className="hidden items-center gap-6 lg:flex">
        <QrCode />
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-3">
          <p className="text-[18px] leading-[26px] tracking-[0.2px]">
            <span className="font-semibold">Scan the QR code</span> to download
            and start
          </p>
          <AppRating />
          <div className="flex flex-wrap items-center gap-3">
            <img alt="Get it on Google Play" src={assetSrc(googlePlay)} />
            <img alt="Download on the App Store" src={assetSrc(appStore)} />
          </div>
        </div>
      </Rise>
    </div>
  );
}

function QrCode() {
  return (
    <img
      alt="QR code to download the Sword app"
      src={assetSrc(qrCode)}
      className="size-36 shrink-0"
    />
  );
}

function DownloadBar() {
  return (
    <button
      type="button"
      className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#2e2e2e] text-[14px] leading-5 font-semibold tracking-[0.2px] text-white"
    >
      <img alt="" src={assetSrc(icApple)} />
      Download and start your first session
    </button>
  );
}

function AppRating({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="flex size-8 items-center justify-center overflow-clip rounded-[4px] bg-white shadow-[0_3px_6px_rgba(31,34,44,0.05)]">
        <img
          alt=""
          src={assetSrc(swordSymbol)}
          className="h-[21.33px] w-auto"
        />
      </span>
      <span className="flex items-center gap-1">
        <span
          role="img"
          aria-label="Rated 4.8 out of 5"
          className="flex items-center gap-0.5"
        >
          {[0, 1, 2, 3].map((index) => (
            <Star key={index} />
          ))}
          <span className="size-4 shrink-0">
            <span className="block w-[9.6px] overflow-hidden">
              <Star />
            </span>
          </span>
        </span>
        <span className="text-[14px] leading-5 font-semibold tracking-[0.2px]">
          4.8/5
        </span>
      </span>
    </div>
  );
}

function Star() {
  return (
    <span className="relative block size-4 shrink-0">
      <img
        alt=""
        src={assetSrc(icStar)}
        className="absolute top-[1.89px] left-[1.6px]"
      />
    </span>
  );
}
