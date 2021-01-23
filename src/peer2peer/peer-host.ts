import type { Teams, Player } from '../types/player.types';
import type { GameConfig } from '../types/config.types';
import type { Character } from '../types/character.types';
import type { Stats } from '../types/stats.types';
import { Subject } from 'rxjs';

export class PeerHost {
  peer: Peer;
  connections: Peer.DataConnection[];
  players: Player[];
  players$: Subject<Player[]>;
  stats: Stats;

  constructor() {
    this.peer = null;
    this.connections = [];
    this.players = [];
    this.players$ = new Subject();
    this.stats = {
      picks: [],
      feedbacks: []
    };
  }

  start(peerConfig): Promise<string> {
    return new Promise((resolve, reject) => {
      this.peer = new Peer(peerConfig);
      this.peer.on('open', id => {
        if (localStorage.getItem('STATS')) {
          this.stats = JSON.parse(localStorage.getItem('STATS'));
        }
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
    });
  }

  handleNewConnection(connection: Peer.DataConnection) {
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

  handleConnectionClosure(connection: Peer.DataConnection) {
    this.connections.splice(this.connections.indexOf(connection), 1);
    const player = this.getPlayerByConnection(connection);
    if (player) {
      player.peerId = null;
      this.playersChanged();
    }
  }

  handleRequest(connection: Peer.DataConnection, type: string, data: any) {
    switch (type) {
      default:
        console.error(`No request with type: ${type}`);
    }
  }

  handleAction(connection: Peer.DataConnection, type: string, data: any) {
    switch (type) {
      case 'pickName':
        this.pickName(connection, data);
        break;
      case 'chooseCard':
        this.chooseCard(connection, data);
        break;
      case 'feedback':
        this.feedback(connection, data);
      default:
        console.error(`No action with type: ${type}`);
    }
  }

  getPlayerByName(name: string): Player {
    return this.players.find(player => player.name === name);
  }

  getPlayerByConnection(connection: Peer.DataConnection): Player {
    if (connection) {
      return this.players.find(player => player.peerId === connection.peer);
    }
  }

  getConnectionByPlayer(player: Player): Peer.DataConnection {
    if (player) {
      return this.connections.find(connection => connection.peer === player.peerId);
    }
  }

  playersChanged() {
    this.players$.next(this.players);
    this.broadcastPlayersList();
  }

  startGame(gameConfig: GameConfig) {
    const teams: Teams = this.createTeams(gameConfig.shadowHuntersCount);

    let cards = gameConfig.cards;
    if (gameConfig.options.excludeAllPreviouslyPlayedCards) {
      const previouslyPlayedCardNames = this.players
        .map(p => p.previousCard)
        .filter(card => !!card)
        .map(card => card.name);
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

      case 'double':
        this.setPlayersRandomChoicesForDoubleMode(
          cards,
          teams,
          gameConfig.options.onlyOneWithSameLetter,
          gameConfig.options.modeOptions.propositionsHaveSameLetter,
          gameConfig.options.modeOptions.preventSamePlayed,
          gameConfig.options.modeOptions.preventSamePropositions
        );
        break;
    }
    // TODO : double and letter modes
  }

  createTeams(shadowHuntersCount: number): Teams {
    const shuffledPlayers = this.shuffleArray(this.players);
    return {
      hunter: shuffledPlayers.slice(0, shadowHuntersCount),
      shadow: shuffledPlayers.slice(shadowHuntersCount, shadowHuntersCount * 2),
      neutral: shuffledPlayers.slice(shadowHuntersCount * 2, shuffledPlayers.length)
    };
  }

  setPlayersRandomCardForSingleMode(
    cards: Character[],
    teams: Teams,
    onlyOneWithSameLetter: boolean,
    preventSame: boolean,
    preventSameLetter: boolean
  ) {
    for (const [teamName, teamMembers] of Object.entries(teams)) {
      let foundSolution = false;
      while (!foundSolution) {
        let remainingCards: Character[] = cards.filter(card => card.team === teamName);
        try {
          for (const teamMember of teamMembers) {
            let teamMemberChoices: Character[] = [...remainingCards];

            if (preventSame && teamMember.previousCard) {
              teamMemberChoices = teamMemberChoices.filter(
                card => card.name !== teamMember.previousCard.name
              );
            }
            if (preventSameLetter && teamMember.previousCard) {
              teamMemberChoices = teamMemberChoices.filter(
                card => !card.name.startsWith(teamMember.previousCard.name.slice(0, 1))
              );
            }

            teamMember.currentCard = this.shuffleArray(teamMemberChoices).shift();

            remainingCards = remainingCards.filter(
              card => card.name !== teamMember.currentCard.name
            );

            if (onlyOneWithSameLetter) {
              remainingCards = remainingCards.filter(
                card => !card.name.startsWith(teamMember.currentCard.name.slice(0, 1))
              );
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
      };
      this.setPlayerLocationAsCurrentCard(player);
      this.sendPlayerToItsLocation(player);
    });
  }

  setPlayersRandomChoicesForDoubleMode(
    cards: Character[],
    teams: Teams,
    onlyOneWithSameLetter: boolean,
    propositionsHaveSameLetter: boolean,
    preventSamePlayed: boolean,
    preventSamePropositions: boolean
  ) {
    for (const [teamName, teamMembers] of Object.entries(teams)) {
      let foundSolution = false;
      while (!foundSolution) {
        let remainingCards: Character[] = cards.filter(card => card.team === teamName);
        try {
          for (const teamMember of teamMembers) {
            let teamMemberChoices: Character[] = [...remainingCards];

            if (preventSamePlayed && teamMember.previousCard) {
              teamMemberChoices = teamMemberChoices.filter(
                card => card.name !== teamMember.previousCard.name
              );
            }
            if (preventSamePropositions && teamMember.previousChoices.length) {
              teamMemberChoices = teamMemberChoices.filter(
                card => !teamMember.previousChoices.map(c => c.name).includes(card.name)
              );
            }

            if (onlyOneWithSameLetter || propositionsHaveSameLetter) {
              const firstCard = this.shuffleArray(teamMemberChoices).shift();
              const choicesForSecond = teamMemberChoices.filter(
                card =>
                  card.name.startsWith(firstCard.name.slice(0, 1)) && card.name !== firstCard.name
              );
              const secondCard = this.shuffleArray(choicesForSecond).shift();
              teamMember.currentChoices = [firstCard, secondCard];
              remainingCards = remainingCards.filter(
                card => !card.name.startsWith(firstCard.name.slice(0, 1))
              );
            } else {
              teamMember.currentChoices = this.shuffleArray(teamMemberChoices).slice(0, 2);
              remainingCards = remainingCards.filter(
                card => !teamMember.currentChoices.map(c => c.name).includes(card.name)
              );
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
      player.previousChoices = [...player.currentChoices];
      this.setPlayerLocationAsCurrentChoices(player);
      this.sendPlayerToItsLocation(player);
    });

    console.log(this.players);
  }

  setPlayerLocationAsLobby(player: Player) {
    player.location = {
      room: 'lobby',
      roomData: null
    };
  }

  setPlayerLocationAsCurrentCard(player: Player) {
    player.location = {
      room: 'currentCard',
      roomData: player.currentCard
    };
  }

  setPlayerLocationAsCurrentChoices(player: Player) {
    player.location = {
      room: 'choice',
      roomData: player.currentChoices
    };
  }

  removePlayer(player: Player) {
    if (this.players.findIndex(p => p.name === player.name) > -1) {
      this.players.splice(
        this.players.findIndex(p => p.name === player.name),
        1
      );
      const conn = this.getConnectionByPlayer(player);
      if (conn) {
        conn.close();
      }
      this.playersChanged();
    }
  }

  // Actions //

  pickName(connection: Peer.DataConnection, name: string) {
    if (this.getPlayerByName(name)) {
      const existingPlayer = this.getPlayerByName(name);
      existingPlayer.peerId = connection.peer;
      this.sendPlayerToItsLocation(existingPlayer);
    } else {
      const newPlayer = {
        name,
        peerId: connection.peer,
        currentCard: null,
        previousCard: null,
        currentChoices: [],
        previousChoices: [],
        location: {
          room: 'lobby',
          roomData: null
        }
      };
      this.players.push(newPlayer);
      this.sendPlayerToItsLocation(newPlayer);
    }
    this.playersChanged();
  }

  chooseCard(connection: Peer.DataConnection, cardName: string) {
    const player = this.getPlayerByConnection(connection);
    if (!player) return;
    const currentCard = player.currentChoices.find(card => card.name === cardName);
    if (!currentCard) return;
    player.currentCard = currentCard;
    this.registerPick(player);
    this.setPlayerLocationAsCurrentCard(player);
    this.sendPlayerToItsLocation(player);
  }

  feedback(connection: Peer.DataConnection, feedback: { funLevel: number; win: boolean }) {
    const player = this.getPlayerByConnection(connection);
    this.registerFeedback(player, feedback);
    this.setPlayerLocationAsLobby(player);
    this.sendPlayerToItsLocation(player);
  }

  // Requests //

  // Send //

  sendPlayerToItsLocation(player: Player) {
    if (!player) return;
    const connection = this.getConnectionByPlayer(player);
    if (!connection) return;
    this.sendGoTo(connection, player.location.room, player.location.roomData);
  }

  sendGoTo(connection: Peer.DataConnection, whereTo: string, roomData: any) {
    connection.send({ type: 'goTo', data: { room: whereTo, roomData } });
  }

  // Broadcast //

  broadcast(type: string, data: any) {
    this.connections.forEach(connection => {
      connection.send({
        type,
        data
      });
    });
  }

  broadcastPlayersList() {
    this.broadcast(
      'playersList',
      this.players.map(player => {
        return {
          name: player.name,
          isConnected: player.peerId !== null
        };
      })
    );
  }

  shuffleArray<T>(array: T[]): T[] {
    const a = [...array];
    for (let k = 0; k < 1000; k++) {
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
    }
    return a;
  }

  // Manage stats

  getStats(): Stats {
    return this.stats;
  }

  setStats(stats: Stats) {
    this.stats = stats;
    console.log('loaded stats', stats);
  }

  registerPick(player: Player) {
    this.stats.picks.push({
      name: player.name,
      date: new Date().toISOString(),
      choices: player.currentChoices.map(card => card.name),
      pick: player.currentCard.name
    });
    localStorage.setItem('STATS', JSON.stringify(this.stats));
  }

  registerFeedback(player: Player, feedback: { win: boolean; funLevel: number }) {
    this.stats.feedbacks.push({
      name: player.name,
      date: new Date().toISOString(),
      pick: player.currentCard.name,
      win: feedback.win,
      funLevel: feedback.funLevel
    });
    localStorage.setItem('STATS', JSON.stringify(this.stats));
  }
}

let hostInstance: PeerHost;

export function getPeerHost(): PeerHost {
  if (!hostInstance) {
    hostInstance = new PeerHost();
  }
  return hostInstance;
}
