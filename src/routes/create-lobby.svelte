<script lang="typescript">
  import { getPeerHost } from "../peer2peer/peer-host";
  import { goto } from "@sapper/app";
  import { onMount } from 'svelte';

  const peerHost = getPeerHost();
  
  let host;
  let port;
  let path;
  let key;


  onMount(() => {
    const localStoredPeerConfig = localStorage.getItem('PEER_CONFIG') ? JSON.parse(localStorage.getItem('PEER_CONFIG')) : null;
    if (localStoredPeerConfig) {
      ({ host, port, path, key } = localStoredPeerConfig);
    }
  });

  let isCreating;
  let error;

  function createLobby() {
    const peerConfig: any = {};
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
        console.error("connection error:: ", err);
      });
  }
</script>

<style>
  .limited-width {
    max-width: 800px;
  }
</style>

<div class="container is-fluid is-vertical-center limited-width">
  <h2 class="title is-2 is-center">Configuration du salon</h2>

  <div class="field">
    <label>Adresse du serveur de courtage</label>
    <p class="control has-icons-left">
      <input
        class="input is-primary"
        type="text"
        placeholder="0.peerjs.com"
        bind:value="{host}"
      />
      <span class="icon is-small is-left">
        <i class="gg-drive"></i>
      </span>
    </p>
  </div>
  <div class="field">
    <label>Port du serveur de courtage</label>
    <p class="control has-icons-left">
      <input
        class="input is-primary"
        type="text"
        placeholder="443"
        bind:value="{port}"
      />
      <span class="icon is-small is-left">
        <i class="gg-dock-right"></i>
      </span>
    </p>
  </div>
  <div class="field">
    <label>Chemin sur le serveur de courtage</label>
    <p class="control has-icons-left">
      <input
        class="input is-primary"
        type="text"
        placeholder="/"
        bind:value="{path}"
      />
      <span class="icon is-small is-left">
        <i class="gg-code-slash"></i>
      </span>
    </p>
  </div>
  <div class="field">
    <label>Mot de passe du serveur de courtage</label>
    <p class="control has-icons-left">
      <input
        class="input is-primary"
        type="password"
        placeholder="•••••••••"
        bind:value="{key}"
      />
      <span class="icon is-small is-left">
        <i class="gg-lock"></i>
      </span>
    </p>
  </div>
  <button
    class="button is-primary is-fullwidth is-small-margin-bottom"
    on:click="{createLobby}"
    class:is-loading="{isCreating}"
    disabled="{isCreating}"
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
          on:click="{() => {
            error = null;
          }}"
        ></button>
      </div>
      <div class="message-body">
        Une erreur s'est produite lors de la connexion au serveur. <br/>
        Message du serveur : {error}
      </div>
    </div>
  {/if}
</div>
