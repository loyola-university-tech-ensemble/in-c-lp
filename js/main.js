"use strict";
(function() {
  const Tone = require('tone');
  const phrases = require('../assets/phrases.json');

  const totalPatterns = 53;

  const patternView = document.querySelector('.pattern-view');
  const svgView = document.querySelector('.svg-view');
  const forwardButton = document.querySelector('.forward');
  const backwardButton = document.querySelector('.backward');
  const ostinatoButton = document.querySelector('.ostinato');
  const playButton = document.querySelector('.play');

  forwardButton.onclick = () => {
    const pattern = (parseInt(patternView.dataset.pattern, 10) + 1) % totalPatterns;
    patternView.dataset.pattern = pattern;
    patternView.src = `assets/images/Sco${pattern+1}.png`;
    svgView.src = `assets/svgs/${pattern+1}.svg`;
  };

  backwardButton.onclick = () => {
    const n = parseInt(patternView.dataset.pattern, 10);
    const pattern = (n-1 >= 0) ? n-1 : totalPatterns-1;
    patternView.dataset.pattern = pattern;
    patternView.src = `assets/images/Sco${pattern+1}.png`;
    svgView.src = `assets/svgs/${pattern+1}.svg`;
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

  Tone.Transport.scheduleRepeat((time) => {
    ostinato.triggerAttackRelease("C3", "8n", time, 0.3);
    ostinato.triggerAttackRelease("C3", "8n", `${time} + 8n`, 0.1);
  }, "4n");

  const parts = phrases.map(p =>
    new Tone.Part((time, note) => {
        synth.triggerAttackRelease(
          note.pitch,
          note.duration,
          time,
          note.velocity
        );
      }, p.notes
    )
  );

  ostinatoButton.onclick = () => {
    playButton.dataset.scheduled = false;
    Tone.Transport.cancel(); // wipe transport
    Tone.Transport.toggle();
    ostinatoButton.dataset.active = Tone.Transport.state;
  };

  playButton.onclick = () => {
    if (playButton.dataset.scheduled !== 'true') {
      const phraseNum = parseInt(patternView.dataset.pattern);
      Tone.Transport.scheduleOnce(function(time){
        //re-enable button slightly ahead of end of phrase
        playButton.dataset.scheduled = false;
      }, `@4n + (${phrases[phraseNum].duration})/2`);
      parts[phraseNum].start('@4n').stop(`@4n + ${phrases[phraseNum].duration}`);
      playButton.dataset.scheduled = true;
    }
  }

})();
