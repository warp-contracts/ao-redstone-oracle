local json = require "json"

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
end

function _RequestLatestData(msg)
    local tickers = json.decode(msg.Tickers)
    assert(#tickers > 0, 'Tickers not defined')
    assert(#ORACLE.Storage > 0, 'Storage is empty')
    local result = {};

    local latestPrices = ORACLE.Storage[#ORACLE.Storage]
    for k, v in pairs(tickers) do
        assert(latestPrices[v] ~= nil, 'No prices data for ' .. v)
        result[v] = latestPrices[v]["verifiedPackage"]
    end

    return result
end

function ORACLE.v1.RequestLatestData(msg)
    local result = _RequestLatestData(msg)
    ao.send({
        Target = msg.From,
        ReqId = msg.ReqId,
        Action = 'Receive-RedStone-Prices',
        Data = json.encode(result)
    })

    print('Sent prices ' .. msg.From)
end

function ORACLE.v2.RequestLatestData(msg)
    local result = _RequestLatestData(msg)
    msg.reply({
        Data = json.encode(result)
    })

    print('Sent prices to ' .. msg.From)
end

function ORACLE.v1.Info(msg)
    ao.send({
        Target = msg.From,
        Version = ORACLE._version,
        VerifierProcess = ORACLE.verifierProcess
    })
end

Handlers.add(
        "ORACLE.v1.Store-Prices",
        Handlers.utils.hasMatchingTagOf("Action", { "Store-Prices", "v1.Store-Prices" }),
        ORACLE.v1.StorePrices
)

Handlers.add(
        "ORACLE.v1.Request-Latest-Data",
        Handlers.utils.hasMatchingTagOf("Action", { "Request-Latest-Data", "v1.Request-Latest-Data" }),
        ORACLE.v1.RequestLatestData
)

Handlers.add(
        "ORACLE.v2.Request-Latest-Data",
        Handlers.utils.hasMatchingTag("Action", "v2.Request-Latest-Data"),
        ORACLE.v2.RequestLatestData
)

Handlers.add(
        "ORACLE.v1.Info",
        Handlers.utils.hasMatchingTag("Action", "v1.Info"),
        ORACLE.v1.Info
)
