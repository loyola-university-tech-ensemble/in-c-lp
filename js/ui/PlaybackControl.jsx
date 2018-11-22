import { h } from 'hyperapp';

export default () => (state, actions) => (
  <div id='playback-control'>
    <button
      class='previous-phrase'
      aria-label='Previous Phrase'
      onclick={() => actions.previousPhrase()}
    >
      ←
    </button>
    <button
      class='play-phrase'
      aria-label='Play Phrase (Normal Speed)'
      onmousedown={() => actions.playButtonPressed(false)}
      onmouseup={() => actions.playButtonReleased()}
    >
      Play
    </button>
    <span>{state.currentPhrase + 1}</span>
    <button
      class='play-slow-phrase'
      aria-label='Play Phrase (Half Speed)'
      onmousedown={() => actions.playButtonPressed(true)}
      onmouseup={() => actions.playButtonReleased()}
    >
      Play (½)
    </button>
    <button
      class='next-phrase'
      aria-label='Next Phrase'
      onclick={() => actions.nextPhrase()}
    >
      →
    </button>
    <button
      onclick={() => actions.toggleOstinato()}
    >
      Toggle Ostinato
    </button>
  </div>
);
