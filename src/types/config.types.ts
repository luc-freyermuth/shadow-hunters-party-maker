import { Character } from './character.types';

export interface PeerConfig {
  host?: string;
  port?: string;
  path?: string;
  key?: string;
}

export interface GameConfig {
  shadowHuntersCount: number;
  cards: Character[];
  options: {
    excludeAllPreviouslyPlayedCards: boolean;
    onlyOneWithSameLetter: boolean;
    mode: string;
    modeOptions: {
      preventSame?: boolean;
      preventSameLetter?: boolean;
      propositionsHaveSameLetter?: boolean;
      preventSamePlayed?: boolean;
      preventSamePropositions?: boolean;
    };
  };
}
