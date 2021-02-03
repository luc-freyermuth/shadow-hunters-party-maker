<script lang="ts">
  import type { Character } from 'src/types/character.types';
  import { createEventDispatcher } from 'svelte';

  export let card: Character;
  export let playThemeOf: Character;

  let paused: boolean = true;
  let currentTime: number = 0;
  let audio;

  const dispatch = createEventDispatcher();

  $: src = '/cards/themes/' + card?.theme;
  $: disabled = !card?.theme;

  $: if (card) {
    stopAudio();
  }

  $: {
    if (playThemeOf) {
      src = '/cards/themes/' + playThemeOf.theme;
      playAudio();
      console.log(audio.readyState);
    }
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
    if (audio && audio.readyState !== 0) {
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

  function onCanPlay() {
    if (!paused) {
      playAudio();
    }
  }

  function dispatchPlay() {
    if (!paused) {
      dispatch('play');
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

<button
  class="button is-primary is-fullwidth mt-4"
  on:click={() => {
    toggleAudio();
    dispatchPlay();
  }}
  disabled={disabled && paused}
>
  Jouer le thème
  <i class:gg-play-button-o={paused} class:gg-play-stop-o={!paused} />
</button>

<audio
  {src}
  controls
  bind:currentTime
  bind:this={audio}
  crossOrigin="anonymous"
  on:canplay={onCanPlay}><track kind="captions" /></audio
>
