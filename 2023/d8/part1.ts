import { runMain, } from "../util.ts";

type Node = {
    name:string,
    L:Node,
    R:Node,
};

export function parseTree(lines:string[]):Node {
    type PrototypeNode = {
        [prop in keyof Node]: Node[prop] extends Node ? Node | string : Node[prop];
    };
    const nameMap = new Map<string,PrototypeNode>();

    const nodes1 = lines.map((line)=> {
        console.log(line)
        const [_,name,L,R] = Array.from(/(\w{3}) = \((\w{3})\, (\w{3})\)/.exec(line)!.values())
        const node:PrototypeNode = { name, L,R };
        nameMap.set(name,node);
        return node;
    });

    // reify the prototypes
    nodes1.forEach((n)=> {
        const {L:l,R:r} = n;
        const [L,R] = [l,r].map(c=>nameMap.get(c as string)!);

        n.L = L as Node;
        n.R = R as Node;
    });

    console.log(nodes1);

    return nameMap.get("AAA") as Node;
}

export function parseDirections(line:string):IterableIterator<string> {
    const chars = line.split("");

    return (function* () {
        while(true) {
            for( const char of chars) {
                yield char;
            }
        }
    })();
}

export function countSteps(directions:IterableIterator<string>, tree:Node, endCondition:(n:Node)=>boolean):number|never {
    let steps = 0;
    let here=tree;
    for(const step of directions) {
        //console.log("visiting",here);
        if(endCondition(here))
            break;
        const dir = step as keyof Node;
        here = here[dir] as Node;
        //console.log("going",dir,"to",here)
        //prompt("continue?");
        steps++;
    }

    return steps;
}

export async function main(lines:string[]) {

    const [dir,...nodes] = lines.map(l=>l.trim()).filter(l=>l!='');

    //console.log(dir,nodes);

    const route = parseDirections(dir);
    const tree = parseTree( nodes);

    if(tree.name != "AAA") throw "borken start loc";

    console.log(tree);

    const answer = countSteps(route,tree,n=>n.name == 'ZZZ');

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
