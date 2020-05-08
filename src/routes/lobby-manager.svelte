<script>
  import { getPeerHost } from "../peer2peer/peer-host.js";
  import { onMount } from "svelte";
  import { goto } from "@sapper/app";

  let peerHost;
  let sharableLink =
    "http://shadow-hunters.darckoune.moe/?game=k6jwaiy6m0b00000";

  onMount(() => {
    peerHost = getPeerHost();
    console.log(peerHost);
    if (!peerHost.peer) {
      goto("/create-lobby");
      return;
    }
    generateLinkFromPeer(peerHost.peer);
  });

  function generateUrlParam(key, value) {
    if (value) {
      return `${key}=${value}`;
    }
    return "";
  }

  function generateLinkFromPeer(peer) {
    sharableLink =
      window.location.origin +
      "/play/" +
      peer.id +
      "?" +
      [
        generateUrlParam("host", peer.options.host),
        generateUrlParam("port", peer.options.port),
        generateUrlParam("path", peer.options.path),
        generateUrlParam("key", peer.options.key)
      ].join("&");
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
</style>

<div class="container is-fluid">
  <div class="is-center">
    <h3 class="title is-3">Partagez ce lien aux joueurs</h3>
    <h5 class="subtitle is-5 vertical-center">
      <a href="{sharableLink}" target="_blank">{sharableLink}</a>
      <button class="button is-primary">
        <span class="icon">
          <i class="gg-clipboard"></i>
        </span>
        <span>Copier le lien</span>
      </button>
    </h5>
  </div>
  <div class="columns is-desktop form">
    <div class="column is-6-desktop is-12-mobile is-inline-block is-center">
      <h4 class="title is-4">Joueurs</h4>
    </div>
    <div class="column is-6-desktop is-12-mobile is-inline-block is-center">
      <h4 class="title is-4">Options</h4>
    </div>
  </div>
</div>
