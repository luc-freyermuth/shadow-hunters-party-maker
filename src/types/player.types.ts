import { Character } from "./character.types";

export interface Player {
  name: string;
  peerId: string;
  currentCard: Character;
  previousCard: Character;
  currentChoices: Character[];
  previousChoices: Character[];
}

export interface PlayerInfo {
  name: string;
  isConnected: boolean;
}

export interface Teams {
  [teamName: string]: Player[];
}