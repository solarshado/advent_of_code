import { runMain, } from "../util.ts";
import * as gu from "../grid_util.ts";

export type Tile = "#"|"."|"S"|"E";
export type Grid = gu.Grid<Tile>;

/// pathfinding time... A*, Disjykra's (mispelled that probably) ... I froget the difference
// gonna need a priority queue to do it right though

export class ProprityQueue<T> {
    #inner = new Map<number,T[]>();

    #prioCache:number[] = [];

    add(prio:number, val:T) {
        if(!this.#inner.has(prio)) {
            this.#inner.set(prio,[]);

            this.#prioCache.push(prio);
            this.#prioCache.sort((l,r)=>l-r);
        }

        this.#inner.get(prio)!.push(val);
    }

    #getGroup(at:number):T[] {
        const g = this.#inner.get(this.#prioCache.at(at)!)!;
        if(g.length !== 0)
            return g;

        this.#prioCache = this.#prioCache.filter(p=>this.#inner.get(p)?.length ?? 0 > 0);
        return this.#inner.get(this.#prioCache.at(at)!) ?? [];
    }

    getLowest(peekOnly=false):T|undefined {
        const group = this.#getGroup(0)
        return peekOnly ? group[0] : group.shift();
    }

    getHighest(peekOnly=false):T|undefined {
        const group = this.#getGroup(-1)
        return peekOnly ? group[0] : group.shift();
    }
}

export type NavState<TLoc=gu.Point> = {
    loc:TLoc,
    facing:gu.Direction,
    totalCost:number,
}

export type Move = {
    action:"F", cost:1,
} | {
    action:"R"|"L", cost:1000,
};

export const MOVES = {
    F:{ action:"F", cost:1, },
    L:{ action:"L", cost:1000, },
    R:{ action:"R", cost:1000, },
    *[Symbol.iterator]() {
        yield this.F; yield this.L; yield this.R;
    }
} as const;

export const TurnLookup = {
    U: {L: "L",R: "R"},
    D: {L: "R",R: "L"},
    L: {L: "D",R: "U"},
    R: {L: "U",R: "D"},
} as const;

export function withMoveApplied({loc,facing,totalCost}:NavState, {action, cost}:Move):NavState {
    return {
        loc: action === "F" ? gu.getPointMultiton(gu.addPoints(loc, gu.directionMap[facing] )) : loc,
        facing: action === "F" ? facing : TurnLookup[facing][action],
        totalCost: totalCost + cost
    };
}

export function getPossileNextStates(grid:Grid, state:NavState):NavState[] {
    return [
        [MOVES.F],
        [MOVES.L,MOVES.F],
        [MOVES.R,MOVES.F],
    ]
    .map(moveList=>moveList.reduce(withMoveApplied,state))
    .filter(({loc})=>gu.getTileFrom(loc,grid) !== "#");
}

export function findCheapestPath(maze:Grid, start:gu.Point, goal:gu.Point):number {
    const queue = new ProprityQueue<NavState>();

    ///// can't simply min(cost), that would prune turns before we can make them
    const cheapestSeen = new Map<gu.Point,number>();

    function enqueue(state:NavState) {
        const seen = cheapestSeen.get(state.loc) ?? NaN;
        if(seen < (state.totalCost + 1000))
            return;

        if(seen > state.totalCost || isNaN(seen))
            cheapestSeen.set(state.loc,state.totalCost);

        queue.add(state.totalCost,state);
    }

    enqueue({loc: start, facing: "R", totalCost:0});

    while(true) {
        const cur = queue.getLowest()!;

        if(gu.pointsEqual(cur.loc,goal))
            return cur.totalCost;

        for(const next of getPossileNextStates(maze,cur))
            enqueue(next);
    }
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const maze = gu.parseGrid<Tile>(cleanedLines);

    const startLoc = gu.findAll(maze,"S")[0];
    const destLoc = gu.findAll(maze,"E")[0];

    const answer = findCheapestPath(maze,startLoc,destLoc);

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
