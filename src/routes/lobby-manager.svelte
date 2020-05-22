<script>
  import { getPeerHost } from '../peer2peer/peer-host.js';
  import { onMount } from 'svelte';
  import { goto } from '@sapper/app';

  let peerHost;
  let sharableLink;
  let players = [];

  // Game options //
  let gameMode = 'single';
  let excludeAllPreviouslyPlayedCards = false;
  let onlyOneWithSameLetter = false;
  let preventSameSingle = false;
  let preventSameLetterSingle = false;
  let propositionsHaveSameLetterDouble = false;
  let preventSamePlayedDouble = false;
  let preventSamePropositionsDouble = false;
  let preventSameLetter = false;

  // Teams //
  let shadowHuntersCount = 0;
  let neutralCount = 0;

  let maxShadowHunters = 0;
  $: maxShadowHunters = Math.floor(players.length / 2);

  let shadowHuntersChoices = [0];
  let neutralChoices = [0];
  $: shadowHuntersChoices = [...Array(maxShadowHunters + 1).keys()];
  $: neutralChoices = shadowHuntersChoices.map(shChoice => players.length - shChoice * 2).reverse();

  onMount(() => {
    peerHost = getPeerHost();
    if (!peerHost.peer) {
      goto('/create-lobby');
      return;
    }
    generateLinkFromPeer(peerHost.peer);
    peerHost.players$.subscribe(p => {
      players = p;
      autoAssignTeams();
      console.log(p);
    });
  });

  function generateUrlParam(key, value) {
    if (value) {
      return `${key}=${value}`;
    }
    return '';
  }

  function generateLinkFromPeer(peer) {
    sharableLink =
      window.location.origin +
      '/play/' +
      peer.id +
      '?' +
      [
        generateUrlParam('host', peer.options.host),
        generateUrlParam('port', peer.options.port),
        generateUrlParam('path', peer.options.path),
        generateUrlParam('key', peer.options.key)
      ].join('&');
  }

  function autoAssignTeams() {
    switch(players.length) {
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
    neutralCount = players.length - shadowHuntersCount * 2;
  }

  function neutralCountChanged() {
    shadowHuntersCount = (players.length - neutralCount) / 2;
  }
</script>

<style>
  a {
    color: #9b9ccc;
  }

  a:hover {
    color: #c1c2e2;
  }

  .vertical-center {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .vertical-center button {
    margin-left: 10px;
  }

  .form {
    margin-top: 1.5rem;
  }

  .options-form {
    display: inline-block;
  }

  .bigger {
    font-size: 1.25rem;
    font-weight: 550;
  }

  label.checkbox {
    display: block;
  }

  .sub-choice {
    padding-left: 1.5rem;
    margin-top: 0.2rem;
  }

  .options-form .control:not(:first-child) {
    margin-top: 1rem;
  }

  .flex {
    display: flex;
  }

  .flex-1 {
    flex: 1;
  }

  .italic {
    font-style: italic;
  }

  .title-margin-top {
    margin-top: 24px;
  }

  .list {
    max-width: 550px;
    margin: auto;
  }

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
  <div class="is-center">
    <h3 class="title is-3">Partagez ce lien aux joueurs</h3>
    <h6 class="subtitle is-6 vertical-center">
      <a href="{sharableLink}" target="_blank">{sharableLink}</a>
      <button class="button is-primary">
        <span class="icon">
          <i class="gg-clipboard"></i>
        </span>
        <span>Copier le lien</span>
      </button>
    </h6>
  </div>

  <div class="columns is-desktop form">

    <!-- PLAYERS FORM -->
    <div class="column is-6-desktop is-12-mobile is-inline-block is-center">
      <h4 class="title is-4">Équipes</h4>
      <div class="container is-fluid">
        <div class="field team-select">
          <div class="control">
            <div class="select is-danger">
              <select bind:value={shadowHuntersCount} on:change={shadowHuntersCountChanged}>
                {#each shadowHuntersChoices as choice}
                  <option value={choice}>{ choice === 0 ? 'Aucun' : choice } shadow{ choice > 1 ? 's' : '' }</option>
                {/each}
              </select>
            </div>
          </div>
        </div>

        <div class="field team-select">
          <div class="control">
            <div class="select is-info">
              <select bind:value={shadowHuntersCount} on:change={shadowHuntersCountChanged}>
                {#each shadowHuntersChoices as choice}
                  <option value={choice}>{ choice === 0 ? 'Aucun' : choice } hunter{ choice > 1 ? 's' : '' }</option>
                {/each}
              </select>
            </div>
          </div>
        </div>

        <div class="field team-select">
          <div class="control">
            <div class="select is-warning">
              <select bind:value={neutralCount} on:change={neutralCountChanged}>
                {#each neutralChoices as choice}
                  <option value={choice}>{ choice === 0 ? 'Aucun' : choice } neutre{ choice > 1 ? 's' : '' }</option>
                {/each}
              </select>
            </div>
          </div>
        </div>
      </div>
      <h4 class="title is-4 title-margin-top">Joueurs ({players.length})</h4>
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
                  <button class="button is-small is-danger">
                    <span class="icon is-small">
                      <i class="gg-trash"></i>
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
    </div>

    <!-- OPTIONS FORM -->
    <div class="column is-6-desktop is-12-mobile is-inline-block is-center">
      <h4 class="title is-4">Options</h4>

      <div class="options-form">

        <div class="control">

          <label class="checkbox">
            <input
              type="checkbox"
              bind:checked="{excludeAllPreviouslyPlayedCards}"
            />
            Exclure toutes les cartes jouées lors de la partie précédente
          </label>
        </div>

        <div class="control">
          <label class="checkbox">
            <input type="checkbox" bind:checked="{onlyOneWithSameLetter}" />
            Un seul personnage de la même lettre par équipe
          </label>
        </div>

        <div class="control">
          <label class="radio bigger">
            <input
              type="radio"
              name="answer"
              bind:group="{gameMode}"
              value="{'single'}"
            />
            Ne donner qu'une seule carte
          </label>

          <label class="checkbox sub-choice" disabled="{gameMode !== 'single'}">
            <input
              type="checkbox"
              disabled="{gameMode !== 'single'}"
              bind:checked="{preventSameSingle}"
            />
            Empêcher les joueurs de tomber deux fois de suite sur la même carte
          </label>

          <label class="checkbox sub-choice" disabled="{gameMode !== 'single'}">
            <input
              type="checkbox"
              disabled="{gameMode !== 'single'}"
              bind:checked="{preventSameLetterSingle}"
            />
            Empêcher les joueurs de tomber deux fois de suite sur une carte de
            la même lettre
          </label>
        </div>

        <div class="control">
          <label class="radio bigger">
            <input
              type="radio"
              name="answer"
              bind:group="{gameMode}"
              value="{'double'}"
            />
            Laisser le choix entre deux cartes
          </label>

          <label class="checkbox sub-choice" disabled="{gameMode !== 'double'}">
            <input
              type="checkbox"
              disabled="{gameMode !== 'double'}"
              bind:checked="{propositionsHaveSameLetterDouble}"
            />
            Proposer deux cartes de la même lettre
          </label>

          <label class="checkbox sub-choice" disabled="{gameMode !== 'double'}">
            <input
              type="checkbox"
              disabled="{gameMode !== 'double'}"
              bind:checked="{preventSamePlayedDouble}"
            />
            Empêcher la carte précédement jouée d'être reproposée au même joueur
          </label>

          <label class="checkbox sub-choice" disabled="{gameMode !== 'double'}">
            <input
              type="checkbox"
              disabled="{gameMode !== 'double'}"
              bind:checked="{preventSamePropositionsDouble}"
            />
            Empêcher les deux cartes précédement proposées d'être reproposées au
            même joueur
          </label>
        </div>

        <div class="control">
          <label class="radio bigger">
            <input
              type="radio"
              name="answer"
              bind:group="{gameMode}"
              value="{'letter'}"
            />
            Laisser le choix entre toutes les cartes de la même lettre
          </label>

          <label class="checkbox sub-choice" disabled="{gameMode !== 'letter'}">
            <input
              type="checkbox"
              disabled="{gameMode !== 'letter'}"
              bind:checked="{preventSameLetter}"
            />
            Empêcher les joueurs de tomber deux fois de suite sur la même lettre
          </label>
        </div>
      </div>
    </div>
  </div>
</div>
