import util from './util.js';

class EnvelopeAD {
  constructor(ctx, param, attack = 0.1, release = 0.1, curve = 1, startValue = 1, endValue = 0) {
    this.ctx = ctx;
    this.param = param;
    this.attack = attack;
    this.release = release;
    this.curve = curve;
    this.startValue = startValue;
    this.endValue = endValue;
  }

  triggerAt(time) {
    this.param.cancelScheduledValues(time);
    this.param.setValueAtTime(this.endValue, time, this.curve);
    this.param.setTargetAtTime(this.startValue, time + this.attack, this.curve);
    this.param.setTargetAtTime(this.endValue, time + this.attack + this.release, this.curve);
  }

  panic() {
    this.param.cancelScheduledValues(this.ctx.currentTime);
    this.param.setValueAtTime(0, this.ctx.currentTime);
  }
}

class VCA {
  constructor(ctx, param, attack = 0.0, decay = 0.1, sustain = 0.25, release = 0.5) {
    this.ctx = ctx;
    this.param = param;
    this.attack = attack;
    this.decay = decay;
    this.sustain = sustain;
    this.release = release;
  }

  triggerAt(time, duration, velocity = 1) {
    this.param.cancelScheduledValues(time);
    this.param.setValueAtTime(0, time); //reset
    this.param.linearRampToValueAtTime(1 * velocity, time + this.attack); //A
    this.param.linearRampToValueAtTime(this.sustain * velocity, time + this.attack + this.decay); //D
    this.param.linearRampToValueAtTime(0, time + this.attack + this.decay + duration + this.release); // S+R
  }

  panic() {
    this.param.cancelScheduledValues(this.ctx.currentTime);
    this.param.setValueAtTime(0, this.ctx.currentTime);
  }
}

class Synth {
  constructor(ctx) {
    this.ctx = ctx;

    this.osc = ctx.createOscillator();
    this.osc.type = 'sawtooth';
    this.osc.frequency.value = 110;

    this.gain = ctx.createGain();
    this.gain.gain.setValueAtTime(0.0, this.ctx.currentTime);
    this.vca = new VCA(this.ctx, this.gain.gain);

    this.osc.connect(this.gain);
    this.gain.connect(ctx.destination);
    this.osc.start();
  }

  playNoteAt(time, note) {
    this.osc.frequency.setValueAtTime(note.frequency, time);
    this.vca.triggerAt(time, note.duration, note.velocity);
  }

  panic() {
    this.osc.frequency.cancelScheduledValues(this.ctx.currentTime);
    this.vca.panic();
  }
}

class Ostinato {
  constructor(ctx) {
    this.ctx = ctx;

    this.osc = ctx.createOscillator();
    this.osc.type = 'sine';
    //const midi = (Math.floor(Math.random() * 3) * 12) + 60;
    this.osc.frequency.value = util.midiToFrequency(72);

    this.gain = ctx.createGain();
    this.gain.gain.setValueAtTime(0.0, this.ctx.currentTime);
    this.vca = new VCA(this.ctx, this.gain.gain, 0, 0.1, 0, 0.1);

    this.osc.connect(this.gain);
    this.gain.connect(ctx.destination);
    this.osc.start();
  }

  playNoteAt(time) {
    this.vca.triggerAt(time, 0.1, 0.85);
  }
}

module.exports = {
  EnvelopeAD,
  VCA,
  Synth,
  Ostinato,
};
