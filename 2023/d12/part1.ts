import { runMain, sum, } from "../util.ts";
import { count, map, filter, reduce } from "../iter_util.ts";

type Tile="#"|"."|"?";

export type PuzzleLine = {
    record:Tile[],
    groups:number[],
};

export function parsePuzzleLine(raw:string):PuzzleLine {
    const [r,g] = raw.split(" ");
    const record = r.split("") as Tile[];
    const groups = g.split(",").map(Number);
    return {record, groups};
}

export function* getCandidates(sequence:Tile[]):IterableIterator<Tile[]> {
    const unknowns = sequence.reduce((acc,cur,i)=> cur === "?" ? (acc.push(i), acc) : acc, [] as number[])

    const bitMax = (2**unknowns.length) - 1

    // so gross... but fast to write
    const getBits = (n:number)=> n.toString(2).padStart(unknowns.length,"0").split("").map(d=> d === "1");

    console.log("unknowns", unknowns, "bits.len", getBits(bitMax).length);

    const reify = (bits:ReturnType<typeof getBits>)=> {
        const ret = [...sequence];

        bits.forEach((b,i)=>ret[unknowns[i]] = b ? "#" : ".");

        return ret;
    };

    for(let i = 0; i <= bitMax; ++i)
    {
        const curBits = getBits(i);
        const re = reify(curBits);
        //console.log("candidate",curBits,re.join(""));
        yield re;
    }
}

export function countPossibleSolutions({groups,record}:PuzzleLine):number {

    const matcherStr = groups.map(n=>"#{"+n+"}").reduce((acc,cur)=>acc+"\\.+"+cur);
    const matcher = new RegExp("^\\.*"+matcherStr+"\\.*$");

    //console.log("genMatcher",groups,matcher);

    const candidates = getCandidates(record);
    //console.log("candidates",[...getCandidates(record)]);

    const filtered =
    //    [...
            filter(candidates, (c)=>matcher.test( c.join("") ))
    //    ]
    ;

    //console.log("filtered",filtered);

    return count(filtered);
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const puzzles = cleanedLines.map(parsePuzzleLine);

//    console.log(puzzles);

    const solutions = puzzles
                        //.slice(1,2)
                        .map(countPossibleSolutions);

    //console.log("solutions",solutions);
    const answer = sum(solutions);

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
