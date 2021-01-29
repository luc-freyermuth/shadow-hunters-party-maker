<script lang="ts">
  import { getPeerHost } from '../peer2peer/peer-host';
  import { downloadJson, readJsonFromFile } from '../utils/json-files';

  let statsFilePicker: HTMLInputElement;
  const peerHost = getPeerHost();

  function saveStats() {
    downloadJson(peerHost.getStats(), 'stats_shadow_hunters_' + new Date().toISOString());
  }

  function loadStats() {
    if (statsFilePicker.files && statsFilePicker.files.length === 1) {
      readJsonFromFile(statsFilePicker.files[0]).then(stats => {
        peerHost.setStats(stats);
      });
    }
  }
</script>

<style>
  .no-display {
    display: none;
  }
</style>

<div class="column is-5 is-inline-block">
  <button class="button is-fullwidth is-primary" on:click={() => statsFilePicker.click()}>
    <span class="icon centered-button-icon">
      <i class="gg-software-upload" />
    </span>
    Charger des statistiques
  </button>
  <input type="file" class="no-display" bind:this={statsFilePicker} on:change={loadStats} />
</div>

<div class="column is-5 is-inline-block">
  <button class="button is-fullwidth is-primary" on:click={saveStats}>
    <span class="icon centered-button-icon">
      <i class="gg-software-download" />
    </span>
    Sauvegarder les statistiques
  </button>
</div>
