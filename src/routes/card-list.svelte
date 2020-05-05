<script>
    import { cardsStore } from '../stores/cards-store.js'
    import Card from '../components/Card.svelte';

    let cards = [];

    cardsStore.subscribe(newCards => {
        cards = [...newCards];
    });

    let filteredCards;
    let search = '';

    $: filteredCards = cards.filter(c => c.name.toLowerCase().trim().includes(search.toLowerCase().trim()));
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
            <span class="icon is-small is-left">
                <i class="gg-search"></i>
            </span>
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
