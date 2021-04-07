<script lang="ts">
  import type { Character } from 'src/types/character.types';
  import { createEventDispatcher, onDestroy } from 'svelte';

  export let card: Character;
  export let autoPlay: boolean;

  let paused: boolean = true;
  let currentTime: number = 0;
  let audio: HTMLAudioElement;

  const dispatch = createEventDispatcher();

  $: src = '/cards/themes/' + card?.theme;
  $: disabled = !card?.theme;

  $: if (card) {
    stopAudio();
    if (autoPlay) {
      playAudio();
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

  function dispatchStatus() {
    if (!paused) {
      dispatch('play');
    } else {
      dispatch('pause');
    }
  }

  onDestroy(() => {
    if (audio) {
      audio.pause();
    }
  });
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
  class="button is-fullwidth mt-4"
  on:click={() => {
    toggleAudio();
    dispatchStatus();
  }}
  disabled={disabled && paused}
  class:is-primary={paused}
  class:is-warning={!paused}
>
  {#if paused}
    Jouer mon thème
  {:else}
    Thème en cours : {card.name}
  {/if}
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
