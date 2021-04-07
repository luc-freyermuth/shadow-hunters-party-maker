<script lang="typescript">
  import Card from '../components/Card.svelte';
  import TeamsManager from '../components/TeamsManager.svelte';
  import StatsMenu from '../components/StatsMenu.svelte';
  import PlayersList from '../components/PlayersList.svelte';

  import { getPeerHost, PeerHost } from '../peer2peer/peer-host';
  import { onMount } from 'svelte';
  import { cardsStore } from '../stores/cards-store';
  import { default as copy } from 'copy-to-clipboard';
  import type { GameConfig } from '../types/config.types';
  import type { Character } from '../types/character.types';
  import type { Player } from '../types/player.types';
  import { goto } from '$app/navigation';

  const peerHost: PeerHost = getPeerHost();
  let sharableLink: string;
  let players: Player[] = [];
  let cards: Character[] = [];
  let allowedCards: Character[] = [];

  // Game options //
  let gameMode: string = 'single';
  let excludeAllPreviouslyPlayedCards = false;
  let onlyOneWithSameLetter = false;
  let preventSameSingle = false;
  let preventSameLetterSingle = false;
  let propositionsHaveSameLetterDouble = false;
  let preventSamePlayedDouble = false;
  let preventSamePropositionsDouble = false;
  let preventSameLetter = false;

  let shadowCount;
  let hunterCount;

  $: broadcastTheme = peerHost?.broadcastTheme;

  onMount(() => {
    if (!peerHost.peer) {
      goto('/create-lobby');
      return;
    }
    generateLinkFromPeer(peerHost.peer);
    peerHost.players$.subscribe(p => {
      players = p;
    });
    cardsStore.subscribe(storedCards => {
      cards = [...storedCards];
      if (!localStorage.getItem('removedCards')) {
        allowedCards = [...cards];
      } else {
        const removedCardsNames = JSON.parse(localStorage.getItem('removedCards'));
        allowedCards = cards.filter(card => !removedCardsNames.includes(card.name));
      }
    });
  });

  function generateUrlParam(key: string, value: string) {
    if (value) {
      return `${key}=${value}`;
    }
    return '';
  }

  function generateLinkFromPeer(peer) {
    sharableLink =
      window.location.origin +
      '/play/' +
      '?' +
      [
        generateUrlParam('host', peer.options.host),
        generateUrlParam('port', peer.options.port),
        generateUrlParam('path', peer.options.path),
        generateUrlParam('key', peer.options.key),
        generateUrlParam('room', peer.id)
      ].join('&');
  }

  function toggleCard(card: Character) {
    if (allowedCards.findIndex(c => c.name === card.name) > -1) {
      allowedCards.splice(
        allowedCards.findIndex(c => c.name === card.name),
        1
      );
      allowedCards = [...allowedCards];
    } else {
      allowedCards = [...allowedCards, card];
    }
    localStorage.setItem(
      'removedCards',
      JSON.stringify(
        cards.map(c => c.name).filter(cardName => !allowedCards.map(c => c.name).includes(cardName))
      )
    );
  }

  function startGame() {
    let options: GameConfig['options'] = {
      excludeAllPreviouslyPlayedCards,
      onlyOneWithSameLetter,
      mode: gameMode,
      modeOptions: null
    };
    switch (options.mode) {
      case 'single':
        options.modeOptions = {
          preventSame: preventSameSingle,
          preventSameLetter: preventSameLetterSingle
        };
        break;
      case 'double':
        options.modeOptions = {
          propositionsHaveSameLetter: propositionsHaveSameLetterDouble,
          preventSamePlayed: preventSamePlayedDouble,
          preventSamePropositions: preventSamePropositionsDouble
        };
        break;
      case 'letter':
        options.modeOptions = {
          preventSamePropositions: preventSameLetter
        };
        break;
    }
    const gameConfig: GameConfig = {
      options,
      cards: allowedCards,
      teams: {
        shadows: shadowCount,
        hunters: hunterCount
      }
    };
    peerHost.startGame(gameConfig);
  }

  function removePlayer(player: Player) {
    peerHost.removePlayer(player);
  }

  function copyLink() {
    copy(sharableLink, { message: 'test' });
  }

  function changeBroadcast(event) {
    peerHost?.broadcastTheme?.next(event.currentTarget.checked);
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

  .options-form .control {
    text-align: left;
  }

  .options-form .control:not(:first-child) {
    margin-top: 1rem;
  }

  .title-margin-top {
    margin-top: 24px;
  }

  .main-buttons {
    max-width: 1000px;
    margin: auto;
  }

  .cards-list-title {
    margin-top: 2.5rem;
  }

  .cards {
    margin-top: 1.5rem;
  }

  .removed-card {
    opacity: 0.6;
  }
</style>

<div class="container is-fluid">
  <div class="is-center">
    <h3 class="title is-3">Partagez ce lien aux joueurs</h3>
    <h6 class="subtitle is-6 vertical-center">
      <a href={sharableLink} target="_blank">{sharableLink}</a>
      <button class="button is-primary" on:click={copyLink}>
        <span class="icon"> <i class="gg-clipboard" /> </span>
        <span>Copier le lien</span>
      </button>
    </h6>
  </div>

  <div class="columns is-desktop form">
    <div class="column is-6-desktop is-12-mobile is-inline-block is-center">
      <h4 class="title is-4">Équipes</h4>

      <TeamsManager playerCount={players.length} bind:shadowCount bind:hunterCount />

      <h4 class="title is-4 title-margin-top">
        Joueurs ({players.length})
      </h4>

      <PlayersList {players} on:removePlayer={event => removePlayer(event.detail)} />
    </div>

    <!-- OPTIONS FORM -->
    <div class="column is-6-desktop is-12-mobile is-inline-block is-center">
      <h4 class="title is-4">Options</h4>

      <div class="options-form">
        <div class="control">
          <label class="checkbox">
            <input type="checkbox" checked={$broadcastTheme} on:change={changeBroadcast} />
            Diffuser les thèmes des personnages à tous les joueurs
          </label>
        </div>

        <div class="control">
          <label class="checkbox">
            <input type="checkbox" bind:checked={excludeAllPreviouslyPlayedCards} />
            Exclure toutes les cartes jouées lors de la partie précédente
          </label>
        </div>

        <div class="control">
          <label class="checkbox">
            <input type="checkbox" bind:checked={onlyOneWithSameLetter} />
            Un seul personnage de la même lettre par équipe
          </label>
        </div>

        <div class="control">
          <label class="radio bigger">
            <input type="radio" name="answer" bind:group={gameMode} value={'single'} />
            Ne donner qu'une seule carte
          </label>

          <label class="checkbox sub-choice" disabled={gameMode !== 'single'}>
            <input
              type="checkbox"
              disabled={gameMode !== 'single'}
              bind:checked={preventSameSingle}
            />
            Empêcher les joueurs de tomber deux fois de suite sur la même carte
          </label>

          <label class="checkbox sub-choice" disabled={gameMode !== 'single'}>
            <input
              type="checkbox"
              disabled={gameMode !== 'single'}
              bind:checked={preventSameLetterSingle}
            />
            Empêcher les joueurs de tomber deux fois de suite sur une carte de la même lettre
          </label>
        </div>

        <div class="control">
          <label class="radio bigger">
            <input type="radio" name="answer" bind:group={gameMode} value={'double'} />
            Laisser le choix entre deux cartes
          </label>

          <label class="checkbox sub-choice" disabled={gameMode !== 'double'}>
            <input
              type="checkbox"
              disabled={gameMode !== 'double'}
              bind:checked={propositionsHaveSameLetterDouble}
            />
            Proposer deux cartes de la même lettre
          </label>

          <label class="checkbox sub-choice" disabled={gameMode !== 'double'}>
            <input
              type="checkbox"
              disabled={gameMode !== 'double'}
              bind:checked={preventSamePlayedDouble}
            />
            Empêcher la carte précédement jouée d'être reproposée au même joueur
          </label>

          <label class="checkbox sub-choice" disabled={gameMode !== 'double'}>
            <input
              type="checkbox"
              disabled={gameMode !== 'double'}
              bind:checked={preventSamePropositionsDouble}
            />
            Empêcher les deux cartes précédement proposées d'être reproposées au même joueur
          </label>
        </div>

        <div class="control">
          <label class="radio bigger">
            <input type="radio" name="answer" bind:group={gameMode} value={'letter'} />
            Laisser le choix entre toutes les cartes de la même lettre
          </label>

          <label class="checkbox sub-choice" disabled={gameMode !== 'letter'}>
            <input
              type="checkbox"
              disabled={gameMode !== 'letter'}
              bind:checked={preventSameLetter}
            />
            Empêcher les joueurs de tomber deux fois de suite sur la même lettre
          </label>
        </div>
      </div>
    </div>
  </div>
  <div class="is-center">
    <div class="columns main-buttons">
      <div class="column is-full is-inline-block">
        <button
          class="button is-fullwidth is-primary is-large"
          on:click={startGame}
          disabled={players.length === 0}
        >
          Lancer la partie
        </button>
      </div>
      <StatsMenu />
    </div>
  </div>

  <div class="is-center cards-list-title">
    <h4 class="title is-4">Liste des cartes autorisées</h4>
  </div>

  <div class="cards">
    <div class="columns">
      {#each cards as card}
        <div class="column is-2-fullhd is-3-desktop is-4-tablet is-12-mobile is-inline-block">
          <div
            on:click={() => toggleCard(card)}
            class:removed-card={allowedCards.findIndex(c => c.name === card.name) === -1}
          >
            <Card {card} />
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
