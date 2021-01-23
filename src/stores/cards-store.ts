import { readable, Readable } from 'svelte/store';
import type { Character } from '../types/character.types';

export const cardsStore: Readable<Character[]> = readable([], set => {
  fetch(window.origin + '/cards/cards.json')
    .then(response => {
      return response.json();
    })
    .then(data => {
      set(data);
    });
});
