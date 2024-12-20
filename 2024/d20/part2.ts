import { runMain, } from "../util.ts";
import { filter, genPairs, map, toArray } from "../iter_util.ts";
import { pipe, } from '../func_util.ts';
import * as gu from "../grid_util.ts";
import { Tile, Grid, CostMap, CheatPath, buildCostMap } from './part1.ts';

const MAX_SHORTCUT_LENGTH = 20;

//const MIN_SHORTCUT_SAVINGS = 50; // example
const MIN_SHORTCUT_SAVINGS = 100; // full

function findShortcuts( costMap:CostMap):CheatPath[] {

    const pairs = pipe(
        genPairs([...costMap.entries()]),
        ps=>map(ps, ([[start,sCost],[end,eCost]])=>({
            start, end,
            startEndCostDelta: Math.abs(sCost - eCost),
            length: gu.manhattanDistance(start,end),
        })),
        ps=>map(ps,p=>({
            ...p,
            saving: p.startEndCostDelta - p.length,
        })),
        ps=>filter(ps, ({length,saving})=>
                   saving >= MIN_SHORTCUT_SAVINGS &&
                   length <= MAX_SHORTCUT_LENGTH // interesting... < worked for example, but <= is needed for the full input
                  ),
        toArray
    );

    return pairs;
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const track = gu.parseGrid<Tile>(cleanedLines);

    const startLoc = gu.findAll(track,"S")[0];
    const endLoc = gu.findAll(track,"E")[0];

    gu.setTile(track, startLoc, ".");
    gu.setTile(track, endLoc, ".");

    console.log(gu.renderGrid(track));

    const costMap = buildCostMap(track, startLoc);

    const shortcuts = findShortcuts( costMap);

    console.log(shortcuts);

    //const aggregated = shortcuts.reduce((acc,cur)=>(
    //                                    acc[cur.saving] = (acc[cur.saving] ?? 0) + 1,
    //                                        acc)
    //                                    ,{} as { [key:number]:number });
    //
    //console.log(aggregated);
    //
    //const answer = Object.entries(aggregated).reduce(
    //    (acc,[saved,shortcutCount])=> Number(saved) >= MIN_SHORTCUT_SAVINGS ? acc + shortcutCount : acc,0);

    const answer = shortcuts.length;

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
