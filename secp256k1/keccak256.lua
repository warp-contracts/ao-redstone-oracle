local bit = require("bit")

local function keccak256(message)
    -- Constants
    local KECCAK_ROUNDS = 24
    local KECCAK_STATE_SIZE = 200
    local KECCAK_RATE = 136

    -- Helper functions
    local function rotl64(x, y)
        return bit.bor(bit.lshift(x, y), bit.rshift(x, 64 - y))
    end

    local function keccak_f(state)
        local lanes = {}
        for i = 0, 24 do
            lanes[i] = 0
            for j = 0, 7 do
                lanes[i] = bit.bor(lanes[i], bit.lshift(state[i * 8 + j + 1], j * 8))
            end
        end

        local R = {
            0, 1, 62, 28, 27, 36, 44, 6, 55, 20, 3, 10, 43,
            25, 39, 41, 45, 15, 21, 8, 18, 2, 61, 56, 14
        }

        local round_constants = {
            0x0000000000000001ULL, 0x0000000000008082ULL, 0x800000000000808aULL,
            0x8000000080008000ULL, 0x000000000000808bULL, 0x0000000080000001ULL,
            0x8000000080008081ULL, 0x8000000000008009ULL, 0x000000000000008aULL,
            0x0000000000000088ULL, 0x0000000080008009ULL, 0x000000008000000aULL,
            0x000000008000808bULL, 0x800000000000008bULL, 0x8000000000008089ULL,
            0x8000000000008003ULL, 0x8000000000008002ULL, 0x8000000000000080ULL,
            0x000000000000800aULL, 0x800000008000000aULL, 0x8000000080008081ULL,
            0x8000000000008080ULL, 0x0000000080000001ULL, 0x8000000080008008ULL
        }

        for round = 0, KECCAK_ROUNDS - 1 do
            local C = {}
            for x = 0, 4 do
                C[x] = bit.bxor(lanes[x], lanes[x + 5], lanes[x + 10], lanes[x + 15], lanes[x + 20])
            end

            for x = 0, 4 do
                local D = bit.bxor(C[(x - 1) % 5], rotl64(C[(x + 1) % 5], 1))
                for y = 0, 4 do
                    lanes[x + 5 * y] = bit.bxor(lanes[x + 5 * y], D)
                end
            end

            local x, y = 1, 0
            local current = lanes[x + 5 * y]
            for t = 0, 23 do
                local r = R[t + 1]
                x, y = y, (2 * x + 3 * y) % 5
                local temp = lanes[x + 5 * y]
                lanes[x + 5 * y] = rotl64(current, r)
                current = temp
            end

            for y = 0, 4 do
                local T = {}
                for x = 0, 4 do
                    T[x] = lanes[x + 5 * y]
                end
                for x = 0, 4 do
                    lanes[x + 5 * y] = bit.bxor(T[x], bit.band(bit.bnot(T[(x + 1) % 5]), T[(x + 2) % 5]))
                end
            end

            lanes[0] = bit.bxor(lanes[0], round_constants[round + 1])
        end

        for i = 0, 24 do
            for j = 0, 7 do
                state[i * 8 + j + 1] = bit.band(bit.rshift(lanes[i], j * 8), 0xFF)
            end
        end
    end

    -- Main keccak256 function
    local state = {}
    for i = 1, KECCAK_STATE_SIZE do
        state[i] = 0
    end

    local message_length = #message
    local block_size = KECCAK_RATE

    for i = 1, message_length, block_size do
        local remaining = math.min(block_size, message_length - i + 1)
        for j = 1, remaining do
            state[j] = bit.bxor(state[j], string.byte(message, i + j - 1))
        end

        if remaining == block_size then
            keccak_f(state)
        end
    end

    -- Padding
    state[remaining + 1] = bit.bxor(state[remaining + 1], 0x01)
    state[block_size] = bit.bxor(state[block_size], 0x80)
    keccak_f(state)

    -- Output
    local output = ""
    for i = 1, 32 do
        output = output .. string.format("%02x", state[i])
    end

    return output
end

-- Example usage
local hash = keccak256("Hello, World!")
print(hash)