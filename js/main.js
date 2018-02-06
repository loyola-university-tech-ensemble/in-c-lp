"use strict";
(function() {

  require('feather-icons').replace();
  const Tone = require('tone');
  Tone.context.latencyHint = 'fastest'; // interactive
  const phrases = require('../phrases/phrases.json');
  const TOTAL_PATTERNS = phrases.length;

  // Synthesis ----------------------------------------------------------------
  
  const ostinato = new Tone.Synth({
    oscillator: { type: "pwm", modulationFrequency: 0.2 },
    envelope: { attack: 0.02, decay: 0.5, sustain: 0.0, release: 0.7, }
  }).toMaster();

  const synth = new Tone.Synth({
    oscillator: { type: "pwm", modulationFrequency: 0.2 },
    envelope: { attack: 0.02, decay: 0.5, sustain: 0.25, release: 0.4 }
  }).toMaster();

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

  // UX -----------------------------------------------------------------------

  const settingsButton = document.querySelector('.settings-control');
  const headerContent = document.querySelector('.header-content');
  settingsButton.onclick = function() {
    headerContent.dataset.settingsOpen = !(headerContent.dataset.settingsOpen === "true");
    window.scroll(0,0);
  }

  const svgView = document.querySelector('.svg-view');
  const forwardButton = document.querySelector('.forward');
  const backwardButton = document.querySelector('.backward');

  forwardButton.onclick = function() {
    const pattern = (parseInt(svgView.dataset.pattern, 10) + 1) % TOTAL_PATTERNS;
    svgView.dataset.pattern = pattern;
    svgView.data = `assets/svgs/${pattern+1}.svg`;
  };
  backwardButton.onclick = function() {
    const n = parseInt(svgView.dataset.pattern, 10);
    const pattern = (n-1 >= 0) ? n-1 : TOTAL_PATTERNS-1;
    svgView.dataset.pattern = pattern;
    svgView.data = `assets/svgs/${pattern+1}.svg`;
  };

  const eighthShiftButton = document.querySelector('.eighth-shift');
  eighthShiftButton.onclick = function() {
    this.dataset.shifted = !(this.dataset.shifted === 'true');
  }

  const playContainer = document.querySelector('.play');
  const phraseSVG = document.querySelector('.play > object');
  playContainer.onpointerdown = function() {
    if (this.dataset.scheduled !== 'true') {
      const phraseNum = parseInt(svgView.dataset.pattern);
      const shift = (eighthShiftButton.dataset.shifted === 'true') ? '8n' : '0';
      Tone.Transport.scheduleOnce((time) => {
        //re-enable button slightly ahead of end of phrase
        this.dataset.scheduled = false;
      }, `@4n + (${phrases[phraseNum].duration})/2`);
      parts[phraseNum].start(`@4n + ${shift}`).stop(`@4n + ${phrases[phraseNum].duration} + ${shift}`);
      this.dataset.scheduled = true;
    }
  }
  phraseSVG.onload = function() {
    this.onclick = playContainer.onpointerdown;
  }

  const ostinatoButton = document.querySelector('.ostinato');
  ostinatoButton.onclick = function() {
    const active = this.dataset.active === 'true';
    if (active) {
      Tone.Transport.clear(Number(this.dataset.id));
    } else {
      const id = Tone.Transport.scheduleRepeat((time) => {
        ostinato.triggerAttackRelease("C3", "8n", time, 0.3);
        ostinato.triggerAttackRelease("C3", "8n", `${time} + 8n`, 0.1);
      }, "4n", "@4n");
      this.dataset.id = id;
    }
    this.dataset.active = !active;
  };

  const clockButton = document.querySelector('.clock');
  clockButton.onclick = function() {
    playContainer.dataset.scheduled = false;
    Tone.Transport.cancel(); // wipe transport
    Tone.Transport.toggle();
    this.dataset.state = Tone.Transport.state;
    this.innerHTML = (Tone.Transport.state === 'stopped') ? 'Start' : 'Stop';
  }

  const syncButton = document.querySelector('.sync');
  syncButton.onmousedown = () => {
    Tone.Transport.bpm.rampTo(settingsTempoInput.valueAsNumber * 1.05, 0.1);
  };
  syncButton.onmouseup = () => {
    Tone.Transport.bpm.rampTo(settingsTempoInput.valueAsNumber, 0.1);
  };

  const magicButton = document.querySelector('.magic-button');
  magicButton.onclick = function() {
    if (this.dataset.state === 'off') {
      clockButton.onclick();
      ostinatoButton.onclick();
      this.dataset.state = 'sync';
      this.innerHTML = 'Sync';
      this.onmousedown = syncButton.onmousedown;
      this.onmouseup = syncButton.onmouseup;
    }
  }

  const introPanel = document.querySelector('.intro');
  const leaveIntroButton = document.querySelector('.leave-intro');
  leaveIntroButton.onclick = function() {
    ostinatoButton.onclick();
    introPanel.dataset.showintro = false;
  }

  const octaveContainer = document.querySelector('.input-wrapper.octave');
  const octaveSlider = document.querySelector('.octave-slider');
  octaveSlider.onchange = function() {
    octaveContainer.dataset.octave = this.value;
  }

  const instrumentSelector = document.querySelector('.instrument-selector');
  instrumentSelector.onchange = function() {
    synth.oscillator.type = this.value;
  }

  const settingsTempoInput = document.querySelector('.settings-container .tempo > input');
  const introTempoInput = document.querySelector('.intro-controls .tempo > input');
  settingsTempoInput.onchange = function() {
    const bpm = this.valueAsNumber;
    introTempoInput.value = bpm;
    Tone.Transport.bpm.rampTo(bpm, 0.1);
  }
  introTempoInput.onchange = function() {
    const bpm = this.valueAsNumber;
    settingsTempoInput.value = bpm;
    Tone.Transport.bpm.rampTo(bpm, 0.1);
  }

  function limitFun(v) {
    if (v >= 1) return 1;
    if (v <= 0) return 0;
    return v;
  }
  function handlePointerMove(_this, e) {
    const newX = limitFun(
      parseFloat(_this.dataset.x) + (e.movementX / _this.clientWidth)
    );
    const newY = limitFun(
      parseFloat(_this.dataset.y) + (e.movementY / _this.clientHeight)
    );
    _this.dataset.x = newX;
    _this.dataset.y = newY;

    const styleX = (newX * ((_this.clientWidth - xyPadThumb.offsetWidth) / _this.clientWidth)) * 100;
    const styleY = (newY * ((_this.clientHeight - xyPadThumb.offsetHeight) / _this.clientHeight)) * 100;

    xyPadThumb.style.left = `${styleX}%`;
    xyPadThumb.style.top = `${styleY}%`;

    synth.volume.value = 20 * Math.log(1 - newY);
  }
  const xyPad = document.querySelector('.xy-pad');
  const xyPadThumb = document.querySelector('.xy-pad > .thumb');
  xyPad.onmousedown = function(e) {
    this.dataset.dragging = true;
  }
  document.onmouseup = function(e) {
    xyPad.dataset.dragging = false;
  }
  document.onmousemove = function(e) {
    if (xyPad.dataset.dragging === 'true') {
      handlePointerMove(xyPad, e);
    }
  }
  xyPad.ontouchstart = function (e) {
    const first = e.changedTouches[0];
    if (first.target === xyPadThumb) {
      this.dataset.dragging = true;
    }
    e.preventDefault(); //do not emulate mouse events
  }
  document.ontouchmove = function (e) {
    const first = e.changedTouches[0];
    if (first.target === xyPadThumb) {
      handlePointerMove(xyPad, {
        movementX: (first.screenX - parseInt(xyPad.dataset.prevTouchX)) || 0,
        movementY: (first.screenY - parseInt(xyPad.dataset.prevTouchY)) || 0,
      });
      xyPad.dataset.prevTouchX = first.screenX;
      xyPad.dataset.prevTouchY = first.screenY;
    }
  }
  document.ontouchend = function (e) {
    const first = e.changedTouches[0];
    if (first.target === xyPadThumb) {
      xyPad.dataset.dragging = false;
      xyPad.dataset.prevTouchX = NaN;
      xyPad.dataset.prevTouchY = NaN;
    }
  }

  document.addEventListener('keydown', (event) => {
    switch(event.keyCode) {
      case 37: // left arrow
        backwardButton.click();
        break;
      case 39: // right arrow
        forwardButton.click();
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
        eighthShiftButton.click();
        break;
    }
  });
})();
