import AoLoader from '@permaweb/ao-loader'
import fs from 'fs'

const process = fs.readFileSync('./redstone-oracle-process/dist/process.wasm');
const format = "wasm64-unknown-emscripten-draft_2024_02_15";
let memory = null;
const handle = await AoLoader(process, {
  format,
});

function prepareMessageFrom(DataItem) {
  return Object.keys(DataItem).reduce(function (di, k) {
    if (di[k]) {
      di[k] = DataItem[k]
    } else {
      di.Tags = di.Tags.concat([{name: k, value: DataItem[k]}])
    }
    return di
  }, createMsg(DataItem));
}

export async function Send(DataItem) {

  const msg = prepareMessageFrom(DataItem)
  console.log(msg.Tags);
  const env = createEnv()

  const result = await handle(memory, msg, env)
  if (result.Error) {
    return 'ERROR: ' + JSON.stringify(result.Error)
  }
  memory = result.Memory

  return { Messages: result.Messages, Spawns: result.Spawns, Output: result.Output, Assignments: result.Assignments }
}

function createMsg(DataItem) {
  return {
    Id: '1234',
    Target: 'AOS',
    Owner: DataItem.Owner,
    From: DataItem.Owner,
    Data: DataItem.Data,
    Tags: [],
    'Block-Height': '1',
    Timestamp: Date.now(),
    Module: '4567'
  }
}

function createEnv() {
  return {
    Process: {
      Id: '9876',
      Tags: [
        { name: 'Data-Protocol', value: 'ao' },
        { name: 'Variant', value: 'ao.TN.1' },
        { name: 'Type', value: 'Process' }
      ]
    },
    Module: {
      Id: '4567',
      Tags: [
        { name: 'Data-Protocol', value: 'ao' },
        { name: 'Variant', value: 'ao.TN.1' },
        { name: 'Type', value: 'Module' }
      ]
    }
  }
}