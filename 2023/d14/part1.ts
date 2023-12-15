import { runMain, splitArray, joinArrays, } from "../util.ts";
import { pipe } from "../func_util.ts";
import { Grid as AbstractGrid, parseGrid, renderGrid, transpose, } from "../grid_util.ts"

export type Tile = "."|"O"|"#";
export type Grid = AbstractGrid<Tile>;

export function rollStonesNorth(input:Grid):Grid {
    function rollToEnd(line:Tile[]):Tile[] {
        const sep = "#";
        return pipe(line,
            (l)=>splitArray(l,sep)
                .map(segment=>segment.sort((a,b)=> a === "O" ? -1 : 0)),
            (a)=>joinArrays(a,sep)
       );
    }

    return pipe(input,
                transpose,
                (g)=>g.map(rollToEnd),
                transpose);
}

export function calcTotalLoad(grid:Grid):number {
    const len = grid.length;
    return grid.
        map(l=>l.reduce((acc,cur)=>cur == "O" ? acc+1 : acc,0)).
        reduce((acc,cur,i)=> acc+(cur*(len-i)),0);
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const grid = parseGrid<Tile>(cleanedLines);

    console.log(renderGrid(grid));

    console.log(" v v v");

    const rolled = rollStonesNorth(grid);

    console.log(renderGrid(rolled));

    const answer = calcTotalLoad(rolled)

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
