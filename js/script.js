'use strict';

//  animate__animated animate__flip
// transform-rotate-y
const coinToss = Object.freeze({
  // player: {
  //   score: 0,
  //   selectedCoinSide: '',
  // },
  // computer: {
  //   score: 0,
  //   selectedCoinSide: '',
  // },
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

const addEventListenersToButtons = (handler) => {
  const coinSideSelectBtns = document.querySelectorAll('.selection-btns__btn');
  coinSideSelectBtns.forEach((button) =>
    button.addEventListener('click', handler)
  );
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

const composed = R.compose(
  coinTossRoundWinner,
  coinTossLandedSide,
  computerChosenSide,
  playerChosenSide
);

console.log(composed(coinToss, 'heads'));
