<script context="module">
  export async function preload(page, session) {
    const { hostId } = page.params;
    return { hostId };
  }
</script>

<script>
  import Card from '../../components/Card.svelte';
  import FeedbackModal from '../../components/FeedbackModal.svelte';
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';

  export let hostId;

  let peer;
  let connectionToHost;
  let connectionStatus;
  let name;
  let error;
  let gameState = 'pickName';
  let currentCard;
  let choices = [];
  let players = [];

  let isSendingFeedback = false;

  onMount(() => {
    createPeer();
  });

  function createPeer() {
    const urlParams = new URLSearchParams(window.location.search);
    connectionStatus = 'connectingToBroking';
    peer = new Peer({
      host: urlParams.get('host'),
      port: urlParams.get('port'),
      path: urlParams.get('path'),
      key: urlParams.get('key')
    });
    peer.on('open', () => {
      connect();
    });
    peer.on('error', err => {
      connectionStatus = 'error';
      error = err;
      if (err.toString().startsWith('Error: Lost connection')) {
        createPeer();
      }
    });
  }

  function connect() {
    connectionStatus = 'connectingToHost';
    connectionToHost = peer.connect(hostId);
    connectionToHost.on('open', () => {
      connectionStatus = 'ok';
      if (name) {
        pickName();
      }
    });
    connectionToHost.on('error', error => {
      console.log('connection error', error);
    });
    connectionToHost.on('data', data => {
      console.log('got message from server', data);
      handleMessage(data.type, data.data);
    });

    const connectionPeerId = peer.id;
    connectionToHost.on('close', () => {
      connectionToHost = null;
      if (connectionPeerId === peer.id) {
        createPeer();
      }
    });
  }

  function handleMessage(type, data) {
    switch (type) {
      case 'goTo':
        gameState = data.room;
        if (data.room === 'currentCard') {
          currentCard = data.roomData;
        } else if (data.room === 'choice') {
          choices = data.roomData;
        }
        break;
      case 'playersList':
        players = data;
        break;
      default:
        console.error('Unable to handle message of type: ' + type);
        break;
    }
  }

  function pickName() {
    connectionToHost.send({
      action: 'pickName',
      data: name
    });
  }

  function chooseCard(card) {
    connectionToHost.send({
      action: 'chooseCard',
      data: card.name
    });
  }

  function sendFeedback(event) {
    connectionToHost.send({
      action: 'feedback',
      data: event.detail
    });
    isSendingFeedback = false;
  }

  function requestFeedbackModal() {
    isSendingFeedback = true;
  }
</script>

<style>
  .container {
    height: 100%;
  }

  .loading-text {
    padding: 1.5rem;
    text-align: center;
  }

  .width-limited {
    max-width: 1200px;
    margin: auto;
  }

  .width-more-limited {
    max-width: 800px;
    margin: auto;
  }

  .list {
    max-width: 550px;
    width: 100%;
    margin: 0 auto;
  }

  .float-right {
    float: right;
  }

  .card-container {
    max-width: 450px;
    margin: auto;
    width: 100%;
  }

  .card-item {
    display: inline-block;
    max-width: 450px;
    width: 100%;
  }

  @media screen and (max-width: 768px) {
    .card-item {
      margin: 0.5rem 0;
    }
  }

  @media screen and (min-width: 769px) {
    .card-item {
      margin: 0 0.5rem;
    }
  }

  .pick-card-title {
    margin-top: 1em;
  }
</style>

<div class="container is-fluid">
  {#if connectionStatus !== 'ok' && connectionStatus !== 'error'}
    <div class="loader-wrapper">
      <div class="loader is-loading" />
      <br />
      <h3 class="title is-3 loading-text">
        {#if connectionStatus === 'connectingToBroking'}Connexion au serveur de courtage{/if}
        {#if connectionStatus === 'connectingToHost'}Connexion à l'hôte{/if}
      </h3>
    </div>
  {/if}

  {#if connectionStatus === 'error'}
    <div class="is-vertical-center width-limited">
      <div class="message is-danger">
        <div class="message-header">
          <p>Erreur de connexion</p>
          <button class="delete" aria-label="delete" />
        </div>
        <div class="message-body">
          Une erreur s'est produite lors de la connexion au serveur.
          <br />
          Message du serveur : {error}
        </div>
      </div>
    </div>
  {/if}

  {#if connectionStatus === 'ok'}
    {#if gameState === 'pickName'}
      <div class="is-vertical-center width-more-limited">
        <h3 class="title is-3 is-center">Qui êtes-vous ?</h3>
        <div class="field">
          <p class="control">
            <input class="input is-large is-center is-strong" type="text" bind:value={name} />
          </p>
        </div>
        <button class="button is-primary is-large" on:click={pickName}>Rejoindre</button>
      </div>
    {/if}

    {#if gameState === 'lobby'}
      <div class="is-vertical-center">
        <h4 class="title is-4 is-center">En attente...</h4>
        <div class="list">
          {#each players as player}
            <div class="list-item">
              <div class="flex">
                <div class="flex-1">
                  {player.name}
                  {#if player.isConnected}
                    <span class="has-text-success italic float-right">Connecté</span>
                  {:else}
                    <span class="has-text-danger italic float-right">Déconnecté</span>
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    {#if gameState === 'currentCard'}
      <div class="is-vertical-center">
        <div class="card-container" in:fade out:fade>
          <Card card={currentCard} />
          <button class="button is-primary is-fullwidth mt-4" on:click={requestFeedbackModal}>Terminer la partie</button>
        </div>
      </div>
    {/if}

    {#if gameState === 'choice'}
      <div class="is-vertical-center">
        <h4 class="title is-4 is-center pick-card-title">Choisissez une carte</h4>
        <div class="is-center">
          {#each choices as cardChoice}
            <div class="card-item" on:click={() => chooseCard(cardChoice)}>
              <Card card={cardChoice} />
            </div>
          {/each}
        </div>
      </div>
    {/if}
  {/if}
</div>

{#if isSendingFeedback}
  <FeedbackModal on:pickedFeedback={sendFeedback} on:close={() => isSendingFeedback = false} />
{/if}