import util from './util.js';
import phrasesJSON from '../phrases/phrases.json';

export const state = {
  audioCtx: null,
  scheduleLookAhead: 0.02, // seconds
  bpm: 120,
  secondsPerQuarterNote: 0.5, // 60s / bpm
  secondsPerEighthNote: 0.25, // 30s / bpm
  ostinatoOn: false,
  octave: 0,
  currentPhrase: 0,
  playButtonPressed: false,
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

  playButtonPressed: (playHalfSpeed) => state => ({
    playButtonPressed: true,
    playHalfSpeed,
  }),

  playButtonReleased: () => state => ({
    playButtonPressed: false,
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

};
