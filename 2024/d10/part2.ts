import { runMain, sum, } from "../util.ts";
import * as gu from "../grid_util.ts";
import { Grid, Tile } from './part1.ts';

export function rateTrailhead(map:Grid, trailhead:gu.Point):number {

    const toVisit = [trailhead];
    let score = 0

    while(true) {
        if(toVisit.length === 0)
            break;

        const cur = toVisit.shift()!;
        const curHeight = gu.getTileFrom(cur,map);

        if(curHeight === 9) {
            score++;
            continue;
        }

        const nexts = gu.getNeighborhood(map,cur).filter(
            n=> (n[0] === cur[0] || n[1] === cur[1]) &&
            gu.getTileFrom(n,map) === curHeight+1);

        toVisit.push(...nexts);
    }

    return score;
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const map = gu.parseGrid<Tile>(cleanedLines, s=>(+s) as Tile);

    const trailheads = gu.findAll(map,0);

    const scores = trailheads.map(th=>({th, score: rateTrailhead(map,th)}));

    console.log(scores);

    const answer = sum(scores, s=>s.score);

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
