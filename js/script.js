'use strict';

const coinTossData = Object.freeze({
  participants: [
    { participant: 'player', score: 0, selectedCoinSide: '' },
    { participant: 'computer', score: 0, selectedCoinSide: '' },
  ],
  coinSide: '',
});

const animateCSS = (element, animation, prefix = 'animate__') => {
  // We create a Promise and return it
  new Promise((resolve, reject) => {
    const animationName = `${prefix}${animation}`;
    const node = document.querySelector(element);

    node.classList.add(`${prefix}animated`, animationName);

    // When the animation ends, we clean the classes and resolve the Promise
    function handleAnimationEnd(event) {
      event.stopPropagation();
      node.classList.remove(`${prefix}animated`, animationName);
      resolve('Animation ended');
    }

    node.addEventListener('animationend', handleAnimationEnd, { once: true });
  });
};

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min);

const randomCoinSide = () => {
  return ['heads', 'tails'][randomInt(0, 1)];
};

const coinTossRoundWinner = (data) => {
  const newData = R.clone(data);

  let { participants, coinSide } = newData;

  participants = participants.map((participant) => {
    if (coinSide === participant.selectedCoinSide) {
      participant.score += 1;
    }

    return participant;
  });

  return newData;
};

const coinTossLandedSide = (data) => {
  const newData = R.clone(data);

  newData.coinSide = randomCoinSide();

  return newData;
};

const computerChosenSide = (data) => {
  const newData = R.clone(data);

  const { participants } = newData;

  participants[1].selectedCoinSide = randomCoinSide();

  return newData;
};

const playerChosenSide = (data, chosenSide) => {
  const newData = R.clone(data);

  const { participants } = newData;

  participants[0].selectedCoinSide = chosenSide;

  return newData;
};

const updateData = R.compose(
  coinTossRoundWinner,
  coinTossLandedSide,
  computerChosenSide,
  playerChosenSide
);

const removeTransformFromElements = () => {
  const coinSides = document.querySelectorAll('.coin-side');
  coinSides.forEach((side) => side.classList.remove('transform-rotate-y'));
};

const addTransformToLosingCoinSide = (coinSide) => {
  switch (coinSide) {
    case 'heads':
      const tails = document.querySelector('.coin__tails');
      tails.classList.add('transform-rotate-y');
      break;
    case 'tails':
      const heads = document.querySelector('.coin__heads');
      heads.classList.add('transform-rotate-y');
      break;
    default:
      break;
  }
};

const updateScore = (participantArr) => {
  const scorePlayer = document.querySelector('.score__player');
  const scoreComputer = document.querySelector('.score__computer');

  scorePlayer.innerText = participantArr[0].score;
  scoreComputer.innerText = participantArr[1].score;
};

const updateSelectedSide = (participantArr) => {
  const selectedPlayer = document.querySelector('.selected__player');
  const selectedComputer = document.querySelector('.selected__computer');

  selectedPlayer.innerText = participantArr[0].selectedCoinSide;
  selectedComputer.innerText = participantArr[1].selectedCoinSide;
};

const addEventListenersToSideButtons = (handler) => {
  const coinSideSelectBtns = document.querySelectorAll('.selection-btns__btn');
  coinSideSelectBtns.forEach((button) =>
    button.addEventListener('click', handler)
  );
};

const addEventListenerToNewGameBtn = (handler) => {
  const newGameBtn = document.querySelector('.btn--new-game');

  newGameBtn.addEventListener('click', handler);
};

const removeEventListener = (handler) => {
  const coinSideSelectBtns = document.querySelectorAll('.selection-btns__btn');
  coinSideSelectBtns.forEach((button) =>
    button.removeEventListener('click', handler)
  );
};

const animationEndListener = (element, handler, parent = document) => {
  const targetEl = parent.querySelector(element);
  targetEl.addEventListener('animationend', handler);
};

const storePreviousData = function () {
  let oldData;

  return function (chosenSide) {
    let data;

    if (!oldData) {
      oldData = updateData(coinTossData, chosenSide);

      data = oldData;
    } else {
      data = updateData(oldData, chosenSide);

      oldData = data;
    }

    return data;
  };
};

const newData = storePreviousData();

const showWinnerOrDraw = (message) => {
  const scores = document.querySelector('.score__scores');
  const scoreWinnerContainer = document.querySelector('.score__winner');
  const winner = scoreWinnerContainer.querySelector('.winner');

  scoreWinnerContainer.classList.remove('hidden');
  scores.classList.add('hidden');

  winner.innerText = message;
};

const coinSideButtonHandler = function () {
  const chosenSide = this.dataset.selected;

  const data = newData(chosenSide);

  const { coinSide, participants } = data;

  const player = participants[0];
  const computer = participants[1];

  // Remove transform class from coin side elements
  removeTransformFromElements();

  // Add transform class to losing side
  addTransformToLosingCoinSide(coinSide);

  // Update selected sides
  updateSelectedSide(participants);

  // Add coin animation
  animateCSS('.coin', 'flip');

  if (player.score === computer.score && player.score === 5) {
    showWinnerOrDraw('DRAW!');
    return removeEventListener(coinSideButtonHandler);
  }

  if (player.score === 5) {
    showWinnerOrDraw('YOU WIN!');
    return removeEventListener(coinSideButtonHandler);
  }

  if (computer.score === 5) {
    showWinnerOrDraw('COMPUTER WINS!');
    return removeEventListener(coinSideButtonHandler);
  }

  // Update score after animation ends
  animationEndListener('.coin', updateScore.bind(null, participants));
};

const newGameBtnHandler = function () {
  const scores = document.querySelector('.score__scores');
  const winnerTextContainer = document.querySelector('.score__winner');

  updateScore(coinTossData.participants);
  updateSelectedSide(coinTossData.participants);

  if (scores.classList.contains('hidden')) {
    scores.classList.remove('hidden');
    winnerTextContainer.classList.add('hidden');
  }
};

addEventListenersToSideButtons(coinSideButtonHandler);
addEventListenerToNewGameBtn(newGameBtnHandler);
