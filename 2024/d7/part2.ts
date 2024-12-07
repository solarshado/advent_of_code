import { runMain, sum, } from "../util.ts";
import * as p1 from './part1.ts';

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const equations = cleanedLines.map(p1.parseEquation);

    //console.log(equations);

    const combiners = [...p1.DEFAULT_COMBINERS, ((l,r)=>Number(l+""+r)) as p1.Combiner];

    const answer = sum(equations.filter(e=>p1.isSolvable(e,combiners)), e=>e.goal);

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
