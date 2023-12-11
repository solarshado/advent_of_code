import { runMain, sum, } from "../util.ts";
import { genPairs } from "../iter_util.ts";
import { Point, column, manhattanDistance, parseGrid } from "../grid_util.ts";
import { Grid, Tile, findGalaxies, } from './part1.ts';
//import { renderGrid, } from "../d10/part2.ts";

function isEmpty(tiles:Tile[]) {
    return !tiles.some(t=>t=="#");
}

function expandUniverse(grid:Grid, galaxies:Point[], amount=999_999):Point[] {
    const emptyRows = grid.reduce((acc,cur,i)=> (isEmpty(cur) ? acc.push(i) : void 0 ,acc),[] as number[]);
    const emptyColumns = grid[0].reduce((acc,_,i)=> (isEmpty(column(grid,i)) ? acc.push(i) : void 0 ,acc),[] as number[]);

    return galaxies.map(([x,y])=> {
        const newX = x + (emptyColumns.filter(c=>c < x).length * amount);
        const newY = y + (emptyRows.filter(c=>c < y).length * amount);

        return [newX,newY];
    });
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const skyMap = parseGrid<Tile>(cleanedLines);

    const galaxyLocs = findGalaxies(skyMap);

    const expandedLocs = expandUniverse(skyMap, galaxyLocs);

    const pairs = [...genPairs(expandedLocs)]

    const answer = sum(pairs ,([l,r])=>manhattanDistance(l,r));

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
