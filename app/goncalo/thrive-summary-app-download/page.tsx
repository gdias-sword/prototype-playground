'use client';

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
import qrBase from './assets/qr-base.svg';
import qrCenter from './assets/qr-center.png';
import qrFinderBlCore from './assets/qr-finder-bl-core.svg';
import qrFinderBl from './assets/qr-finder-bl.svg';
import qrFinderTlCore from './assets/qr-finder-tl-core.svg';
import qrFinderTl from './assets/qr-finder-tl.svg';
import qrFinderTrCore from './assets/qr-finder-tr-core.svg';
import qrFinderTr from './assets/qr-finder-tr.svg';
import qrModules from './assets/qr-modules.svg';
import swordSymbol from './assets/sword-symbol.svg';
import { OnboardingPanel } from './onboarding-panel';

const MEMBER_FIRST_NAME = 'Gonçalo';

function assetSrc(asset: string | { src: string }) {
  return typeof asset === 'string' ? asset : asset.src;
}

export default function ThriveSummaryAppDownload() {
  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-white text-[#0d0d0d]">
      <PageGradient />
      <OnboardingPanel />
      <Header />
      <main className="relative z-2 mx-auto flex w-full max-w-[1080px] flex-1 items-start px-6 pt-6 pb-28 lg:items-center lg:px-16 lg:py-10 xl:px-0">
        <Content />
      </main>
      <DownloadBar />
    </div>
  );
}

function PageGradient() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-1">
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
    <div className="flex w-full flex-col gap-6 lg:max-w-[min(600px,calc(57.34vw-128px))] lg:gap-10">
      <AppRating className="lg:hidden" />
      <div className="flex flex-col gap-3">
        <p className="font-serif text-[22px] leading-7 font-normal tracking-[-0.4px] lg:text-[28px] lg:leading-9">
          Welcome, {MEMBER_FIRST_NAME}
        </p>
        <h1 className="font-serif text-[32px] leading-10 font-semibold tracking-[-0.4px] lg:text-[40px] lg:leading-12">
          Download the Sword app and get started
        </h1>
      </div>
      <div className="hidden items-center gap-6 lg:flex">
        <QrCode />
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-3">
          <p className="text-[18px] leading-[26px] tracking-[0.2px]">
            <span className="font-semibold">Scan the QR code</span> to download
          </p>
          <AppRating />
          <div className="flex flex-wrap items-center gap-3">
            <img alt="Get it on Google Play" src={assetSrc(googlePlay)} />
            <img alt="Download on the App Store" src={assetSrc(appStore)} />
          </div>
        </div>
      </div>
    </div>
  );
}

const QR_LAYERS = [
  { asset: qrModules, x: 3.3, y: 3.3 },
  { asset: qrFinderTl, x: 3.3, y: 3.3 },
  { asset: qrFinderTlCore, x: 11.1, y: 11.1 },
  { asset: qrFinderTr, x: 89.1, y: 3.3 },
  { asset: qrFinderTrCore, x: 96.9, y: 11.1 },
  { asset: qrFinderBl, x: 3.3, y: 89.1 },
  { asset: qrFinderBlCore, x: 11.1, y: 96.9 },
];

function QrCode() {
  return (
    <div
      role="img"
      aria-label="QR code to download the Sword app"
      className="relative size-30 shrink-0 overflow-clip"
    >
      <img alt="" src={assetSrc(qrBase)} className="absolute inset-0" />
      {QR_LAYERS.map(({ asset, x, y }) => (
        <img
          key={assetSrc(asset)}
          alt=""
          src={assetSrc(asset)}
          className="absolute"
          style={{ left: x, top: y }}
        />
      ))}
      <img
        alt=""
        src={assetSrc(qrCenter)}
        className="absolute top-[45.3px] left-[45.3px] size-[29.1px]"
      />
    </div>
  );
}

function DownloadBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-4 px-6 pt-4 pb-[max(16px,env(safe-area-inset-bottom))] lg:hidden">
      <button
        type="button"
        className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#2e2e2e] text-[14px] leading-5 font-semibold tracking-[0.2px] text-white"
      >
        <img alt="" src={assetSrc(icApple)} />
        Download on the App Store
      </button>
    </div>
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
