// Globals
const scheduleLookAhead = 0.02; //s
const bpm = 120;
const secondsPerQuarterNote = 60.0 / bpm; // s / bpm
const secondsPerEighthNote = 30.0 / bpm; // s / bpm

const util = require('./util.js');

const phrases = require('../phrases/phrases.json').map(({ duration, notes }) =>
  ({
    duration: util.parseTimeString(duration, bpm),
    notes: notes.map(note => Object.assign(note, {
      frequency: util.midiToFrequency(note['midi']),
      time: util.parseTimeString(note['time'], bpm),
      duration: util.parseTimeString(note['duration'], bpm),
    })),
  })
);

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let nextOstinatoTime = audioCtx.currentTime;
let nextPulseTime = audioCtx.currentTime;

const ostinatoOsc = audioCtx.createOscillator();
ostinatoOsc.type = 'triangle';
ostinatoOsc.frequency.value = util.midiToFrequency(60); // C4
ostinatoOsc.start();

const ostinatoGain = audioCtx.createGain();
ostinatoGain.gain.value = 0.0;

ostinatoOsc.connect(ostinatoGain);
ostinatoGain.connect(audioCtx.destination);

const work = require('webworkify');
const timer = work(require('./clock_worker.js'), bpm);
const { Synth } = require('./synth.js');

const mySynth = new Synth(audioCtx);

const playPhrase = (phraseNumber, startTime) => {
  phrases[phraseNumber].notes.forEach(note =>
    mySynth.playNoteAt(startTime + note.time, note)
  );
  return startTime + phrases[phraseNumber].duration;
};

const checkbox = document.querySelector('#clock');

let playButtonPressed = false;
const playButton = document.querySelector('#play');
playButton.onmousedown = () => { playButtonPressed = true; };
playButton.onmouseup = () => { playButtonPressed = false; };

timer.addEventListener('message', function (ev) {
  while (nextOstinatoTime < audioCtx.currentTime + 0.5) {
    if (checkbox.checked) {
      ostinatoGain.gain.setValueAtTime(0, nextOstinatoTime);
      ostinatoGain.gain.linearRampToValueAtTime(0.9, nextOstinatoTime + 0.01);
      ostinatoGain.gain.linearRampToValueAtTime(0.0, nextOstinatoTime + secondsPerEighthNote);
    }
    nextOstinatoTime += secondsPerQuarterNote;
  }
});

let endPhraseTime = audioCtx.currentTime;

timer.addEventListener('message', function (ev) {
  while (nextPulseTime < audioCtx.currentTime + scheduleLookAhead) {
    if (playButtonPressed && audioCtx.currentTime >= endPhraseTime) {
      console.log(`playing phrase at: ${nextPulseTime}`);
      endPhraseTime = playPhrase(24, nextPulseTime);
      console.log(`end of phrase: ${endPhraseTime}`);
    }
    nextPulseTime += secondsPerEighthNote;
    console.log(`nextPulse: ${nextPulseTime}`);
  }
});

timer.postMessage(150);
