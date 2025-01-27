
function _PricesAreMostRecent(priceData)
    local latestPrices = ORACLE.Storage[#ORACLE.Storage]

    for k, v in pairs(priceData) do
        if k ~= 'sentTs' then
            assert(v["verifiedPackage"].t > latestPrices[k]["verifiedPackage"].t, 'Only the most recent prices are stored')
        end
    end

    return true
end
