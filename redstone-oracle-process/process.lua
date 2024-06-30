local json = require("json")
local process = { _version = "0.0.1" }

if not Storage then Storage = {} end

function process.handle(msg, ao)
    local action = msg.Action
    assert(type(action) == 'string', 'Action not defined')
    if (action == "Store-Prices") then
        assert(msg.Owner == 'jnioZFibZSCcV8o-HkBXYPYEYNib4tqfexP0kCBXX_M', 'Only trusted address allowed to store price')
        ao.log('owner checked')
        local pricesData = json.decode(msg.Data)
        ao.log('prices decoded')
        table.insert(Storage, pricesData)
        ao.log('prices inserted')
        if #Storage > 50 then
            table.remove(Storage, 1)
        end
        ao.log('prices removed')
        return ao.result({
            Output = 'Data stored for msg' .. msg.Id
        })
    end

    if (action == "Request-Latest-Data") then
        local tickers = json.decode(msg.Tickers)
        assert(#tickers > 0, 'Tickers not defined')
        assert(#Storage > 0, 'Storage is empty')
        local result = {};

        local latestPrices = Storage[#Storage]
        for k, v in pairs(tickers) do
            assert(latestPrices[v] ~= nil, 'No prices data for ' .. v)
            result[v] = latestPrices[v]["verifiedPackage"]
        end

        ao.send({
            Target = msg.From,
            ReqId = msg.ReqId,
            Action = 'Receive-RedStone-Prices',
            Data = result
        })
        return ao.result({
            Output = {
                Request = msg.From,
                Tickers = tickers,
                Result = result
            }
        })
    end

    assert(false, 'Unknown action ' .. action)
end

return process
