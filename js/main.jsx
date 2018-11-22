import { h, app } from 'hyperapp';
import { state, actions } from './model.js';
import OctaveControl from './ui/OctaveControl.jsx';
import PlaybackControl from './ui/PlaybackControl.jsx';

const view = (state, actions) => (
  <div id="app">
    <h1>LUTE: inC</h1>
    <PlaybackControl />
    <OctaveControl />
  </div>
);

app(state, actions, view, document.body);

// Synthesis ----------------------------------------
state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let nextOstinatoTime = state.audioCtx.currentTime;
let nextPulseTime = state.audioCtx.currentTime;
let endPhraseTime = state.audioCtx.currentTime;

import work from 'webworkify';
import clockWorker from './clock_worker.js';
const timer = work(clockWorker, state);
import { Synth, Ostinato } from './synth.js';

const myOstinato = new Ostinato(state.audioCtx);

timer.addEventListener('message', (ev) => {
  while (nextOstinatoTime < state.audioCtx.currentTime + 0.5) {
    if (state.ostinatoOn) myOstinato.playNoteAt(nextOstinatoTime);
    nextOstinatoTime += state.secondsPerQuarterNote;
  }
});

const mySynth = new Synth(state.audioCtx);

const playPhrase = (phraseNumber, startTime) => {
  state.phrases[phraseNumber].notes.forEach(note =>
    mySynth.playNoteAt(startTime + note.time, note)
  );
  return startTime + state.phrases[phraseNumber].duration;
};

timer.addEventListener('message', (ev) => {
  while (nextPulseTime < state.audioCtx.currentTime + state.scheduleLookAhead) {
    console.log(`playbutton: ${state.playButtonPressed}`);
    console.log(`shceduled?: ${state.audioCtx.currentTime >= endPhraseTime}`);
    if (state.playButtonPressed && state.audioCtx.currentTime >= endPhraseTime) {
      console.log(`playing phrase at: ${nextPulseTime}`);
      endPhraseTime = playPhrase(state.currentPhrase, nextPulseTime);
      console.log(`end of phrase: ${endPhraseTime}`);
    }
    nextPulseTime += state.secondsPerEighthNote;
    console.log(`nextPulse: ${nextPulseTime}`);
  }
});

timer.postMessage(150);
