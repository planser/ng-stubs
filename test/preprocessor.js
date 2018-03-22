const process = require('ts-jest/preprocessor.js').process;

module.exports.process = (src, path, config, transformOptions) => {
  return process(src, path, config, transformOptions);
};