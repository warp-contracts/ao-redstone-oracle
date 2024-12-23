local json = require "json"

ORACLE.verifierProcesses = ORACLE.verifierProcesses or {
    'g4_Dzk3Ib-PBY3rnvbpGkKpG6fU_DBBy4PSaaUpQcGE',
    'MBu-epRqXCqqLEMMSqaXajQyM5f0KwW-adiF12Ue89I'
}


function _FromTrustedVerifier (msg)
    for _, value in pairs(ORACLE.verifierProcesses) do
        if value == msg.From then
            return true
        end
    end

    return false
end

function _PricesAreMostRecent(priceData)
    local latestPrices = ORACLE.Storage[#ORACLE.Storage]

    for k, v in pairs(priceData) do
        assert(v["verifiedPackage"].t > latestPrices[k]["verifiedPackage"].t, 'Only the most recent prices are stored')
    end

    return true
end

function ORACLE.v1.StorePrices(msg)
    assert(_FromTrustedVerifier(msg), 'Only trusted verifier processes allowed to store price')
    local priceData = json.decode(msg.Data)

    if msg.From == ORACLE.verifierProcess or _PricesAreMostRecent(priceData) then
        table.insert(ORACLE.Storage, priceData)
        if #ORACLE.Storage > 50 then
            table.remove(ORACLE.Storage, 1)
        end
    end
end

Handlers.remove("ORACLE.v1.Store-Prices")
Handlers.add(
        "ORACLE.v1.Store-Prices",
        Handlers.utils.hasMatchingTagOf("Action", { "Store-Prices", "v1.Store-Prices" }),
        ORACLE.v1.StorePrices
)
