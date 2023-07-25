const getRandomNumberLessThan = require("./getRandomNumberLessThan");

module.exports = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const randIndex = getRandomNumberLessThan(i + 1);
    [arr[i], arr[randIndex]] = [arr[randIndex], arr[i]];
  }
  return arr;
};
