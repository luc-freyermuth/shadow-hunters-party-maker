<script>
  import { getPeerHost } from "../peer2peer/peer-host.js";
  const peerHost = getPeerHost();
  const peerId = peerHost.peer.id;
  console.log(peerId);
</script>

{peerId}