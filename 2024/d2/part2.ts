import { runMain, sum, } from "../util.ts";
import { map, pairwise } from "../iter_util.ts";
import { parseReport } from './part1.ts';

function isReportSafe(report:number[], canRecurse=false):boolean {
    const deltas = [...map(pairwise(report),([l,r])=>l-r)];

    console.log(deltas);

    const sign = Math.sign(deltas[0]);

    // dear god this is gross... works just fine though ¯\_(ツ)_/¯
    // on second thought, it's beautiful... lmao
    return deltas.every(d=> Math.sign(d) === sign && (d=Math.abs(d), d > 0 && d < 4))
        || (canRecurse && report.map(
            (_,i)=>report.filter((__,j)=>j!==i)
        ).some(r=>isReportSafe(r)) )
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const values = cleanedLines.map(parseReport);

    console.log(values);

    const safe = values.map(r=>isReportSafe(r,true));

    console.log(safe);

    const answer = sum(safe,b=>+b);

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
