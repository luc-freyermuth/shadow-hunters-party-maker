<script lang="typescript">
  let win: boolean = null;
  let funLevel: number = null;
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
    padding: 10px;
    font-size: 3rem;
    color: #444;
    transition: all 0.2s;
  }

  input.star:checked ~ label.star:before {
    content: '★';
    color: #fd4;
    transition: all 0.25s;
  }

  input.star-5:checked ~ label.star:before {
    color: #fe7;
  }

  input.star-1:checked ~ label.star:before {
    color: #f62;
  }

  label.star:hover {
    transform: rotate(-15deg);
  }

  label.star:before {
    content: '★';
    color: black;
  }

  section {
    color: black;
  }

</style>

<div class="modal is-active">
  <div class="modal-background" />
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Retour d'expérience</p>
      <button class="delete" aria-label="close" />
    </header>
    <section class="modal-card-body is-center">
      <div class="buttons has-addons">
        <button class="button flex-1" class:is-success={win === true} on:click={() => (win = true)}>
          Victoire
        </button>
        <button
          class="button flex-1"
          class:is-danger={win === false}
          on:click={() => (win = false)}
        >
          Défaite
        </button>
      </div>
<!-- 
      <h2 class="title is-2">La partie t'a plu ?</h2> -->

      <div class="stars">
          <input class="star star-5" id="star-5" type="radio" name="star" bind:group={funLevel} value={5} />
          <label class="star star-5" for="star-5" />
          <input class="star star-4" id="star-4" type="radio" name="star" bind:group={funLevel} value={4} />
          <label class="star star-4" for="star-4" />
          <input class="star star-3" id="star-3" type="radio" name="star" bind:group={funLevel} value={3} />
          <label class="star star-3" for="star-3" />
          <input class="star star-2" id="star-2" type="radio" name="star" bind:group={funLevel} value={2} />
          <label class="star star-2" for="star-2" /> 
          <input class="star star-1" id="star-1" type="radio" name="star" bind:group={funLevel} value={1} />
          <label class="star star-1" for="star-1" />
      </div>

      <p></p>
    </section>
    <footer class="modal-card-foot">
      <button class="button is-primary is-fullwidth" disabled={win === null || funLevel === null}>
        Valider
      </button>
    </footer>
  </div>
  <button class="modal-close is-large" aria-label="close" />
</div>
