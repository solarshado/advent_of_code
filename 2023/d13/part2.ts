import { countDifferingElements, runMain, } from "../util.ts";
import { maxY, parseGrid, renderGrid, transpose } from "../grid_util.ts";
import { Grid, Mirror, } from './part1.ts';

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

            const initErrors = countDifferingElements(cur,last);

            if(initErrors <= maxErrors) {
                let errors = initErrors;

                const range = Math.min(y, mY-y);
                console.log("findMirror; checking y",y,"range",range);

                for(let delta = 1; delta < range; ++delta){
                    const next = pattern[y+delta];
                    const prev = pattern[(y-1)-delta];

                    console.log("findMirror; checking delta",delta,"\n+1",next.join(""),"\n-1",prev.join(""))

                    errors += countDifferingElements(next,prev)

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
