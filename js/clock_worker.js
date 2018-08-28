module.exports = function (self) {
  self.addEventListener('message', function (ev){
    var startNum = parseInt(ev.data);
    setInterval(() => self.postMessage([ startNum ]), 1000);
  });
};
