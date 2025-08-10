const path = require('path');

module.exports = {
  entry: "./site/dist/game.js",
  mode: 'production',
  output: {
    filename: 'bundle.js', // [name] will be replaced by the file name (e.g., home.bundle.js)
    path: path.resolve(__dirname, 'site/dist'),
  },
};
