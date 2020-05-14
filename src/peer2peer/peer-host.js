import { Subject } from 'rxjs';

class PeerHost {
  constructor() {
    this.peer = null;
    this.connections = [];
    this.players = [];
    this.players$ = new Subject();
  }

  start(peerConfig) {
    return new Promise((resolve, reject) => {
      this.peer = new Peer(peerConfig);
      this.peer.on('open', id => {
        resolve(id);
      });
      this.peer.on('connection', connection => {
        this.handleNewConnection(connection);
      });
      this.peer.on('disconnected', () => {
        console.log('Peer server disconnected');
        this.peer.reconnect();
      });
      this.peer.on('error', error => {
        reject(error);
      });
    })
  }

  handleNewConnection(connection) {
    this.connections.push(connection);
    connection.on('data', data => {
      console.log('got message from client', data);
      if (data.request) {
        this.handleRequest(connection, data.request, data.data);
      }
      if (data.action) {
        this.handleAction(connection, data.action, data.data);
      }
    });
    connection.on('close', () => {
      this.handleConnectionClosure(connection);
    });
  }

  handleConnectionClosure(connection) {
    this.connections.splice(this.connections.indexOf(connection));
    const player = this.getPlayerByConnection(connection);
    if (player) {
      player.peerId = null;
      this.playersChanged();
    }
  }

  handleRequest(connection, type, data) {
    switch (type) {
      default:
        console.error(`No request with type: ${type}`);
    }
  }

  handleAction(connection, type, data) {
    switch (type) {
      case 'pickName':
        this.pickName(connection, data);
        break;
      default:
        console.error(`No action with type: ${type}`);
    }
  }

  getPlayerByName(name) {
    return this.players.find(player => player.name === name);
  }

  getPlayerByConnection(connection) {
    if (connection) {
      return this.players.find(player => player.peerId === connection.peer);
    }
  }

  getConnectionByPlayer(player) {
    if (player) {
      return this.connections.find(connection => connection.peer === player.peerId);
    }
  }

  playersChanged() {
    this.players$.next(this.players);
    this.broadcastPlayersList();
  }

  // Actions //

  pickName(connection, name) {
    if (this.getPlayerByName(name)) {
      const existingPlayer = this.getPlayerByName(name);
      existingPlayer.peerId = connection.peer;
      if (existingPlayer.cardData) {
        this.sendCardData(existingPlayer);
      }
    } else {
      this.players.push({
        name,
        cardData: null,
        peerId: connection.peer
      });
    }
    this.playersChanged();
    connection.send({ type: 'goTo', data: 'lobby' });
  }

  // Requests //

  // Send //

  sendCardData(player) {
    if (player.cardData) {
      const connection = this.getConnectionByPlayer(player);
      if (connection) {
        connection.send({
          type: 'cardData',
          data: player.cardData
        });
      }
    }
  }

  // Broadcast //

  broadcast(type, data) {
    this.connections.forEach(connection => {
      connection.send({
        type,
        data
      })
    });
  }

  broadcastPlayersList() {
    this.broadcast('playersList', this.players.map(player => {
      return {
        name: player.name,
        isConnected: player.peerId !== null
      }
    }));
  }
}

let hostInstance;

export function getPeerHost() {
  if (!hostInstance) {
    hostInstance = new PeerHost();
  }
  return hostInstance;
}