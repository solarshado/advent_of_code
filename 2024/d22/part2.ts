import { runMain, sum, } from "../util.ts";
import { count, map, range, reduce, toArray } from "../iter_util.ts";
import { memoize, pipe, } from '../func_util.ts';
import * as gu from "../grid_util.ts";
import { ITERATIONS, nextSecret } from './part1.ts';

function buildPriceLists(initialSecrets:bigint[]) {
    function getPrice(secret:bigint) {
        return Number(secret % 10n);
    }

    const prices = [];

    let secrets = initialSecrets;

    prices.push(secrets.map(getPrice));

    for(const _ of range(0,ITERATIONS)) {
        secrets = secrets.map(nextSecret);
        prices.push(secrets.map(getPrice));
    }

    return prices;
}

function findTopPrices(priceLists:ReturnType<typeof buildPriceLists>) {

    const withDeltas = priceLists.map((tick,i,pl)=>{
        const prev = pl[i-1];
        const prev2 = pl[i-2];
        const prev3 = pl[i-3];
        const prev4 = pl[i-4];

        return tick.map((price,i)=>({
            price,
            delta: price - (prev?.[i] ?? NaN),
            prevDelta: (prev?.[i] ?? NaN) - (prev2?.[i] ?? NaN),
            prevDelta2: (prev2?.[i] ?? NaN) - (prev3?.[i] ?? NaN),
            prevDelta3: (prev3?.[i] ?? NaN) - (prev4?.[i] ?? NaN),
        }));
    });

    const dataBySeller = withDeltas.reduce((acc,curTick)=>{
        curTick.forEach((datum,i)=>{
            const {priceAt,timesForPrice} = acc[i];
            const deltas = [datum.prevDelta3, datum.prevDelta2, datum.prevDelta, datum.delta]

            if(deltas.some(isNaN))
                return;

            const timeCode = deltas.join(',');
            
            if(!priceAt.has(timeCode))
                priceAt.set(timeCode,datum.price);

            if(!timesForPrice.has(datum.price))
                timesForPrice.set(datum.price,[]);

            timesForPrice.get(datum.price)!.push(timeCode);
        });

        return acc;
    }, Array.from(withDeltas, ()=>({priceAt:new Map<string,number>(), timesForPrice:new Map<number,string[]>() })));

    const allTimes = new Set(dataBySeller.flatMap(s=>toArray(s.priceAt.keys())));

    const foo = reduce(allTimes, (acc,curTime)=>
                       Math.max(acc,
                                dataBySeller.reduce((acc,{priceAt})=>
                                                    acc + (priceAt.get(curTime) ?? 0)
                                                    ,0)
                               ),-Infinity);
    return foo;

    return dataBySeller;
}


export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    //const cleanedLines = [ 1,2,3,2024];

    let values = cleanedLines.map(BigInt);

    //console.log(values);

    const priceLists = buildPriceLists(values);

    console.log({priceLists});

    const topPrices = findTopPrices(priceLists);

    //console.log({topPrices})

    const answer = topPrices;

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
