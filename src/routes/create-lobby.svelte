<script lang="ts">
  import { getPeerHost } from '../peer2peer/peer-host';
  import { onMount } from 'svelte';
  import type { PeerConfig } from '../types/config.types';
  import { goto } from '$app/navigation';

  const peerHost = getPeerHost();

  let host: string;
  let port: string;
  let path: string;
  let key: string;
  let isCreating: boolean;
  let error: boolean;

  onMount(() => {
    const localStoredPeerConfig = localStorage.getItem('PEER_CONFIG')
      ? JSON.parse(localStorage.getItem('PEER_CONFIG'))
      : null;
    if (localStoredPeerConfig) {
      ({ host, port, path, key } = localStoredPeerConfig);
    }
  });

  function createLobby() {
    const peerConfig: PeerConfig = {};
    if (host) peerConfig.host = host;
    if (port) peerConfig.port = port;
    if (path) peerConfig.path = path;
    if (key) peerConfig.key = key;
    isCreating = true;
    peerHost
      .start(peerConfig)
      .then(() => {
        localStorage.setItem('PEER_CONFIG', JSON.stringify(peerConfig));
        goto('/lobby-manager');
      })
      .catch(err => {
        isCreating = false;
        error = err;
        console.error('connection error:: ', err);
      });
  }
</script>

<style>
  .limited-width {
    max-width: 800px !important;
  }
</style>

<div class="container is-fluid is-vertical-center limited-width">
  <h2 class="title is-2 is-center">Configuration du salon</h2>

  <div class="field">
    <label for="host">Adresse du serveur de courtage</label>
    <p class="control has-icons-left">
      <input
        class="input is-primary"
        type="text"
        placeholder="0.peerjs.com"
        bind:value={host}
        id="host"
      />
      <span class="icon is-small is-left">
        <i class="gg-drive" />
      </span>
    </p>
  </div>
  <div class="field">
    <label for="port">Port du serveur de courtage</label>
    <p class="control has-icons-left">
      <input class="input is-primary" type="text" placeholder="443" bind:value={port} id="port" />
      <span class="icon is-small is-left">
        <i class="gg-dock-right" />
      </span>
    </p>
  </div>
  <div class="field">
    <label for="path">Chemin sur le serveur de courtage</label>
    <p class="control has-icons-left">
      <input class="input is-primary" type="text" placeholder="/" bind:value={path} id="path" />
      <span class="icon is-small is-left">
        <i class="gg-code-slash" />
      </span>
    </p>
  </div>
  <div class="field">
    <label for="password">Mot de passe du serveur de courtage</label>
    <p class="control has-icons-left">
      <input
        class="input is-primary"
        type="password"
        placeholder="•••••••••"
        bind:value={key}
        id="password"
      />
      <span class="icon is-small is-left">
        <i class="gg-lock" />
      </span>
    </p>
  </div>
  <button
    class="button is-primary is-fullwidth is-small-margin-bottom"
    on:click={createLobby}
    class:is-loading={isCreating}
    disabled={isCreating}
  >
    Créer le salon
  </button>

  {#if error}
    <div class="message is-danger">
      <div class="message-header">
        <p>Erreur</p>
        <button
          class="delete"
          aria-label="delete"
          on:click={() => {
            error = null;
          }}
        />
      </div>
      <div class="message-body">
        Une erreur s'est produite lors de la connexion au serveur.
        <br />
        Message du serveur : {error}
      </div>
    </div>
  {/if}
</div>
