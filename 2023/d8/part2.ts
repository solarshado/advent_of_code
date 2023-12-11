import { runMain, } from "../util.ts";
import { filter, count, reduce } from "../iter_util.ts";
import { } from './part1.ts';

type Node = {
    name:string,
    L:string,
    R:string,
};

function parseMap(lines:string[]):Map<string,Node> {
    const nameMap = new Map<string,Node>();

    const nodes1 = lines.map((line)=> {
        console.log(line)
        const [_,name,L,R] = Array.from(/(\w{3}) = \((\w{3})\, (\w{3})\)/.exec(line)!.values())
        const node = { name, L,R }
        nameMap.set(name,node);
        return node;
    });

    console.log(nodes1);

    return nameMap;
}

// infeasible solution for full problem: answer is far *far* too high
function countSteps(directions:IterableIterator<string>, map:Map<string,Node>, endCondition:(n:Node)=>boolean):number|never {
    let steps = 0;
    let here: Node[] = [...filter( map.values(), n=> n.name.endsWith("A"))]
    console.log("num start points:",here.length);
    for(const step of directions) {
        const dir = step as keyof Node;

        //console.log("visiting",here);
        if(here.every(endCondition))
            break;

        here = here.map(h=>
                        map.get(h[dir])!
                       );
        //console.log("going",dir,"to",here)

        //prompt("continue?");
        steps++;

        if(steps % 100 == 0)
            console.log("took step",steps);
    }

    return steps;
}

function countSteps2(directions:()=>LoopIterator, map:Map<string,Node>, endCondition:(n:Node)=>boolean):number|never {
    let starts: Node[] = [...filter( map.values(), n=> n.name.endsWith("A"))]
    console.log("num start points:",starts.length);

    const maxSteps = map.size * directions.length;

    const endsByPath = starts.map(s=> {
        const endPoints = new Set<number>();
        const seen = new Set<string>();
        const mkSeen = (node:Node,dir:string,idx:number)=>node.name+';'+dir+idx;
        let cur = s;
        let steps = 0;
        for(const [step_idx,step] of directions()) {
            const key = mkSeen(cur,step,step_idx);
            //console.log("from start",s,"visiting",key);
            if(seen.has(key))
                break;
            seen.add(key);

            if(endCondition(cur))
                endPoints.add(steps)

            cur = map.get(cur[step as keyof Node])!;
            steps++;

            if(steps > maxSteps) {
                console.log("hit",steps,"for start",s,"; bailing with",endPoints.size,"possible exits");
            }
        }
        return endPoints;
    });

    console.log("traversal finished, processing end points");
    console.log(endsByPath);

    const smallest = endsByPath.reduce((l,r)=> l.size < r.size ? l : r);

    // this doesn't work. need to find:
    //      cartesian product of all the sets (*)->
    //      LCM of each element of that product ->
    //      smallest of those
    // full problem's sets were all size 1,
    // so dumped them into wolfram alpha
    //
    // example problem has a size 2, but luckily...
    // (*) sets can be simplified by removing
    //     members that are multiples of a
    //     smaller member
    /*
    const steps = reduce(smallest,(acc,cur)=>{
        if(!endsByPath.every(s=>s.has(cur)))
            return acc;
        if(cur < acc)
            return cur;
        else
            return acc;
    },Infinity)
    */

    return Infinity;
}

type LoopIterator = IterableIterator<[number, string]> & {length:number};
function parseDirections2(line:string):LoopIterator  {
    const chars = line.split("");

    const retVal = (function* () {
        while(true) {
            for(const char of chars.entries()) {
                yield char;
            }
        }
    })() as LoopIterator;
    retVal.length = chars.length;
    return retVal;
}

export async function main(lines:string[]) {
    const [dir,...nodes] = lines.map(l=>l.trim()).filter(l=>l!='');

    //console.log(dir,nodes);

    //const route = parseDirections(dir);
    const tree = parseMap(nodes);

    //console.log(tree);

    //const answer = countSteps(route,tree,n=>n.name.endsWith('Z'));
    const answer = countSteps2(()=>parseDirections2(dir),tree,n=>n.name.endsWith('Z'));

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
