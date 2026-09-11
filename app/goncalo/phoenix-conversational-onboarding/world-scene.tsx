export function WorldBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 bg-[#f2f2f2]">
      <svg
        aria-hidden
        className="absolute inset-0 size-full"
        viewBox="0 0 375 812"
        preserveAspectRatio="xMidYMax slice"
      >
        <defs>
          <linearGradient
            id="phoenix-canvas-wash"
            x1="187.5"
            y1="0"
            x2="187.5"
            y2="812"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#f7f7f7" />
            <stop offset="0.52" stopColor="#f2f2f2" />
            <stop offset="1" stopColor="#d7e4ff" />
          </linearGradient>
          <radialGradient
            id="phoenix-canvas-glow"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(187.5 812) rotate(-90) scale(420 280)"
          >
            <stop stopColor="#9dbdff" />
            <stop offset="0.42" stopColor="#c3d6ff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#f2f2f2" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="375" height="812" fill="url(#phoenix-canvas-wash)" />
        <rect width="375" height="812" fill="url(#phoenix-canvas-glow)" />
      </svg>
    </div>
  );
}
