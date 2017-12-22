(function() {
  const totalPatterns = 53;

  const patternView = document.querySelector('.pattern-view');
  const forwardButton = document.querySelector('.forward');
  const backwardButton = document.querySelector('.backward');
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
    synth.triggerAttackRelease("C3", "8n", time);
  }, "8n");

  loop.start(0).stop("32m");

  playButton.onclick = () => {
    //Tone.Transport.loop = true;
    Tone.Transport.toggle();
  };

})();
