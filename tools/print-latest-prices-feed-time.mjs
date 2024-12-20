import {dryrun} from "@permaweb/aoconnect";


/*
* Script for monitoring time updates on oracle process.
* Behind param is time difference between now and the last prices update.
* */

// pm2 start  ./tools/print-latest-prices-feed-time.mjs --name oracle-monitor --time --no-autorestart --cron "*/2 * * * *"

const ORACLE_CONTRACT = '4fVi8P-xSRWxZ0EE0EpltDe8WJJvcD9QyFXMqfk-1UQ';
const ACTION = 'v2.Request-Latest-Data';

const start = Date.now();
console.log(`Executing dry run action: ${ACTION} on contract ${ORACLE_CONTRACT}`)

dryrun({
    process: ORACLE_CONTRACT,
    tags: [
        {name: 'Action', value: ACTION},
        {name: 'Tickers', value: JSON.stringify(['AR'])}
    ],
    data: '1984'
})
    .then(pricesFeed)
    .then((pf) => {
        if (!pf) {
            console.error(`Cannot fetch prices feed from `, ORACLE_CONTRACT);
        }
        let arPriceDate = new Date(pf.AR.t);
        let behind = Date.now() - pf.AR.t;
        let execution = Date.now() - start;
        let diff = behind - execution;
        console.log(`Execution took[ms]: ${execution}  Last prices feed: ${arPriceDate.toISOString()}  behind[ms]: ${behind}  diff[ms]: ${diff}  AR: ${pf.AR.v}`);
    });

function pricesFeed(result) {
    if (result.Messages < 1) {
        console.error(`No messages returned`);
        return null;
    }
    try {
        return JSON.parse(result.Messages[0].Data)
    } catch (e) {
        console.error(`Cannot parse Data`, e);
        return null;
    }
}

