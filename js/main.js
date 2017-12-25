"use strict";
(function() {
  const Tone = require('tone');
  const phrases = require('../assets/phrases.json');

  const totalPatterns = 53;

  const patternView = document.querySelector('.pattern-view');
  const forwardButton = document.querySelector('.forward');
  const backwardButton = document.querySelector('.backward');
  const ostinatoButton = document.querySelector('.ostinato');
  const playButton = document.querySelector('.play');

  forwardButton.onclick = () => {
    const pattern = (parseInt(patternView.dataset.pattern, 10) + 1) % totalPatterns;
    patternView.dataset.pattern = pattern;
    patternView.src = `assets/images/Sco${pattern+1}.png`;
  };

  backwardButton.onclick = () => {
    const n = parseInt(patternView.dataset.pattern, 10);
    const pattern = (n-1 >= 0) ? n-1 : totalPatterns-1;
    patternView.dataset.pattern = pattern;
    patternView.src = `assets/images/Sco${pattern+1}.png`;
  };

  const ostinato = new Tone.Synth({
    "oscillator" : {
      "type" : "pwm",
      "modulationFrequency" : 0.2
    },
    "envelope" : {
      "attack" : 0.02,
      "decay" : 0.5,
      "sustain" : 0.0,
      "release" : 0.7,
    }
  }).toMaster();

  const synth = new Tone.Synth({
    "oscillator" : {
      "type" : "pwm",
      "modulationFrequency" : 0.2
    },
    "envelope" : {
      "attack" : 0.02,
      "decay" : 0.5,
      "sustain" : 0.0,
      "release" : 0.4,
    }
  }).toMaster();

  const loop = new Tone.Loop(function(time){
    ostinato.triggerAttackRelease("C3", "4n", time);
  }, "8n");
  loop.start(0).stop("32m");

  const part = new Tone.Part(function(time, note){
    synth.triggerAttackRelease(note.name, note.duration, time, note.velocity);
  }, phrases[0].notes);

  ostinatoButton.onclick = () => {
    // clear transport timeline
    Tone.Transport._timeline = new Tone.Timeline();

    playButton.dataset.scheduled = false;

    // stop/start transport
    Tone.Transport.toggle();
  };

  playButton.onclick = () => {
    if (playButton.dataset.scheduled !== 'true') {
      Tone.Transport.schedule(function(time){
        synth.triggerAttackRelease("C5", "4n", time);
        part.start(time).stop(phrases[0].duration);
        playButton.dataset.scheduled = false;
      }, "@1m");
      playButton.dataset.scheduled = true;
    }
  }

})();
