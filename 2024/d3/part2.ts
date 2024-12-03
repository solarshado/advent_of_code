import { runMain, sum, } from "../util.ts";
import { Mul } from './part1.ts';

function findMuls(input:string):Mul[] {
    const mulRegex = /mul\((\d+),(\d+)\)|(do(n't)?\(\))/g;

    const retVal = [];
    let enabled = true;

    while(true) {
        const match = mulRegex.exec(input);

        if(!match)
            return retVal;

        const [_,l,r,toggle,not] = Array.from(match);

        if(toggle !== undefined)
            enabled = not !== "n't";
        else if(enabled)
            retVal.push([l,r].map(Number) as [number,number]);
    }
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    // preserve do/n't state accross lines!
    const muls = findMuls(cleanedLines.join());

    console.log(muls);

    const answer = sum(muls.map(([l,r])=>l*r));

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
