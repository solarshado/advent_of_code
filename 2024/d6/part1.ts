import { runMain, sum, } from "../util.ts";
import { count, map } from "../iter_util.ts";
import * as gu from "../grid_util.ts";

export type Tile = "." | "#" | "^";
export type Grid = gu.Grid<Tile>;

function turnRight(d:gu.Direction):gu.Direction {
    switch(d) {
        case "D":
            return "L";
        case "U":
            return "R";
        case "L":
            return "U";
        case "R":
            return "D";
        default:
            throw "bad Direction";
    }
}

function countSteps(grid:Grid, start:gu.Point) {
    let direction = "U" as gu.Direction;

    let curPos = start;
    const seen = new Set<gu.Point>();
    seen.add(gu.getPointMultiton(...curPos));

    while(true) {
        let ahead = gu.addPoints(curPos,gu.directionMap[direction]);

        if(!gu.isPointOnGrid(ahead, grid)){
            //console.log(seen)
            return seen;
        }
        
        while(gu.getTileFrom(ahead,grid) === "#") {
            direction = turnRight(direction);
            ahead = gu.addPoints(curPos,gu.directionMap[direction]);
        }

        curPos = ahead;
        seen.add(gu.getPointMultiton(...curPos));
    }
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const map = gu.parseGrid<Tile>(cleanedLines);

    const start = gu.findAll(map,"^")[0];

    const answer = countSteps(map, start);

    console.log(answer);
    console.log(answer.size);
}

if(import.meta.main)
    await runMain(main);
