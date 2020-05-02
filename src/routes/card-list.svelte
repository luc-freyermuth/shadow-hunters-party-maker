<script>
    import { cardsStore } from '../stores/cards-store.js'
    import Card from '../components/Card.svelte';

    let cards = [];

    cardsStore.subscribe(newCards => {
        cards = [...newCards];
    });
</script>

<h1 class="title is-1 is-center">Liste des cartes</h1>

<div class="columns">
    {#each cards as card}
        <div class="column is-3-fullhd is-4-desktop is-6-tablet is-12-mobile is-inline-block">
            <Card {card} />
        </div>
    {/each}
</div>