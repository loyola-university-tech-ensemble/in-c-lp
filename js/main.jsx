import { h, app } from 'hyperapp';
import { state, actions } from './model.js';
import OctaveControl from './ui/OctaveControl.jsx';

const view = (state, actions) => (
  <div id="app">
    <h1>LUTE: inC</h1>
    <OctaveControl />
  </div>
);

app(state, actions, view, document.body);

// Synthesis ----------------------------------------
state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let nextOstinatoTime = state.audioCtx.currentTime;
let nextPulseTime = state.audioCtx.currentTime;

import work from 'webworkify';
import clockWorker from './clock_worker.js';
const timer = work(clockWorker, state.bpm);
import { Synth, Ostinato } from './synth.js';

const myOstinato = new Ostinato(state.audioCtx);

timer.addEventListener('message', function (ev) {
  while (nextOstinatoTime < state.audioCtx.currentTime + 0.5) {
    if (state.ostinatoOn) myOstinato.playNoteAt(nextOstinatoTime);
    nextOstinatoTime += state.secondsPerQuarterNote;
  }
});

const mySynth = new Synth(state.audioCtx);
let endPhraseTime = state.audioCtx.currentTime;
let playButtonPressed = false;

const playPhrase = (phraseNumber, startTime) => {
  state.phrases[phraseNumber].notes.forEach(note =>
    mySynth.playNoteAt(startTime + note.time, note)
  );
  return startTime + state.phrases[phraseNumber].duration;
};

timer.addEventListener('message', function (ev) {
  while (nextPulseTime < state.audioCtx.currentTime + state.scheduleLookAhead) {
    if (playButtonPressed && state.audioCtx.currentTime >= endPhraseTime) {
      //console.log(`playing phrase at: ${nextPulseTime}`);
      endPhraseTime = playPhrase(24, nextPulseTime);
      //console.log(`end of phrase: ${endPhraseTime}`);
    }
    nextPulseTime += state.secondsPerEighthNote;
    //console.log(`nextPulse: ${nextPulseTime}`);
  }
});

timer.postMessage(150);
