<script lang="ts">
  import type { Character } from 'src/types/character.types';

  export let card: Character;
  let paused: boolean = true;
  let currentTime: number = 0;
  let audio;

  $: src = '/cards/themes/' + card?.theme;
  $: disabled = !card?.theme;

  $: if (card) {
    stopAudio();
  }

  function toggleAudio() {
    if (paused) {
      playAudio();
    } else {
      stopAudio();
    }
  }

  function playAudio() {
    paused = false;
    currentTime = 0;
    if (audio) {
      audio.play();
    }
  }

  function stopAudio() {
    paused = true;
    currentTime = 0;
    if (audio) {
      audio.pause();
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

<button class="button is-primary is-fullwidth mt-4" on:click={toggleAudio} {disabled}>
  Jouer le thème
  <i class:gg-play-button-o={paused} class:gg-play-stop-o={!paused} />
</button>

<audio {src} controls bind:currentTime bind:this={audio}><track kind="captions" /></audio>
