import type { Character } from 'src/types/character.types';
import type { Player } from 'src/types/player.types';
import { PeerHost } from './peer-host';

function createPlayer(player: Partial<Player>): Player {
  return {
    currentCard: null,
    previousCard: null,
    name: 'Jean-René',
    previousChoices: [],
    currentChoices: [],
    location: {
      room: 'lobby',
      roomData: null
    },
    peerId: '',
    ...player
  };
}

function createCard(name: string = 'akemi', team: string = 'neutral'): Character {
  return {
    image: `${name}.webp`,
    imageFallbacks: [`${name}.jpg`],
    name,
    team,
    theme: `${name}.ogg`
  };
}

describe('PeerHost', () => {
  let peerHost: PeerHost;

  beforeEach(() => {
    peerHost = new PeerHost();
  });

  it('should be created', () => {
    expect(peerHost).toBeTruthy();
  });

  describe('getAvailableCards', () => {
    it('should not exclude any card if not requested', () => {
      const akemi = createCard('akemi');
      const batou = createCard('batou');
      const cc = createCard('cc');

      const cards = peerHost.getAvailableCards(
        {
          cards: [akemi, batou, cc],
          teams: { hunters: 2, shadows: 2 },
          options: {
            excludeAllPreviouslyPlayedCards: false,
            mode: 'single',
            modeOptions: {},
            onlyOneWithSameLetter: false
          }
        },
        [createPlayer({ previousCard: akemi }), createPlayer({ previousCard: cc })]
      );

      expect(cards).toEqual([akemi, batou, cc]);
    });

    it('should exclude previously played cards if requested', () => {
      const akemi = createCard('akemi');
      const batou = createCard('batou');
      const cc = createCard('cc');

      const cards = peerHost.getAvailableCards(
        {
          cards: [akemi, batou, cc],
          teams: { hunters: 2, shadows: 2 },
          options: {
            excludeAllPreviouslyPlayedCards: true,
            mode: 'single',
            modeOptions: {},
            onlyOneWithSameLetter: false
          }
        },
        [createPlayer({ previousCard: akemi }), createPlayer({ previousCard: cc })]
      );

      expect(cards).toEqual([batou]);
    });
  });
});
