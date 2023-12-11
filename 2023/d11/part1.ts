import { runMain, sum, } from "../util.ts";
import { count, } from "../iter_util.ts";
import { map, } from "../iter_util2.ts";
import { renderGrid } from "../d10/part2.ts";

export type Point = [x:number,y:number];
export type Tile = "." | "#";
export type _Grid<T> = T[][];
export type Grid = _Grid<Tile>;

export function parseMap(lines:string[]):Grid {
    return lines.map(l=>l.split("") as Tile[]);
}

export function find(grid:Grid, tile:Tile = "#"):Point[] {
    return grid.flatMap((line, y) =>
                        line.reduce((acc, cur, x) => cur == tile ? (acc.push([x, y]), acc) : acc, [] as Point[])
    );
}

export function expandUniverse(grid:Grid):Grid {
    const galaxyLocs = find(grid,"#");

    const [xs,ys] = galaxyLocs.reduce((acc,[x,y])=> (acc[0].add(x), acc[1].add(y), acc),[new Set<number>(),new Set<number>()]);

    const expandedAlongY =
        grid.reduce((acc,cur,y)=> (acc.push(...(ys.has(y) ? [cur] : [cur,cur])), acc) ,[] as Grid);

    const expandedAlongBoth =
        expandedAlongY.map(l=>l.reduce((acc,cur,x)=> (acc.push(...(xs.has(x) ? [cur] : [cur,cur])), acc),[] as Tile[]));

    return expandedAlongBoth;
}

export function* genPairs<T>(list:T[]):IterableIterator<[T,T]> {
    const len = list.length;

    for(let l = 0 ; l < len - 1; ++l)
        for(let r = l ; r < len; ++r)
            yield [list[l],list[r]];
}

export function manhattanDistance(l:Point, r:Point):number {
    const [lx,ly] = l;
    const [rx,ry] = r;
    const dist = Math.abs(lx-rx) + Math.abs(ly-ry);
    //console.log("distance",l,r,dist);
    return dist;
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const skyMap = parseMap(cleanedLines);

    //console.log(renderGrid(skyMap));

    const expanded = expandUniverse(skyMap);

    console.log(renderGrid(expanded));

    const galaxyLocs = find(expanded);

    console.log(galaxyLocs,galaxyLocs.length);

    const pairs = [...genPairs(galaxyLocs)]

    console.log(pairs,pairs.length)

    const answer = sum(pairs ,([l,r]:Point[])=>manhattanDistance(l,r));

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
