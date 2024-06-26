-- local crypto = require(".crypto")

local process = { _version = "0.0.1" }

function process.handle(msg, ao)
    assert(ao.isTrusted(msg), 'ao Message is not trusted')

    local action = msg.Tags.Action

    if (action == "test") then
        return ao.result({
            foo = "bar",
            --[[keccak = crypto.digest.keccak256(msg).asHex()]]
        })
    end

    if (msg.Data == "ping") then
        return ao.result({
            Output = 'sent pong reply'
        })
        --ao.send({ Target = msg.From, Data = "pong" })
    end
end

return process
