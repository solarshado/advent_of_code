import { runMain, sum, } from "../util.ts";
import { Grid as GenericGrid, parseGrid, findAll, manhattanDistance } from "../grid_util.ts";
import { genPairs } from "../iter_util.ts";
//import { renderGrid } from "../d10/part2.ts";

export type Tile = "." | "#";
export type Grid = GenericGrid<Tile>;

export const findGalaxies = (g:Grid) => findAll(g,"#");

export function expandUniverse(grid:Grid):Grid {
    const galaxyLocs = findAll(grid,"#");

    const [xs,ys] = galaxyLocs.reduce((acc,[x,y])=> (acc[0].add(x), acc[1].add(y), acc),[new Set<number>(),new Set<number>()]);

    const expandedAlongY =
        grid.reduce((acc,cur,y)=> (acc.push(...(ys.has(y) ? [cur] : [cur,cur])), acc) ,[] as Grid);

    const expandedAlongBoth =
        expandedAlongY.map(l=>l.reduce((acc,cur,x)=> (acc.push(...(xs.has(x) ? [cur] : [cur,cur])), acc),[] as Tile[]));

    return expandedAlongBoth;
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const skyMap = parseGrid<Tile>(cleanedLines);

    //console.log(renderGrid(skyMap));

    const expanded = expandUniverse(skyMap);

    //console.log(renderGrid(expanded));

    const galaxyLocs = findGalaxies(expanded);

    //console.log(galaxyLocs,galaxyLocs.length);

    const pairs = [...genPairs(galaxyLocs)]

    //console.log(pairs,pairs.length)

    const answer = sum(pairs ,([l,r])=>manhattanDistance(l,r));

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
