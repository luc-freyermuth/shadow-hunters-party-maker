<script lang="ts">
  import type { Character } from 'src/types/character.types';

  export let card: Character;
  let paused: boolean = true;
  let currentTime: number = 0;

  $: src = '/cards/themes/' + card?.theme;
  $: disabled = !card?.theme;

  $: {
    if (paused) {
      console.log('reset time');
      currentTime = 0;
    }
  }
</script>

<style>
  audio {
    display: none;
  }

  i {
    margin-left: 0.5rem;
  }
</style>

<button class="button is-primary is-fullwidth mt-4" on:click={() => (paused = !paused)} {disabled}>
  Jouer le thème
  <i class:gg-play-button-o={paused} class:gg-play-stop-o={!paused} />
</button>

<audio {src} controls bind:paused bind:currentTime><track kind="captions" /></audio>
