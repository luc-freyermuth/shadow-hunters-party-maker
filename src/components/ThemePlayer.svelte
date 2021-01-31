<script lang="ts">
  import type { Character } from 'src/types/character.types';

  export let card: Character;
  // $: src = card?.theme;
  $: src = '/cards/themes/' + card?.theme;

  let paused: boolean = true;
</script>

<style>
  audio {
    display: none;
  }

  i {
    margin-left: 0.5rem;
  }
</style>

<button class="button is-primary is-fullwidth mt-4" on:click={() => (paused = !paused)}>
  Jouer le thème
  <i class:gg-play-button-o={paused} class:gg-play-pause-o={!paused} />
</button>

<audio {src} controls bind:paused />
