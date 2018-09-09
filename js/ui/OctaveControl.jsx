import { h } from 'hyperapp';
import { actions } from '../model.js';

export default () => (state, actions) => (
  <div
    id='octave-control'
    class={`value_${state.octave}`}
    role='spinbutton'
    aria-label='Octave'
    aria-valuenow={state.octave}
    aria-valuemin='-3'
    aria-valuemax='3'
  >
    <button
      class='decrement'
      aria-label='Octave Decrement'
      onclick={() => actions.octaveDown()}>
      -
    </button>
    <button
      class='increment'
      aria-label='Octave Increment'
      onclick={() => actions.octaveUp()}>
      +
    </button>
  </div>
);
