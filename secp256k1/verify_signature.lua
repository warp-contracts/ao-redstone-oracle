local secp256k1 = require("secp256k1")
local crypto = require(".crypto")

local function keccak256(msg)
    return crypto.digest.keccak256(msg).asHex()
end

local function hexToBin(hex)
    return (hex:gsub('..', function (cc)
        return string.char(tonumber(cc, 16))
    end))
end

local function verify_ethereum_signature(message, signature, public_key)
    -- Hash the message using Keccak-256
    local hashed_message = keccak256("\x19Ethereum Signed Message:\n" .. #message .. message)
    print(hashed_message)
    return secp256k1.verify_signature(hexToBin(hashed_message), hexToBin(signature), hexToBin(public_key))
end

-- should be c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470
print(keccak256(""))

local message1 = "Hello, Ethereum!"
local messageHash1 = "9c1185a5c5e9fc54612808977ee8f548b2258d31"  -- Keccak256 hash of "Hello, Ethereum!"
local signature1 = "9d39dcc4d8f5d16f35d9e02f4a86eef2b6b80da0a31fa0d01b7f9cd3e6e290fd1f03546e104e53d9d268a1d6de39fa32dd442bf0a240a85c1a34a4f3b3f8e1d01"
local publicKey1 = "04b7a5a403f41a6f9f49498c8d5e1b0f1c85fd88185a0e06b7c6b5aa0df6bd1d5c78ad48c7c8fb29e8c28b0f64adb0e55b8a4c2bf8dd9b9072e5f8d30ae27627f"

local is_valid = verify_ethereum_signature(message1, signature1, publicKey1)
print("Signature valid:", is_valid)
