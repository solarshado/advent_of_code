import { runMain, sum, } from "../util.ts";
import { parseInput, checkUpdate, UpdatePageList, OrderRuleMap, } from './part1.ts';

function fixUpdate(update:UpdatePageList, rules:OrderRuleMap):UpdatePageList {
    return update.toSorted((l,r)=>
                           !rules.has(l) ? 0 :
                               rules.get(l)!.has(r) ? -1 :
                               1
                          );
}

export async function main(lines:string[]) {
    const values = parseInput(lines);

    const invalidUpdates = values.updates.filter(u=>!checkUpdate(u,values.rules));

    //console.log(invalidUpdates);

    const fixedUpdates = invalidUpdates.map(u=>fixUpdate(u,values.rules));

    //console.log(fixedUpdates);

    const middles = fixedUpdates.map(u=>u[Math.floor(u.length/2)]);

    const answer = sum(middles);

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
