import { runMain, } from "../util.ts";
import { concat, } from "../iter_util.ts";
import * as gu from "../grid_util.ts";
import { MOVES, ProprityQueue, } from './part1.ts';
import * as p1 from './part1.ts';

type NavState = p1.NavState & {
    seen: Set<gu.Point>
}

function withMoveApplied({loc,facing,totalCost,seen}:NavState, {action, cost}:p1.Move):NavState {
    const aheadLoc = gu.getPointMultiton(gu.addPoints(loc, gu.directionMap[facing]));
    return {
        loc: action === "F" ? gu.getPointMultiton(gu.addPoints(loc, gu.directionMap[facing] )) : loc,
        facing: action === "F" ? facing : p1.TurnLookup[facing][action],
        totalCost: totalCost + cost,
        seen: new Set(concat(seen, action === "F" ? [aheadLoc] : []))
    };
}

function getPossileNextStates(grid:p1.Grid, state:NavState):NavState[] {
    return [
        [MOVES.F],
        [MOVES.L,MOVES.F],
        [MOVES.R,MOVES.F],
    ]
    .map(moveList=>moveList.reduce(withMoveApplied,state))
    .filter(({loc})=>
            (!state.seen.has(loc)) &&
            gu.getTileFrom(loc,grid) !== "#");
}

function countTilesAlongPathOfCost(maze:p1.Grid, start:gu.Point, goal:gu.Point, cheapestPathCost:number) {
    const queue = new ProprityQueue<NavState>();

    ///// can't simply min(cost), that would prune turns before we can make them
    const cheapestSeen = new Map<gu.Point,number>();

    function enqueue(state:NavState) {
        const seen = cheapestSeen.get(state.loc) ?? NaN;
        if(seen < (state.totalCost - 1000))
            return;

        if(seen > state.totalCost || isNaN(seen))
            cheapestSeen.set(state.loc,state.totalCost);

        queue.add(state.totalCost,state);
    }

    enqueue({loc: start, facing: "R", totalCost:0, seen: new Set([start])});

    const winners = [];

    while(true) {
        const cur = queue.getLowest();

        if(!cur) break;

        if(gu.pointsEqual(cur.loc,goal) && cur.totalCost == cheapestPathCost)
            winners.push(cur.seen);

        for(const next of getPossileNextStates(maze,cur).filter(({totalCost})=>totalCost <= cheapestPathCost))
            enqueue(next);
    }

    //console.log({winners});

    const allWinners = winners.reduce((l,r)=>l.union(r));

    console.log(gu.renderPoints(maze,allWinners,"O"));

    return allWinners.size;
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const maze = gu.parseGrid<p1.Tile>(cleanedLines);

    const startLoc = gu.findAll(maze,"S")[0];
    const destLoc = gu.findAll(maze,"E")[0];

    const cheapestPathCost = p1.findCheapestPath(maze,startLoc,destLoc);

    console.log({cheapestPathCost});

    const answer = countTilesAlongPathOfCost(maze,startLoc,destLoc,cheapestPathCost);

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
