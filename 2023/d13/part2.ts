import { arraysEqual, runMain, sum, } from "../util.ts";
import { count, map } from "../iter_util.ts";
import { column, maxX, maxY, parseGrid, renderGrid } from "../grid_util.ts";
import { Tile, Grid, Mirror, transpose, } from './part1.ts';

function arrayEqualErrors<T>(l:T[], r:T[]):number {
    return l.length == r.length ?
        l.reduce((acc,curL,i)=> acc + (curL === r[i] ? 0 : 1), 0) :
        Math.max(l.length,r.length)
}

type SmudgedMirror = Mirror & {errors:number};

function findMirror(pattern:Grid):SmudgedMirror[] {

    const horiz = search(pattern);
    const vert = search(transpose(pattern)).map(m=>({...m, orientation: "V" as const}));

    return [...horiz, ...vert];

    function search(pattern:Grid, maxErrors = 1) {
        console.log("findMirror, searching","\n"+renderGrid(pattern));
        const mirrors:SmudgedMirror[] = [];

        const mY = maxY(pattern)

        for(let y = 1; y < mY; ++y) {
            const cur = pattern[y];
            const last = pattern[y-1];

            const initErrors = arrayEqualErrors(cur,last);

            if(initErrors <= maxErrors) {
                let errors = initErrors;

                const range = Math.min(y, mY-y);
                console.log("findMirror; checking y",y,"range",range);

                for(let delta = 1; delta < range; ++delta){
                    const next = pattern[y+delta];
                    const prev = pattern[(y-1)-delta];

                    console.log("findMirror; checking delta",delta,"\n+1",next.join(""),"\n-1",prev.join(""))

                    errors += arrayEqualErrors(next,prev)

                    if(errors > maxErrors) break;
                }

                console.log("total errors", errors);
                if(errors <= maxErrors)
                    mirrors.push({
                        orientation: "H",
                        position: y,
                        errors
                    });
            }
        }
        return mirrors;
    }
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim());

    const patterns = cleanedLines.reduce((acc,cur)=> {
        const isBlank = cur == '';

        if(isBlank)
            acc.push([]);
        else
            acc.at(-1)!.push(cur);

        return acc
    }, [[]] as string[][]).filter(p=>p.length!==0);

    console.log(patterns);

    /*
    for(const p of patterns.map((p)=>parseGrid<Tile>(p))) {
        const tr = transpose(p);
        console.log("P\n"+renderGrid(p)+"\n v v v\n"+renderGrid(tr));
    }
    return;
    */

    const mirrors = patterns.map(p=>findMirror(parseGrid(p)));

    console.log(mirrors);

    const answer =
        mirrors.flat()
        .filter(m=>m.errors === 1)
        .reduce((acc,{orientation,position})=> acc + position * (orientation == "H" ? 100 : 1) ,0)

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
