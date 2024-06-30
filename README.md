# AO RedStone Oracle

### Process Ids
1. AO Testnet Oracle Storage- `KvQhYDJTQwpS3huPUJy5xybUDN3L8SE1mhLOBAt5l6Y`
   1. Process `KvQhYDJTQwpS3huPUJy5xybUDN3L8SE1mhLOBAt5l6Y`
   2. Module `FrdUPdwGEKtRO9NURUU5MpESzk2hz8kHg4zKMYH_rO4`
2. AO Warp Testnet Verifier Process - 
   1. Process `ILnN6EL4zUE3nPovKBwvOl8GvC2RsvE8x_JYG8Fx6aY`
   2. Module `_K-2x2UNxYgUc1O0uDwTNroF6vwk-CSmGl9mwsOeqVc`
3. AO Testnet Example asking process
   1. Process `8_jC3ICVqoongkw1fvdncGdHK_uTyffRzSojDE-0pv8`
   2. Module `O-6Pl2pUTgaeuDwEnfERKBQ6jPr8tLq27wsqu0Ai1iM`

### AoLoader issue reproduction

1. `curl -L https://arweave.net/BVhXa-OCcQV6xuhsoS6207uHkXcRz4UmR5xvQct1GXI | bash`
2. `ao --version` should show `0.0.54`
3. `git clone https://github.com/warp-contracts/ao-redstone-oracle.git`
4. `cd ao-redstone-oracle`
5. `npm install`
6. `npm run loader-issue`

Expected result:
The `AoLoader` should load the wasm binary using one of the predefined formats

Result:
`AoLoader` fails to load wasm binary, no matter which format is used.

Example output:
```
npm run loader-issue

> loader-issue
> cd test-process && ao build && node --experimental-wasm-memory64 process.helper.mjs

emcc: warning: -sMEMORY64 is still experimental. Many features may not work. [-Wexperimental]
cache:INFO: generating system asset: symbol_lists/90be13d5bafb3254bd351cb6d04d5e6d75f87d33.json... (this will be cached in "/emsdk/upstream/emscripten/cache/symbol_lists/90be13d5bafb3254bd351cb6d04d5e6d75f87d33.json" for subsequent builds)
cache:INFO:  - ok

Checking format  wasm32-unknown-emscripten
failed to asynchronously prepare wasm: TypeError: WebAssembly.instantiate(): Import #0 module="env" error: module is not an object or function
Aborted(TypeError: WebAssembly.instantiate(): Import #0 module="env" error: module is not an object or function)
RuntimeError: Aborted(TypeError: WebAssembly.instantiate(): Import #0 module="env" error: module is not an object or function). Build with -sASSERTIONS for more info.
    at abort (/Users/ppe/projects/ao-redstone-oracle/node_modules/@permaweb/ao-loader/dist/index.cjs:479:21)
    at /Users/ppe/projects/ao-redstone-oracle/node_modules/@permaweb/ao-loader/dist/index.cjs:560:15

Checking format  wasm32-unknown-emscripten2
failed to asynchronously prepare wasm: LinkError: WebAssembly.instantiate(): Import #1 module="env" function="invoke_vjj" error: function import requires a callable
Aborted(LinkError: WebAssembly.instantiate(): Import #1 module="env" function="invoke_vjj" error: function import requires a callable)
RuntimeError: Aborted(LinkError: WebAssembly.instantiate(): Import #1 module="env" function="invoke_vjj" error: function import requires a callable)
    at abort (/Users/ppe/projects/ao-redstone-oracle/node_modules/@permaweb/ao-loader/dist/index.cjs:2346:19)
    at /Users/ppe/projects/ao-redstone-oracle/node_modules/@permaweb/ao-loader/dist/index.cjs:2456:15

Checking format  wasm32-unknown-emscripten3
failed to asynchronously prepare wasm: LinkError: WebAssembly.instantiate(): Import #1 module="env" function="invoke_vjj" error: function import requires a callable
Aborted(LinkError: WebAssembly.instantiate(): Import #1 module="env" function="invoke_vjj" error: function import requires a callable)
RuntimeError: Aborted(LinkError: WebAssembly.instantiate(): Import #1 module="env" function="invoke_vjj" error: function import requires a callable)
    at abort (/Users/ppe/projects/ao-redstone-oracle/node_modules/@permaweb/ao-loader/dist/index.cjs:7240:19)
    at /Users/ppe/projects/ao-redstone-oracle/node_modules/@permaweb/ao-loader/dist/index.cjs:7297:13

Checking format  wasm64-unknown-emscripten-draft_2024_02_15
failed to asynchronously prepare wasm: LinkError: WebAssembly.instantiate(): Import #0 module="env" function="abort" error: function import requires a callable
Aborted(LinkError: WebAssembly.instantiate(): Import #0 module="env" function="abort" error: function import requires a callable)
RuntimeError: Aborted(LinkError: WebAssembly.instantiate(): Import #0 module="env" function="abort" error: function import requires a callable)
    at abort (/Users/ppe/projects/ao-redstone-oracle/node_modules/@permaweb/ao-loader/dist/index.cjs:12071:19)
    at /Users/ppe/projects/ao-redstone-oracle/node_modules/@permaweb/ao-loader/dist/index.cjs:12132:13
```

