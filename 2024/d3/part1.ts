import { runMain, sum, } from "../util.ts";
import { count, map } from "../iter_util.ts";

type Mul = [fir:number,sec:number];

function findMuls(input:string):Mul[] {
    const mulRegex = /mul\((\d+),(\d+)\)/g;

    const retVal = [];

    while(true) {
        const match = mulRegex.exec(input);

        if(!match)
            return retVal;

        const [_,l,r] = Array.from(match).map(Number);

        retVal.push([l,r] as [number,number]);
    }
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const muls = cleanedLines.map(findMuls).flat();

    console.log(muls);

    const answer = sum(muls.map(([l,r])=>l*r));

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
