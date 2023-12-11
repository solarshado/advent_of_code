import { runMain, sum, } from "../util.ts";
import { count } from "../iter_util.ts";
import { map } from "../iter_util2.ts";
import { Grid, Point, Tile, find, genPairs, manhattanDistance, parseMap } from './part1.ts';
import { renderGrid, renderPoints } from "../d10/part2.ts";

function column(grid:Grid, x:number) {
    return grid.map(line=>line[x]);
}

function isEmpty(tiles:Tile[]) {
    return !tiles.some(t=>t=="#");
}

function expandUniverse(grid:Grid, galaxies:Point[], amount=999_999):Point[] {
    //const keyFunc = ([x,y]:Point) => x+","+y;
    //const gals = new Map(galaxies.map(g=>[keyFunc(g),g]))

    const emptyRows = grid.reduce((acc,cur,i)=> (isEmpty(cur) ? acc.push(i) : void 0 ,acc),[] as number[]);
    const emptyColumns = grid[0].reduce((acc,_,i)=> (isEmpty(column(grid,i)) ? acc.push(i) : void 0 ,acc),[] as number[]);

    {
        const grid_r = renderGrid(grid);

        const grid_e_r = renderGrid(
            grid.map((l,y)=> l.map((c,x)=>
                emptyRows.includes(y) || 
                    emptyColumns .includes(x) ? "+" : c

            ))
        );

        console.log(grid_r+ "\n\n"+ grid_e_r);
    }

    return galaxies.map(([x,y])=> {
        const newX = x + (emptyColumns.filter(c=>c < x).length * amount);
        const newY = y + (emptyRows.filter(c=>c < y).length * amount);

        return [newX,newY];
    });
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const skyMap = parseMap(cleanedLines);

    //console.log(renderGrid(skyMap));

    const galaxyLocs = find(skyMap);
    console.log(galaxyLocs,galaxyLocs.length);
    const expandedLocs = expandUniverse(skyMap, galaxyLocs);

    //console.log(renderGrid(expanded));

    const pairs = [...genPairs(expandedLocs)]

    //console.log(pairs,pairs.length)

    const answer = sum(pairs ,([l,r]:Point[])=>manhattanDistance(l,r));

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
