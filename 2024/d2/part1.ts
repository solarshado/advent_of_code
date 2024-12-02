import { runMain, sum, } from "../util.ts";
import { count, map, pairwise, reduce,} from "../iter_util.ts";
import { pipe } from "../func_util.ts";

function parseReport(report:string) {
    return report.split(' ').map(Number);
}

function isReportSafe(report:number[]) {
    const deltas = [...map(pairwise(report),([l,r])=>l-r)];

    console.log(deltas);

    const sign = Math.sign(deltas[0]);

    return deltas.every(d=> Math.sign(d) === sign && (d=Math.abs(d), d > 0 && d < 4));
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const values = cleanedLines.map(parseReport);

    console.log(values);

    const safe = values.map(isReportSafe);

    console.log(safe);

    const answer = sum(safe,b=>+b);

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
