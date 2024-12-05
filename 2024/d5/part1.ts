import { runMain, sum, } from "../util.ts";
import { count, map } from "../iter_util.ts";

export type OrderRule = [before:number,after:number];
export type OrderRuleMap = Map<number,Set<number>>;
export type UpdatePageList = number[];

function parseRule(raw:string) {
    return raw.split("|").map(Number) as OrderRule;
}

function parsePageList(raw:string) {
    return raw.split(",").map(Number) as UpdatePageList;
}

export function parseInput(lines:string[]):{rules:OrderRuleMap, updates:UpdatePageList[]} {
   const rules = [], updates = [];

   for(const line of lines) {
       if(line.indexOf("|") !== -1)
           rules.push(parseRule(line));
       else if(line.indexOf(",") !== -1)
           updates.push(parsePageList(line));
   }

    const rulesMap = rules.reduce((m,[key,val])=>{
        if(m.has(key))
            m.get(key)!.add(val);
        else {
            const s = new Set([val]);
            m.set(key,s);
        }
        return m;
    } ,new Map<number,Set<number>>());

    return {rules: rulesMap, updates};
}

export function checkUpdate(update:UpdatePageList, rules:OrderRuleMap):boolean {
    const seen = new Set<number>();

    for(const page of update) {
        if(rules.has(page) && rules.get(page)!.intersection(seen).size !== 0)
           return false;

       seen.add(page);
    }

    return true;
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim())//.filter(l=>l!='');

    const values = parseInput(lines);

    console.log(values);

    const validUpdates = values.updates.filter(u=>checkUpdate(u,values.rules));

    console.log(validUpdates);

    const middles = validUpdates.map(u=>u[Math.floor(u.length/2)]);

    const answer = sum(middles);

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
