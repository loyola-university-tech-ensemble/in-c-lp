"use strict";
(function() {

  const feather = require('feather-icons');
  const Tone = require('tone');
  const phrases = require('../assets/phrases.json');
  const TOTAL_PATTERNS = phrases.length;

  feather.replace();

  const dropdowns = document.getElementsByClassName('dropdown-button');
  for (let i = 0; i < dropdowns.length; i+=1) {
    dropdowns[i].onclick = () => {
      dropdowns[i].dataset.open = parseInt(dropdowns[i].dataset.open) ? '0' : '1';
    }
  }

  const svgView = document.querySelector('.svg-view');

  const forwardButton = document.querySelector('.forward');
  const backwardButton = document.querySelector('.backward');
  const ostinatoButton = document.querySelector('.ostinato');
  const playButton = document.querySelector('.play');

  const octaveContainer = document.querySelector('.input-wrapper.octave');
  const octaveSlider = document.querySelector('.octave-slider');

  const tempoLabel = document.querySelector('.tempo-label');
  const tempoSlider = document.querySelector('.tempo-slider');

  const moveForwards = () => {
    const pattern = (parseInt(svgView.dataset.pattern, 10) + 1) % TOTAL_PATTERNS;
    svgView.dataset.pattern = pattern;
    svgView.src = `assets/svgs/${pattern+1}.svg`;
  };

  const moveBackwards = () => {
    const n = parseInt(svgView.dataset.pattern, 10);
    const pattern = (n-1 >= 0) ? n-1 : TOTAL_PATTERNS-1;
    svgView.dataset.pattern = pattern;
    svgView.src = `assets/svgs/${pattern+1}.svg`;
  };

  forwardButton.onclick = moveForwards;
  backwardButton.onclick = moveBackwards;

  document.addEventListener('keydown', (event) => {
    switch(event.keyCode) {
      case 37: // left arrow
        moveBackwards();
        break;
      case 39: // right arrow
        moveForwards();
        break;
      case 188: // less-than
        octaveSlider.value = parseInt(octaveSlider.value, 10) - 1;
        octaveContainer.dataset.octave = octaveSlider.value;
        break;
      case 190: // greater-than
        octaveSlider.value = parseInt(octaveSlider.value, 10) + 1;
        octaveContainer.dataset.octave = octaveSlider.value;
        break;
      case 90: // forward slash
        // TODO: 8th note shift
        break;
    }
  });

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
      "sustain" : 0.25,
      "release" : 0.4,
    }
  }).toMaster();

  Tone.Transport.scheduleRepeat((time) => {
    ostinato.triggerAttackRelease("C3", "8n", time, 0.3);
    ostinato.triggerAttackRelease("C3", "8n", `${time} + 8n`, 0.1);
  }, "4n");

  const parts = phrases.map(p =>
    new Tone.Part((time, note) => {
      const [_, pClass, octave] = note.pitch.match(/(\w\#?)(\d)/);
      synth.triggerAttackRelease(
        `${pClass}${parseInt(octave) + parseInt(octaveSlider.value)}`,
        note.duration,
        time,
        note.velocity
      );
    }, p.notes)
  );

  ostinatoButton.onclick = () => {
    playButton.dataset.scheduled = false;
    Tone.Transport.cancel(); // wipe transport
    Tone.Transport.toggle();
    ostinatoButton.dataset.active = Tone.Transport.state;
  };

  playButton.onclick = () => {
    if (playButton.dataset.scheduled !== 'true') {
      const phraseNum = parseInt(svgView.dataset.pattern);
      Tone.Transport.scheduleOnce(function(time){
        //re-enable button slightly ahead of end of phrase
        playButton.dataset.scheduled = false;
      }, `@4n + (${phrases[phraseNum].duration})/2`);
      parts[phraseNum].start('@4n').stop(`@4n + ${phrases[phraseNum].duration}`);
      playButton.dataset.scheduled = true;
    }
  }

  octaveSlider.onchange = () => {
    octaveContainer.dataset.octave = octaveSlider.value;
  }

  tempoSlider.onchange = (event) => {
    const bpm = parseInt(tempoSlider.value, 10);
    tempoLabel.dataset.tempo = bpm;
    Tone.Transport.bpm.rampTo(bpm, 0.1);
  }

})();
