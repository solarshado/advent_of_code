import { runMain, sum, } from "../util.ts";
import { count, map } from "../iter_util.ts";
import { memozie, pipe, } from '../func_util.ts';
import * as gu from "../grid_util.ts";

export type Tile = 0|1|2|3|4|5|6|7|8|9;

export type Grid = gu.Grid<Tile>;

export function rateTrailhead(map:Grid, trailhead:gu.Point):number {

    const toVisit = [trailhead];
    const nines = new Set<gu.Point>();

    const log =
        //trailhead[0] === 2 ?
        //(...v:object[])=> console.log(...v):
        (..._:object[])=>void(0);

    log({trailhead, toVisit});

    /// wat? closer, but still wrong; how?
    while(true) {
        if(toVisit.length === 0)
            break;

        const cur = toVisit.shift()!;
        const curHeight = gu.getTileFrom(cur,map);

        log({cur,curHeight});

        if(curHeight === 9) {
            nines.add(gu.getPointMultiton(...cur));
            log({nines});
            continue;
        }

        const nexts = gu.getNeighborhood(map,cur).filter(
            n=> (n[0] === cur[0] || n[1] === cur[1]) &&
            gu.getTileFrom(n,map) === curHeight+1);

        toVisit.push(...nexts);
        log({nexts, toVisit});
    }
    log({nines});

    return nines.size;
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    /// types may be wrong?
    const strMap = gu.parseGrid<Tile>(cleanedLines);
    const map = strMap.map(col=>col.map(Number)) as Grid;

    const trailheads = gu.findAll(map,0);

    const scores = trailheads.map(th=>({th, score: rateTrailhead(map,th)}));

    console.log(scores);

    const answer = sum(scores, s=>s.score);

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
