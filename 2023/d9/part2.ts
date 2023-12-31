import { runMain, sum } from "../util.ts";
import { buildDifferences } from './part1.ts';

function predictNext(differences:number[][]):number {
    const chopped = differences.map((ary)=>ary[0]);
    
    const prediction = chopped.reduceRight((acc,cur)=>cur-acc,0)
    //const prediction = sum(chopped);

    return prediction;
}

export async function main(lines:string[]) {
    const differences = lines.filter(l=>l!='').map(l=>buildDifferences(l.trim().split(/\s+/).map(v=>+v)));

    console.log(differences);
    
    const predictions = differences.map(d=>predictNext(d));

    console.log(predictions);

    const answer = sum(predictions)

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
