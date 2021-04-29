<script context="module">
  export const prerender = true;

  export async function load({ page, fetch, session, context }) {
    const url = `/cards/cards.json`;
    const res = await fetch(url);

    if (res.ok) {
      return {
        props: {
          cards: await res.json()
        }
      };
    }

    return {
      status: res.status,
      error: new Error(`Could not load ${url}`)
    };
  }
</script>

<script lang="ts">
  import Card from '../components/Card.svelte';
  import type { Character } from '../types/character.types';

  export let cards: Character[] = [];
  let filteredCards: Character[];
  let search: string = '';

  $: filteredCards = cards.filter(c =>
    c.name.toLowerCase().trim().includes(search.toLowerCase().trim())
  );
</script>

<style>
  .cards {
    margin-top: 20px;
  }
</style>

<div class="container is-fluid">
  <h2 class="title is-2 is-center">Liste des cartes</h2>

  <div class="field">
    <p class="control has-icons-left has-icons-right">
      <input class="input is-primary" type="text" placeholder="Rechercher..." bind:value={search} />
      <span class="icon is-small is-left"> <i class="gg-search" /> </span>
    </p>
  </div>

  <div class="cards">
    <div class="columns">
      {#each filteredCards as card}
        <div class="column is-3-fullhd is-4-desktop is-6-tablet is-12-mobile is-inline-block">
          <Card {card} />
        </div>
      {/each}
    </div>
  </div>
</div>
