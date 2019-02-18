import util from './util.js';
import phrasesJSON from '../phrases/phrases.json';
import { Synth, Ostinato } from './synth.js';

// Synthesis ----------------------------------------
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let nextOstinatoTime = audioCtx.currentTime;
let nextPulseTime = audioCtx.currentTime;
let endPhraseTime = audioCtx.currentTime;

const myOstinato = new Ostinato(audioCtx);
const mySynth = new Synth(audioCtx);

const playPhrase = (phraseNumber, startTime) => {
  state.phrases[phraseNumber].notes.forEach(note =>
    mySynth.playNoteAt(startTime + note.time, note)
  );
  return startTime + state.phrases[phraseNumber].duration;
};

export const state = {
  audioCtx: null,
  scheduleLookAhead: 0.02, // seconds
  bpm: 120,
  secondsPerQuarterNote: 0.5, // 60s / bpm
  secondsPerEighthNote: 0.25, // 30s / bpm
  ostinatoOn: false,
  octave: 0,
  currentPhrase: 0,
  playButtonHeld: false,
  playHalfSpeed: false,
  phrases: phrasesJSON.map(({ duration, notes }) =>
    ({
      duration: util.parseTimeString(duration, 120),
      notes: notes.map(note => Object.assign(note, {
        frequency: util.midiToFrequency(note['midi']),
        time: util.parseTimeString(note['time'], 120),
        duration: util.parseTimeString(note['duration'], 120),
      })),
    })
  ),
};

export const actions = {

  playButtonPressed: playHalfSpeed => state => ({
    playButtonHeld: true,
    playHalfSpeed,
  }),

  playButtonReleased: () => state => ({
    playButtonHeld: false,
  }),

  nextPhrase: () => state => ({
    currentPhrase: ((state.currentPhrase < state.phrases.length) ? state.currentPhrase + 1 : state.currentPhrase)
  }),

  previousPhrase: () => state => ({
    currentPhrase: ((state.currentPhrase > 0) ? state.currentPhrase - 1 : state.currentPhrase)
  }),

  setBpm: bpm => state => ({
    bpm,
    secondsPerQuarterNote: 60.0 / bpm,
    secondsPerEighthNote: 30.0 / bpm,
    phrases: state.phrases.map(({ duration, notes }) => ({
      duration: util.parseTimeString(duration, bpm),
      notes: notes.map(note => Object.assign(note, {
        time: util.parseTimeString(note['time'], bpm),
        duration: util.parseTimeString(note['duration'], bpm),
      })),
    })),
  }),

  octaveDown: () => state => ({
    octave: ((state.octave > -3) ? state.octave - 1 : state.octave),
    phrases: state.phrases.map(({ duration, notes }) => ({
      duration,
      notes: notes.map(note => Object.assign(note, {
        frequency: util.midiToFrequency(note['midi'], state.octave * 12)
      })),
    })),
  }),

  octaveUp: () => state => ({
    octave: ((state.octave < 3) ? state.octave + 1 : state.octave),
    phrases: state.phrases.map(({ duration, notes }) => ({
      duration,
      notes: notes.map(note => Object.assign(note, {
        frequency: util.midiToFrequency(note['midi'], state.octave * 12)
      })),
    })),
  }),

  toggleOstinato: () => state => ({
    ostinatoOn: !state.ostinatoOn,
  }),

  _schedulerCallback: () => state => {
    while (nextPulseTime < audioCtx.currentTime + state.scheduleLookAhead) {
      // console.log("%cState Change", "border: 2px solid rebeccapurple; width: 100%; padding: 2em; font-weight: bold; font-size: 18px;");
      // console.log(`playbutton: ${state.playButtonHeld}`);
      // console.log(`shceduled?: ${audioCtx.currentTime >= endPhraseTime}`);
      if (state.playButtonHeld && audioCtx.currentTime >= endPhraseTime) {
        // console.log(`playing phrase at: ${nextPulseTime}`);
        endPhraseTime = playPhrase(state.currentPhrase, nextPulseTime);
        // console.log(`end of phrase: ${endPhraseTime}`);
      }
      nextPulseTime += state.secondsPerEighthNote;
      // console.log(`nextPulse: ${nextPulseTime}`);
    }
  },

  _ostinatoCallback: () => state => {
    while (nextOstinatoTime < audioCtx.currentTime + 0.15) {
      if (state.ostinatoOn) myOstinato.playNoteAt(nextOstinatoTime);
      nextOstinatoTime += state.secondsPerQuarterNote;
    }
  }
};
