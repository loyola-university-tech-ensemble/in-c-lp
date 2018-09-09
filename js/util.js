const _tokens = {
  n: function(timeString, bpm) { //beat (4n)
    return timeString.replace(/\b(2|4|8|16|32)n(\.?)/g, (_, beat, dot) => {
      const beatNum = Number.parseInt(beat);
      if (dot !== '.') return (240 / beatNum) / bpm;
      return ((240 / beatNum) + (240 / (beatNum / 2))) / bpm;
    });
  },
  t: function(timeString, bpm) { //triplet (8t)
    return timeString.replace(/\b(2|4|8|16|32)t(\.?)/g, (_, beat, dot) => {
      const beatNum = Number.parseInt(beat);
      if (dot !== '.') return (160 / beatNum) / bpm;
      return ((160 / beatNum) + (160 / (beatNum / 2))) / bpm;
    });
  },
  m: function(timeString, bpm) { //measure (1m)
    return timeString.replace(/\b(\d+)m\b/g, (_, measures) =>
      (240 * Number.parseInt(measures)) / bpm
    );
  },
}

export default {
  /**
   * Convert time strings (as found in phrases.json) into an absolute time in
   * seconds using the argument beats per minute. Similar syntax to the string
   * times in Tone.js but very naive implementation. Raw numbers are passed through
   * as absolute times to handle things like grace notes. Examples:
   *
   * `0`
   * `4n`
   * `1m + 2n.`
   * `(3 * 16t) + 2n`
   * `1.25`
   */
  parseTimeString(timeString, bpm) {
    if (timeString === '0') return 0;
    if (Number.isFinite(timeString)) return timeString;
    let expr = _tokens['n'](timeString, bpm);
    expr = _tokens['t'](expr, bpm);
    expr = _tokens['m'](expr, bpm);
    if (expr === timeString) {
      console.error(`parseTimeString: Found no time string in argument '${timeString}'`);
      return 0;
    }
    return Function(`"use strict";return (${expr});`)(); //safe eval()
  },
  /**
   * Convert MIDI pitch numbers to frequencies in 12-TET with 440Hz reference.
   */
  midiToFrequency(midiNumber, offset = 0) {
    return 27.5 * Math.pow(2, ((midiNumber + offset) - 21) / 12);
  },
};
