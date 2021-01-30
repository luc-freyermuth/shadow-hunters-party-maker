<script lang="ts">
  // Teams //
  export let playerCount: number = 0;

  export let shadowCount: number = 0;
  export let hunterCount: number = 0;

  let forceBalancedTeams: boolean = true;
  let neutralCount: number = 0;

  $: maxShadowHunters = Math.floor(playerCount / 2);

  let shadowHuntersChoices: number[];
  $: {
    if (forceBalancedTeams) {
      shadowHuntersChoices = [...Array(maxShadowHunters + 1).keys()];
    } else {
      shadowHuntersChoices = [...Array(playerCount + 1).keys()];
    }
  }

  let neutralChoices: number[];
  $: {
    if (forceBalancedTeams) {
      neutralChoices = shadowHuntersChoices.map(shChoice => playerCount - shChoice * 2).reverse();
    } else {
      neutralChoices = [...Array(playerCount + 1).keys()];
    }
  }

  // prettier-ignore
  $: {
    if (forceBalancedTeams) {
      switch(playerCount) {
        case 0: shadowCount = hunterCount = 0; neutralCount = 0; break;
        case 1: shadowCount = hunterCount = 0; neutralCount = 1; break;
        case 2: shadowCount = hunterCount = 1; neutralCount = 0; break;
        case 3: shadowCount = hunterCount = 1; neutralCount = 1; break;
        case 4: shadowCount = hunterCount = 2; neutralCount = 0; break;
        case 5: shadowCount = hunterCount = 2; neutralCount = 1; break;
        case 6: shadowCount = hunterCount = 2; neutralCount = 2; break;
        case 7: shadowCount = hunterCount = 2; neutralCount = 3; break;
        case 8: shadowCount = hunterCount = 3; neutralCount = 2; break;
        case 9: shadowCount = hunterCount = 3; neutralCount = 3; break;
      }
    }
  }

  function shadowCountChanged() {
    if (forceBalancedTeams) {
      hunterCount = shadowCount;
      autoBalanceNeutralCount();
    }
  }

  function hunterCountChanged() {
    if (forceBalancedTeams) {
      shadowCount = hunterCount;
      autoBalanceNeutralCount();
    }
  }

  function autoBalanceNeutralCount() {
    neutralCount = playerCount - shadowCount - hunterCount;
  }

  function neutralCountChanged() {
    if (forceBalancedTeams) {
      shadowCount = hunterCount = (playerCount - neutralCount) / 2;
    }
  }

  $: missingPlayers = playerCount - (neutralCount + shadowCount + hunterCount);
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

  .message {
    max-width: 450px;
    margin: auto;
    margin-top: 1rem;
  }
</style>

<div class="container is-fluid">
  <label class="checkbox">
    <input type="checkbox" bind:checked={forceBalancedTeams} />
    Équilibrer automatiquement
  </label>

  <div class="field team-select">
    <div class="control">
      <div class="select is-danger">
        <!-- svelte-ignore a11y-no-onchange -->
        <select bind:value={shadowCount} on:change={shadowCountChanged}>
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
        <select bind:value={hunterCount} on:change={hunterCountChanged}>
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

  {#if missingPlayers !== 0}
    <div class="message is-danger">
      <div class="message-body">
        <p>Les équipes ne sont pas correctement réparties !</p>
        {#if missingPlayers > 0}
          <p>({missingPlayers} joueur(s) manquant(s))</p>
        {:else}
          <p>({-missingPlayers} joueur(s) en trop)</p>
        {/if}
      </div>
    </div>
  {/if}
</div>
