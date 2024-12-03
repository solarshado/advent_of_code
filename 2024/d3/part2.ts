import { runMain, sum, } from "../util.ts";
import { count, map } from "../iter_util.ts";
import { Mul } from './part1.ts';

function findMuls(input:string):Mul[] {
    const mulRegex = /mul\((\d+),(\d+)\)|(do(n't)?\(\))/g;

    const retVal = [];
    let enabled = true;

    while(true) {
        const match = mulRegex.exec(input);

        if(!match)
            return retVal;

        //console.log(match);

        const [_,l,r,toggle,not] = Array.from(match);

        //console.log(!!toggle, !not);

        // it's something stupid isn't it?
        // but *what*...
        // PRESERVE STATE ACCROSS LINES!

        let log = "got '"+_+"', enabled = "+ enabled+"; ";

        if(toggle !== undefined) {
            const newEnabled = not !== "n't";
            log += `newEnabled = ${newEnabled}`;
            enabled =  newEnabled;
        }
        else if(enabled) {
            log += `appending Mul(${[l,r]}`;
            retVal.push([l,r].map(Number) as [number,number]);
        }

        console.log(log);
    }
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const muls = findMuls(cleanedLines.join());

    console.log(muls);

    const answer = sum(muls.map(([l,r])=>l*r));

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
