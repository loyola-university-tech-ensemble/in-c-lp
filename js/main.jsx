import { h, app } from 'hyperapp';
import work from 'webworkify';

import clockWorker from './clock_worker.js';
import { state, actions } from './model.js';
import OctaveControl from './ui/OctaveControl.jsx';
import PlaybackControl from './ui/PlaybackControl.jsx';

const view = (state, actions) => (
  <div id="app">
    <h1>LUTE: inC</h1>
    <PlaybackControl />
    <OctaveControl />
  </div>
);

const main = app(state, actions, view, document.body);

const timer = work(clockWorker, state);

timer.addEventListener('message', main._ostinatoCallback);
timer.addEventListener('message', main._schedulerCallback);
timer.postMessage(150);
