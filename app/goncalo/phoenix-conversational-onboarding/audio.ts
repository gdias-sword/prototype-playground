export type ExperienceAudio = {
  unlock: () => void;
  setSpeak: (amount: number) => void;
  setPresent: (on: boolean) => void;
  setMuted: (muted: boolean) => void;
  dispose: () => void;
};

export function createExperienceAudio(): ExperienceAudio {
  let ctx: AudioContext | null = null;
  let bedGain: GainNode | null = null;
  let speakGain: GainNode | null = null;
  let muted = false;
  let present = false;
  let speak = 0;
  let unlocked = false;

  const bedLevel = 0.012;
  const speakLevel = 0.018;

  function apply() {
    if (!bedGain || !speakGain || !ctx) return;
    const now = ctx.currentTime;
    const bed = muted || !present ? 0 : bedLevel;
    const voice = muted || !present ? 0 : speakLevel * speak;
    bedGain.gain.linearRampToValueAtTime(bed, now + 0.25);
    speakGain.gain.linearRampToValueAtTime(voice, now + 0.12);
  }

  function ensure() {
    if (ctx) return;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    ctx = new AudioCtx();

    const master = ctx.createGain();
    master.gain.value = 1;
    master.connect(ctx.destination);

    bedGain = ctx.createGain();
    bedGain.gain.value = 0;
    bedGain.connect(master);

    speakGain = ctx.createGain();
    speakGain.gain.value = 0;
    speakGain.connect(master);

    const oscA = ctx.createOscillator();
    oscA.type = 'sine';
    oscA.frequency.value = 98;
    const oscB = ctx.createOscillator();
    oscB.type = 'sine';
    oscB.frequency.value = 147;
    oscA.connect(bedGain);
    oscB.connect(bedGain);
    oscA.start();
    oscB.start();

    const oscC = ctx.createOscillator();
    oscC.type = 'triangle';
    oscC.frequency.value = 196;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 420;
    oscC.connect(filter);
    filter.connect(speakGain);
    oscC.start();
  }

  return {
    unlock() {
      if (unlocked) return;
      unlocked = true;
      ensure();
      void ctx?.resume();
      apply();
    },
    setSpeak(amount: number) {
      speak = Math.max(0, Math.min(1, amount));
      apply();
    },
    setPresent(on: boolean) {
      present = on;
      apply();
    },
    setMuted(next: boolean) {
      muted = next;
      apply();
    },
    dispose() {
      void ctx?.close();
      ctx = null;
      bedGain = null;
      speakGain = null;
    },
  };
}
