export function WorldBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="phoenix-mesh-a absolute top-[-10%] left-1/2 h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,170,150,0.35),rgba(150,160,255,0.18),transparent_68%)] blur-2xl" />
      <div className="phoenix-mesh-b absolute bottom-[-8%] left-1/2 h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle_at_center,rgba(140,160,255,0.28),rgba(255,190,170,0.16),transparent_70%)] blur-3xl" />
    </div>
  );
}
