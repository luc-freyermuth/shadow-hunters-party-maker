<script lang="ts">
  // Teams //
  export let playerCount: number = 0;
  export let shadowHuntersCount: number = 0;

  let forceBalancedTeams: boolean = false;
  let neutralCount: number = 0;

  $: maxShadowHunters = Math.floor(playerCount / 2);

  $: shadowHuntersChoices = [...Array(maxShadowHunters + 1).keys()];
  $: neutralChoices = shadowHuntersChoices.map(shChoice => playerCount - shChoice * 2).reverse();

  // prettier-ignore
  $: {
    switch(playerCount) {
      case 0: shadowHuntersCount = 0; neutralCount = 0; break;
      case 1: shadowHuntersCount = 0; neutralCount = 1; break;
      case 2: shadowHuntersCount = 1; neutralCount = 0; break;
      case 3: shadowHuntersCount = 1; neutralCount = 1; break;
      case 4: shadowHuntersCount = 2; neutralCount = 0; break;
      case 5: shadowHuntersCount = 2; neutralCount = 1; break;
      case 6: shadowHuntersCount = 2; neutralCount = 2; break;
      case 7: shadowHuntersCount = 2; neutralCount = 3; break;
      case 8: shadowHuntersCount = 3; neutralCount = 2; break;
      case 9: shadowHuntersCount = 3; neutralCount = 3; break;
    }
  }

  function shadowHuntersCountChanged() {
    neutralCount = playerCount - shadowHuntersCount * 2;
  }

  function neutralCountChanged() {
    shadowHuntersCount = (playerCount - neutralCount) / 2;
  }
</script>

<style>
  .team-select {
    max-width: 300px;
    margin: auto;
  }

  .team-select:not(:first-child) {
    margin-top: 1rem;
  }

  .team-select .control .select {
    width: 100%;
  }

  .team-select .control .select select {
    width: 100%;
  }
</style>

<div class="container is-fluid">
  <div class="field team-select">
    <div class="control">
      <div class="select is-danger">
        <!-- svelte-ignore a11y-no-onchange -->
        <select bind:value={shadowHuntersCount} on:change={shadowHuntersCountChanged}>
          {#each shadowHuntersChoices as choice}
            <option value={choice}>
              {choice === 0 ? 'Aucun' : choice}
              shadow{choice > 1 ? 's' : ''}
            </option>
          {/each}
        </select>
      </div>
    </div>
  </div>

  <div class="field team-select">
    <div class="control">
      <div class="select is-info">
        <!-- svelte-ignore a11y-no-onchange -->
        <select bind:value={shadowHuntersCount} on:change={shadowHuntersCountChanged}>
          {#each shadowHuntersChoices as choice}
            <option value={choice}>
              {choice === 0 ? 'Aucun' : choice}
              hunter{choice > 1 ? 's' : ''}
            </option>
          {/each}
        </select>
      </div>
    </div>
  </div>

  <div class="field team-select">
    <div class="control">
      <div class="select is-warning">
        <!-- svelte-ignore a11y-no-onchange -->
        <select bind:value={neutralCount} on:change={neutralCountChanged}>
          {#each neutralChoices as choice}
            <option value={choice}>
              {choice === 0 ? 'Aucun' : choice}
              neutre{choice > 1 ? 's' : ''}
            </option>
          {/each}
        </select>
      </div>
    </div>
  </div>
</div>
