import { runMain, } from "../util.ts";
import * as gu from "../grid_util.ts";
import { Grid, Tile, turnRight, countSteps } from './part1.ts';

function countPossibleLoops(grid:Grid, start:gu.Point) {

    function doesLoop(extraObstacle:gu.Point) {
        let direction = "U" as gu.Direction;

        let curPos = start;

        type Step = {curPos:gu.Point, direction:gu.Direction};

        const path = {
            _set: new Set<string>(),
            _keyFunc: ({curPos:[x,y],direction}:Step)=>
            ""+x+","+y+direction,

            add(step:Step) {
                this._set.add(this._keyFunc(step))
            },
            has(step:Step) {
                return this._set.has(this._keyFunc(step));
            },
        }
        path.add({curPos, direction});

        while(true) {
            let ahead = gu.addPoints(curPos,gu.directionMap[direction]);

            if(!gu.isPointOnGrid(ahead, grid))
                return false;


            while(gu.getTileFrom(ahead,grid) === "#" || gu.pointsEqual(ahead, extraObstacle)) {
                direction = turnRight(direction);
                ahead = gu.addPoints(curPos,gu.directionMap[direction]);
            }

            curPos = ahead;

            if(path.has({curPos,direction}))
                return true;

            path.add({curPos, direction});
        }
    }

    // obvious-in-hindsight optimization mentioned on reddit
    //const possibleObstacles = gu.findAll(grid,".");
    const possibleObstacles = [...countSteps(grid,start)];

    return possibleObstacles.reduce(
        (acc,cur)=> doesLoop(cur) ? acc + 1 : acc
    ,0);
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const map = gu.parseGrid<Tile>(cleanedLines);

    const start = gu.findAll(map,"^")[0];

    const answer = countPossibleLoops(map,start);

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
