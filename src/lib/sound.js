// Web Audio API synthesized order notification chime
export function playOrderNotificationSound() {
  if (typeof window === 'undefined') return;

  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // Pleasant three-note chime (F5 -> A5 -> C6)
    const notes = [
      { freq: 698.46, start: 0, duration: 0.2 },
      { freq: 880.0, start: 0.15, duration: 0.25 },
      { freq: 1046.5, start: 0.3, duration: 0.45 },
    ];

    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, now + note.start);

      gain.gain.setValueAtTime(0, now + note.start);
      gain.gain.linearRampToValueAtTime(0.3, now + note.start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.start + note.duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + note.start);
      osc.stop(now + note.start + note.duration);
    });
  } catch (e) {
    console.error('Audio playback error:', e);
  }
}
