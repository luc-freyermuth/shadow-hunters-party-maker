<script context="module">
  export async function preload(page, session) {
    const { hostId } = page.params;
    return { hostId };
  }
</script>

<script>
  import { onMount } from 'svelte';

  export let hostId;

  let peer;
  let connectionToHost;
  let connectionStatus;

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
    peer.on('error', error => {
      console.log('peer error', error);
    });
  }

  function connect() {
    connectionStatus = 'connectingToHost';
    connectionToHost = peer.connect(hostId);
    connectionToHost.on('open', () => {
      connectionStatus = 'ok';
    });
    connectionToHost.on('error', error => {
      console.log('connection error', error);
    });
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
</style>

<div class="container is-fluid">
  {#if connectionStatus !== 'ok' && connectionStatus !== 'error'}
    <div class="loader-wrapper">
      <div class="loader is-loading"></div>
      <br />
      <h3 class="title is-3 loading-text">
        {#if connectionStatus === 'connectingToBroking'}
          Connexion au serveur de courtage
        {/if}
        {#if connectionStatus === 'connectingToHost'}Connexion à l'hôte{/if}
      </h3>
    </div>
  {/if}
</div>
