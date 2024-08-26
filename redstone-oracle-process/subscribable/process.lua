local json = require "json"

-- LOAD SUBSCRIBABLE CAPABILITIES

if not Subscribable then
    Subscribable = require 'subscribable'({
        initial = true,
        useDB = false
    })
    Subscribable.PAYMENT_TOKEN = "rH_-7vT_IgfFWiDsrcTghIhb9aRclz7lXcK7RCOV2h8"
    Subscribable.PAYMENT_TOKEN_TICKER = "CBTOKEN"
else
    Subscribable = require 'subscribable'({
        initial = false,
        existing = Subscribable
    })
end

--[[
  most simple implementation
    -> subscribers can only receice ALL ticker prices
    -> configure no checkFn and payloadFn, because
        - the logic for when to dispatch is straightforward
        - the payload is readily available when it's time to dispatch
 ]]
Subscribable.configTopicsAndChecks({
    ['prices-update'] = {
        description = 'Update on prices',
        returns = '{ [ticker: string] : string }', -- optionally describe payload format
    },
})

-- CORE STORAGE PROCESS

local version = "1.0.0"
ORACLE = {}

ORACLE._version = ORACLE._version or version
ORACLE.Storage = ORACLE.Storage or {}
ORACLE.verifierProcess = ORACLE.verifierProcess or 'AeNGydMeVggak4I6LhO_B89XeBF4tTBsgngJvTa_iLI'
ORACLE.v1 = ORACLE.v1 or {}
ORACLE.v2 = ORACLE.v2 or {}

function ORACLE.v1.StorePrices(msg)
    assert(msg.From == ORACLE.verifierProcess, 'Only trusted verifier process allowed to store price')
    local priceData = json.decode(msg.Data)
    table.insert(ORACLE.Storage, priceData)
    if #ORACLE.Storage > 50 then
        table.remove(ORACLE.Storage, 1)
    end
    -- The only place where subscribers are notified
    Subscribable.notifyTopic('prices-update', priceData, msg.Timestamp)
end

function ORACLE.v1.Info(msg)
    ao.send({
        Target = msg.From,
        Version = ORACLE._version,
        TrustedOwner = ORACLE.trustedOwner
    })
end

function ORACLE.v2.Info(msg)
    assert(#ORACLE.Storage > 0, 'Storage is empty')
    local latestPrices = ORACLE.Storage[#ORACLE.Storage]
    ao.send({
        Target = msg.From,
        Version = ORACLE._version,
        VerifierProcess = ORACLE.verifierProcess,
        Data = json.encode(latestPrices)
    })
end

Handlers.add(
        "ORACLE.v1.Store-Prices",
        Handlers.utils.hasMatchingTagOf("Action", { "Store-Prices", "v1.Store-Prices" }),
        ORACLE.v1.StorePrices
)

Handlers.add(
        "Register-Whitelisted-Subscriber",
        Handlers.utils.hasMatchingTag("Action", "Register-Whitelisted-Subscriber"),
        Subscribable.handleRegisterWhitelistedSubscriber
)

Handlers.add(
        "ORACLE.v1.Info",
        Handlers.utils.hasMatchingTag("Action", "v1.Info"),
        ORACLE.v1.Info
)
