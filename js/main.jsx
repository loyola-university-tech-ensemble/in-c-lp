const state = {
  scheduleLookAhead: 0.02, // seconds
  bpm: 120,
  secondsPerQuarterNote: 0.5, // 60s / bpm
  secondsPerEighthNote: 0.25, // 30s / bpm
  ostinatoOn: true,
};

// Preact -------------------------------------------
import preact from 'preact';

preact.render((
  <div id="foo">
    <span>Hello, world!</span>
    <button onClick={ e => alert("hi!") }>Click Me</button>
  </div>
), document.body);

// Synthesis ----------------------------------------
import util from './util.js';

import phrasesJSON from '../phrases/phrases.json';
const phrases = phrasesJSON.map(({ duration, notes }) =>
  ({
    duration: util.parseTimeString(duration, state.bpm),
    notes: notes.map(note => Object.assign(note, {
      frequency: util.midiToFrequency(note['midi']),
      time: util.parseTimeString(note['time'], state.bpm),
      duration: util.parseTimeString(note['duration'], state.bpm),
    })),
  })
);

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let nextOstinatoTime = audioCtx.currentTime;
let nextPulseTime = audioCtx.currentTime;

import work from 'webworkify';
import clockWorker from './clock_worker.js';
const timer = work(clockWorker, state.bpm);
import { Synth, Ostinato } from './synth.js';

const mySynth = new Synth(audioCtx);
const myOstinato = new Ostinato(audioCtx);

timer.addEventListener('message', function (ev) {
  while (nextOstinatoTime < audioCtx.currentTime + 0.5) {
    if (state.ostinatoOn) myOstinato.playNoteAt(nextOstinatoTime);
    nextOstinatoTime += state.secondsPerQuarterNote;
  }
});

let endPhraseTime = audioCtx.currentTime;
let playButtonPressed = false;

const playPhrase = (phraseNumber, startTime) => {
  phrases[phraseNumber].notes.forEach(note =>
    mySynth.playNoteAt(startTime + note.time, note)
  );
  return startTime + phrases[phraseNumber].duration;
};

timer.addEventListener('message', function (ev) {
  while (nextPulseTime < audioCtx.currentTime + state.scheduleLookAhead) {
    if (playButtonPressed && audioCtx.currentTime >= endPhraseTime) {
      console.log(`playing phrase at: ${nextPulseTime}`);
      endPhraseTime = playPhrase(24, nextPulseTime);
      console.log(`end of phrase: ${endPhraseTime}`);
    }
    nextPulseTime += state.secondsPerEighthNote;
    console.log(`nextPulse: ${nextPulseTime}`);
  }
});

timer.postMessage(150);
