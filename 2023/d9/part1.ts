import { runMain, sum } from "../util.ts";
import { map } from "../iter_util.ts";

export function allZero(ary:number[]) {
    return ary.every(v=>v===0);
}

export function* pairWise(src:number[]){
    const len = src.length;
    for(let i = 0 ; i < len - 1; ++i){
        const a = src[i], b = src[i+1];
        yield [a,b]
    }
}

export function buildDifferences(values:number[]):number[][] {
    const retVal = [values];

    do {
        const cur = retVal.at(-1)!;

        const next = [...map(pairWise(cur), ([l,r])=> r-l)];

        retVal.push(next);
    } while(!allZero(retVal.at(-1)!));

    return retVal;
}

function predictNext(differences:number[][]):number {
    const chopped = differences.map((ary)=>ary.at(-1)!);

    //const prediction = chopped.reduceRight((acc,cur)=>acc+cur,0)
    const prediction = sum(chopped);

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
