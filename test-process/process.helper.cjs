const AoLoader = require('@permaweb/ao-loader');
const fs = require('fs');

const process = fs.readFileSync('./process.wasm');
const knownFormats = [
  'wasm32-unknown-emscripten',
  'wasm32-unknown-emscripten2',
  'wasm32-unknown-emscripten3',
  'wasm64-unknown-emscripten-draft_2024_02_15',

]
// const format = 'wasm32-unknown-emscripten'

async function load() {
  for (const format of knownFormats) {
    console.log('\nChecking format ', format);
    try {
      await AoLoader(process, {
        format,
        inputEncoding: "JSON-1",
        outputEncoding: "JSON-1",
        memoryLimit: "524288000", // in bytes
        computeLimit: 9e12.toString(),
        extensions: []
      });
    } catch (e) {
      console.error(e);
    }
  }

}

load().catch(console.error).finally(console.log);
