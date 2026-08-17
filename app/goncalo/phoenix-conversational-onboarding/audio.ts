export type ExperienceAudio = {
  unlock: () => void;
  getLevel: () => number;
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
  let animationFrame = 0;
  const startedAt = performance.now();

  const bedLevel = 0.012;
  const speakLevel = 0.018;

  function getLevel() {
    const time = (performance.now() - startedAt) / 1000;
    const phrase = 0.5 + 0.5 * Math.sin(time * 2.15 + Math.sin(time * 0.61));
    const syllable =
      0.5 + 0.5 * Math.sin(time * 9.2 + Math.sin(time * 3.7) * 0.8);
    const texture = 0.5 + 0.5 * Math.sin(time * 16.7 + 1.4);
    const envelope =
      0.18 + phrase * 0.22 + syllable ** 1.8 * 0.48 + texture * 0.12;
    return speak * Math.min(1, envelope);
  }

  function apply() {
    if (!bedGain || !speakGain || !ctx) return;
    const now = ctx.currentTime;
    const bed = muted || !present ? 0 : bedLevel;
    const voice = muted || !present ? 0 : speakLevel * getLevel();
    bedGain.gain.linearRampToValueAtTime(bed, now + 0.25);
    speakGain.gain.linearRampToValueAtTime(voice, now + 0.12);
  }

  function animateVoice() {
    if (!ctx || !speakGain) return;
    const voice = muted || !present ? 0 : speakLevel * getLevel();
    speakGain.gain.setTargetAtTime(voice, ctx.currentTime, 0.035);
    animationFrame = requestAnimationFrame(animateVoice);
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

    animationFrame = requestAnimationFrame(animateVoice);
  }

  return {
    unlock() {
      if (unlocked) return;
      unlocked = true;
      ensure();
      void ctx?.resume();
      apply();
    },
    getLevel,
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
      cancelAnimationFrame(animationFrame);
      void ctx?.close();
      ctx = null;
      bedGain = null;
      speakGain = null;
    },
  };
}
