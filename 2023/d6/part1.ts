import { linesFrom } from "../util.ts";
import { range } from '../iter_util.ts';

export const example = `
Time:      7  15   30
Distance:  9  40  200
`.trim();

export type Race = {duration:number, distance:number};

function parseRaces(lines:string[]):Race[] {
    const [times,distances] = lines.map(s=>
                                        s.substring(s.indexOf(':')+1)
                                        .trim()
                                        .split(/\s+/)
                                        .map(Number)
                                       );

    //console.log(times,distances)

    return times.map((duration,i)=>({duration, distance: distances[i]}));
}

// this is just a parabola! it's directly solvable algebraically!
// 'course I only spotted that by rewriting it to graph in WolframAlpha...
// knew it had to be some curve, but wasn't sure if it'd be symetric
// about the maxima...
function findWinningTimes(race:Race):number[] {
    const {distance,duration} = race;
    const options = [...range(1,duration-1)]
                        .map(holdTime=>({
                            duration:holdTime,
                            distance: holdTime * (duration - holdTime)
                        }));

    console.log("race",race,"options",options);

    return options.filter(o=> o.distance > distance).map(o=> o.duration);
}

async function main() {
    const lines = (await linesFrom()).filter(l=>l!='');
    //const lines = example.split('\n');

    const races = parseRaces(lines);

    console.log(races);

    const winners = races.map(r=>findWinningTimes(r));
    console.log(winners);

    const answer = winners.reduce((acc,cur)=>acc*cur.length, 1);
    console.log(answer);
}

if(import.meta.main)
    await main();
