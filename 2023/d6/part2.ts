import { linesFrom } from "../util.ts";
import { range, map, filter, count } from '../iter_util.ts';
import { Race, example } from './part1.ts';

function parseRace(lines:string[]):Race {
    const [time,distance] = lines.map(s=>
                                        +
                                        s.substring(s.indexOf(':')+1)
                                        .replaceAll(/\s+/g,"")
                                       );

    //console.log(time,distance)

    return {duration: time, distance}
}

function findWinningTimes(race:Race):IterableIterator<number> {
    const {distance,duration} = race;
    const times = range(1,duration-1)
    const options = map(holdTime=>({
                            duration: holdTime,
                            distance: holdTime * (duration - holdTime)
                        }),
                        times
                       );
    const winners = filter(o=> o.distance > distance, options);

    return map(o=> o.duration, winners);
}

async function main() {
    const lines = (await linesFrom()).filter(l=>l!='');
    //const lines = example.split('\n');

    const race = parseRace(lines);

    console.log(race);

    const winners = findWinningTimes(race);
    //console.log([...winners]);

    const answer = count(winners)
    console.log(answer);
}

if(import.meta.main)
    await main();
