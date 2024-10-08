local json = require("json")
local process = { _version = "0.0.1" }


function process.handle(msg, ao)
    ao.log('inside' .. json.encode(msg))
    local action = msg.Action
    ao.log('Action' .. action)
    assert(type(action) == 'string', 'Action not defined')

    -- request data from RedStone Process
    if (action == "Check-Prices") then
        ao.log('Inside Check-Prices')
        -- ao.log('Oracle Process' .. msg['Oracle-Process'])
        ao.send({
            Target = msg['Oracle-Process'],
            ReqId = msg.Id,
            Action = "Request-Latest-Data",
            Tickers = json.encode({ "AR" })
        })
        return ao.result({
            Output = 'Message to Oracle sent from ' .. msg.Id
        })
    end

    -- receive requested data from RedStone Process
    if (action == "Receive-RedStone-Prices") then
        ao.log('Received price from RedStone Process')
        local result = json.decode(msg.Data)
        return ao.result({
            Output = {
                Result = result,
                ReqId = msg.ReqId,
            }
        })
    end

    -- subscription
    if (action == "Notify-On-Topic") then
        ao.log('Received price from "Notify-On-Topic"')
        local result = json.decode(msg.Data)
        return ao.result({
            Output = {
                Result = result,
                Topic = msg.Topic,
            }
        })
    end

    assert(false, 'Unknown action ' .. action)
end

return process
