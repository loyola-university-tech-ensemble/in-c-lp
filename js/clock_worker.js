/*
 * 150ms is a reasonable clock interval because the shortest possible phrase is
 * an eighth note in length. Even at 180bpm that duration in seconds is:
 *
 *  (240 / 8) / 180 = ~166ms
 *
 * We are using this clock to determine when to schedule phrases notes, not to
 * determine the overall tempo, so 150ms is a safe value when factoring in user
 * reaction time, minimum phrase duration, and worst-case device profiles.
 */
module.exports = function (self) {
  self.addEventListener('message', function (ev) {
    const interval = parseInt(ev.data);
    setInterval(() => self.postMessage('tick'), interval);
  });
};
