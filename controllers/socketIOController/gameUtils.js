const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const getRandomNumberLessThan = (num) => {
  return Math.floor(Math.random() * num);
};

const randomizeArray = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const randIndex = getRandomNumberLessThan(i + 1);
    [arr[i], arr[randIndex]] = [arr[randIndex], arr[i]];
  }
  return arr;
};

module.exports = {
  sleep,
  getRandomNumberLessThan,
  randomizeArray,
};
