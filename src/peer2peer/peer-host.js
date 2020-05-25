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

  startGame(gameConfig) {
    const teams = this.createTeams(gameConfig.shadowHuntersCount);

    let cards = gameConfig.cards;
    if (gameConfig.options.excludeAllPreviouslyPlayedCards) {
      const previouslyPlayedCardNames = this.players.map(p => p.previousCard).filter(card => !!card).map(card => card.name);
      cards = cards.filter(card => !previouslyPlayedCardNames.includes(card.name));
    }

    switch (gameConfig.options.mode) {
      case 'single':
        this.setPlayersRandomCardForSingleMode(
          cards, 
          teams,
          gameConfig.options.onlyOneWithSameLetter,
          gameConfig.options.modeOptions.preventSame,
          gameConfig.options.modeOptions.preventSameLetter
        );
        break;
    }
    // TODO : double and letter modes

    
  }

  createTeams(shadowHuntersCount) {
    const shuffledPlayers = this.shuffleArray(this.players);
    return {
      hunter: shuffledPlayers.slice(0, shadowHuntersCount),
      shadow: shuffledPlayers.slice(shadowHuntersCount, shadowHuntersCount * 2),
      neutral: shuffledPlayers.slice(shadowHuntersCount * 2, shuffledPlayers.length)
    }
  }

  setPlayersRandomCardForSingleMode(cards, teams, onlyOneWithSameLetter, preventSame, preventSameLetter) {
    for (const [teamName, teamMembers] of Object.entries(teams)) {
      let foundSolution = false;
      while (!foundSolution) {
        let remainingCards = cards.filter(card => card.team === teamName);
        try {
          for (const teamMember of teamMembers) {
            let teamMemberChoices = [...remainingCards];

            if (preventSame && teamMember.previousCard) {
              teamMemberChoices = teamMemberChoices.filter(card => card.name !== teamMember.previousCard.name);
            }
            if (preventSameLetter && teamMember.previousCard) {
              teamMemberChoices = teamMemberChoices.filter(card => !card.name.startsWith(teamMember.previousCard.name.slice(0,1)));
            }

            teamMember.currentCard = this.shuffleArray(teamMemberChoices).shift();

            remainingCards = remainingCards.filter(card => card.name !== teamMember.currentCard.name);

            if (onlyOneWithSameLetter) {
              remainingCards = remainingCards.filter(card => !card.name.startsWith(teamMember.currentCard.name.slice(0,1)));
            }
          }
          foundSolution = true;
        } catch (error) {
          console.warn(error);
          console.log('solution not found, retrying');
          foundSolution = false;
        }
      }
    }

    this.players.forEach(player => {
      player.previousCard = {
        ...player.currentCard
      }
    });
  }

  // Actions //

  pickName(connection, name) {
    if (this.getPlayerByName(name)) {
      const existingPlayer = this.getPlayerByName(name);
      existingPlayer.peerId = connection.peer;
      if (existingPlayer.currentCard) {
        this.sendCurrentCard(existingPlayer);
      }
    } else {
      this.players.push({
        name,
        peerId: connection.peer,
        currentCard: null,
        previousCard: null,
        previousChoices: []
      });
    }
    this.playersChanged();
    connection.send({ type: 'goTo', data: 'lobby' });
  }

  // Requests //

  // Send //

  sendCurrentCard(player) {
    if (player.currentCard) {
      const connection = this.getConnectionByPlayer(player);
      if (connection) {
        connection.send({
          type: 'currentCard',
          data: player.currentCard
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

  shuffleArray(array) {
    const a = [...array];
    for (let k = 0; k < 1000; k++) {
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
    }
    return a;
  }
}

let hostInstance;

export function getPeerHost() {
  if (!hostInstance) {
    hostInstance = new PeerHost();
  }
  return hostInstance;
}