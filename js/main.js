// Globals
const scheduleLookAhead = 100; //ms
const bpm = 132;
const secondsPerBeat = 60.0 / bpm; // s / bpm

const work = require('webworkify');
const util = require('./util.js');

const phrases = require('../phrases/phrases.json').map(({ duration, notes }) =>
  ({
    duration: util.parseTimeString(duration, bpm),
    notes: notes.map(note => Object.assign(note, {
      midi: util.midiToFrequency(note['midi']),
      time: util.parseTimeString(note['time'], bpm),
      duration: util.parseTimeString(note['duration'], bpm),
    })),
  })
);

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let nextNoteTime = audioCtx.currentTime;

const sinOsc = audioCtx.createOscillator();
sinOsc.type = 'sawtooth';
sinOsc.frequency.value = 110;
sinOsc.start();

const gainNode = audioCtx.createGain();
gainNode.gain.value = 0.0;

sinOsc.connect(gainNode);
gainNode.connect(audioCtx.destination);

const timer = work(require('./clock_worker.js'));

timer.addEventListener('message', function (ev) {
  while (nextNoteTime < audioCtx.currentTime + scheduleLookAhead) {
    gainNode.gain.setTargetAtTime(0.5, nextNoteTime, 0.01);
    gainNode.gain.setTargetAtTime(0.0, nextNoteTime + 0.05, 0.01);
    nextNoteTime += secondsPerBeat;
  }
});

timer.postMessage(1);
