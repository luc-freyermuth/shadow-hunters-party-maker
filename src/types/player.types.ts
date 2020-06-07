import { Card } from "./card.types";

export interface Player {
  name: string;
  peerId: string;
  currentCard: Card;
  previousCard: Card;
  currentChoices: Card[];
  previousChoices: Card[];
}

export interface PlayerInfo {
  name: string;
  isConnected: boolean;
}