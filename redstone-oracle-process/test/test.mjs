import {Send} from "./process.helper.mjs";

async function doTest() {
  const result = await Send({
    Action: 'test',
  })
}

doTest().catch(console.error).finally(console.log)