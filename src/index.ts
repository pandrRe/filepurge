import {Game} from "./Game";

const score = localStorage.getItem('filepurge-score')
if (score) {
  document.getElementById('score')!.innerHTML = score
}

new Game();