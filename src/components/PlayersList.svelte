<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import type { Player } from '../types/player.types';

  export let players: Player[];

  const dispatch = createEventDispatcher();
</script>

<style>
  .flex {
    display: flex;
  }

  .flex-1 {
    flex: 1;
  }

  .italic {
    font-style: italic;
  }

  .list {
    max-width: 550px;
    margin: auto;
  }
</style>

<div class="container is-fluid">
  {#if players.length}
    <div class="list">
      {#each players as player}
        <div class="list-item">
          <div class="flex">
            <div class="flex-1">
              {player.name}
              {#if player.peerId}
                <span class="has-text-success italic">Connecté</span>
              {:else}
                <span class="has-text-danger italic">Déconnecté</span>
              {/if}
            </div>
            <button
              class="button is-small is-danger"
              on:click={() => {
                dispatch('removePlayer', player);
              }}
            >
              <span class="icon is-small">
                <i class="gg-trash" />
              </span>
            </button>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <p class="is-center italic">Aucun joueur n'est connecté</p>
  {/if}
</div>
