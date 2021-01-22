<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { fade } from "svelte/transition";

    let win: boolean = null;
    let funLevel: number = null;

    let formIsValid: boolean;
    $: formIsValid = win !== null && funLevel !== null;

    const dispatch = createEventDispatcher();

    function pickedFeedback() {
        dispatch("pickedFeedback", { win, funLevel });
    }

    function close() {
        dispatch("close");
    }
</script>

<style>
    .flex-1 {
        flex: 1;
    }

    div.stars {
        display: inline-block;
    }

    input.star {
        display: none;
    }

    label.star {
        float: right;
        margin: 5px;
        padding: 5px;
        color: #444;
        transition: all 0.2s;
        font-family: "FontAwesome";
        line-height: 1;
    }

    @media screen and (max-width: 768px) {
        label.star {
            font-size: calc((100vw - 200px) / 5);
        }
    }

    @media screen and (min-width: 769px) {
        label.star {
            font-size: 3rem;
        }
    }

    input.star:checked ~ label.star:before {
        content: "\f005";
        transition: all 0.25s;
    }

    input.star-5:checked ~ label.star:before {
        color: #ffee77;
    }

    input.star-4:checked ~ label.star:before {
        color: #ffd054;
    }

    input.star-3:checked ~ label.star:before {
        color: #ffb038;
    }

    input.star-2:checked ~ label.star:before {
        color: #ff8d26;
    }

    input.star-1:checked ~ label.star:before {
        color: #ff6622;
    }

    label.star:hover {
        transform: rotate(-15deg);
    }

    label.star:before {
        content: "\f006";
        color: #444;
    }

    section {
        color: black;
    }
</style>

<div class="modal is-active" transition:fade>
    <div class="modal-background" />
    <div class="modal-card">
        <header class="modal-card-head">
            <p class="modal-card-title">Retour d'expérience</p>
            <button class="delete" aria-label="close" on:click={close} />
        </header>
        <section class="modal-card-body is-center">
            <div class="buttons has-addons">
                <button
                    class="button flex-1"
                    class:is-success={win === true}
                    on:click={() => (win = true)}>
                    Victoire
                </button>
                <button
                    class="button flex-1"
                    class:is-danger={win === false}
                    on:click={() => (win = false)}>
                    Défaite
                </button>
            </div>
            <!-- 
      <h2 class="title is-2">La partie t'a plu ?</h2> -->

            <div class="stars">
                {#each [5, 4, 3, 2, 1] as value}
                    <input
                        class="star star-{value}"
                        id="star-{value}"
                        type="radio"
                        name="star"
                        bind:group={funLevel}
                        {value} />
                    <label class="star star-{value}" for="star-{value}" />
                {/each}
            </div>

            <p />
        </section>
        <footer class="modal-card-foot">
            <button
                class="button is-primary is-fullwidth"
                disabled={!formIsValid}
                on:click={pickedFeedback}>
                Valider
            </button>
        </footer>
    </div>
</div>
