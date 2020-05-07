<script>
    import { getPeerHost } from '../peer2peer/peer-host.js';
    import { onMount } from 'svelte';

    let host;
    let port;
    let path;
    let key;

    let peerHost;

    onMount(() => {
        peerHost = getPeerHost();
    });

    function createLobby() {
        const peerConfig = {};
        peerHost.start(peerConfig).then(() => {
            console.log('WOW');
        })
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
            <input class="input is-primary" type="text" placeholder="0.peerjs.com" bind:value={host} />
            <span class="icon is-small is-left">
                <i class="gg-drive"></i>
            </span>
        </p>
    </div>
    <div class="field">
        <label>Port du serveur de courtage</label>
        <p class="control has-icons-left">
            <input class="input is-primary" type="text" placeholder="443" bind:value={port} />
            <span class="icon is-small is-left">
                <i class="gg-dock-right"></i>
            </span>
        </p>
    </div>
    <div class="field">
        <label>Chemin sur le serveur de courtage</label>
        <p class="control has-icons-left">
            <input class="input is-primary" type="text" placeholder="/" bind:value={path} />
            <span class="icon is-small is-left">
                <i class="gg-code-slash"></i>
            </span>
        </p>
    </div>
    <div class="field">
        <label>Mot de passe du serveur de courtage</label>
        <p class="control has-icons-left">
            <input class="input is-primary" type="password" placeholder="•••••••••" bind:value={key} />
            <span class="icon is-small is-left">
                <i class="gg-lock"></i>
            </span>
        </p>
    </div>
    <button class="button is-primary is-fullwidth" on:click={createLobby}>
        Créer le salon
    </button>
</div>