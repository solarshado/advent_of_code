import { runMain, sum, yeet, } from "../util.ts";
import { count, map } from "../iter_util.ts";

export type Part = {
    x:number,
    m:number,
    a:number,
    s:number,
};

export type Worflow = {
    name:string,
    rules:Rule[],
}

export type Rule = {
    condition:Condition|null,
    action:Action,
}
export type Action = "A"|"R"|{jumpTo:string}

export type Condition = {
    prop:keyof Part,
    op:"<"|">",
    val:number,
}

export function parseInput(lines:string[]):{workflows:Map<string,Worflow>, parts:Part[]} {
    const linesCopy = lines.concat();

    const workflows:Worflow[] = [];
    const parts:Part[] = []

    while(linesCopy.length > 0) {
        const l = linesCopy.shift()!;
        if(l == "")
            break;
        workflows.push(parseWorkflow(l));
    }

    while(linesCopy.length > 0) {
        const l = linesCopy.shift()!;
        if(l == "")
            break;
        parts.push(parsePart(l));
    }


    return {
        workflows: new Map(workflows.map(w=>[w.name,w])),
        parts
    }
}

export function parseWorkflow(line:string):Worflow {
    const [name,steps] = Array.from(/(\w+){([ARa-z0-9,:<>]+)}/.exec(line)!).splice(1);

    const parseAction = (s:string):Action=>
                /^(A|R)$/.test(s) ?
                    s as Action :
                    {jumpTo:s};

    const rules = steps.split(',').map((s):Rule=>{
        if(!s.includes(":"))
            return { action:parseAction(s), condition: null };

        const [conditionStr,action] = s.split(":");

        const [prop,op,valStr] = Array.from(/(x|m|a|s)(<|>)(\d+)/.exec(conditionStr)!).splice(1);
        const val = +valStr;

        const condition = {prop,op,val} as Condition;
        return { action: parseAction(action), condition };
    });

    return {
        name,
        rules,
    }
}

export function parsePart(line:string):Part {
    const [x,m,a,s] = Array.from(/{x=(\d+),m=(\d+),a=(\d+),s=(\d+)}/.exec(line)!).splice(1).map(Number);
    return {x,m,a,s};
}

export function runWorkflow(wfs:Map<string,Worflow>, part:Part):boolean {
    let activeWf = wfs.get("in")!;

    wf:
    while(true) {
        for(const {action,condition} of activeWf.rules) {
            if(testCondition(condition)) {
                if(action === "A")
                    return true;
                else if(action === "R")
                    return false;
                else {
                    const {jumpTo} = action;
                    activeWf = wfs.get(jumpTo)!;
                    continue wf;
                }
            }
        }
        throw "should never get here";
    }

    function testCondition(cond:Condition|null):boolean {
        if(cond === null)
            return true;
        const {prop,op,val} = cond;
        const partVal = part[prop];
        return op === "<" ? partVal < val :
                op === ">" ? partVal > val :
                yeet("bad operator:"+op);
    }
}

export function summarizePart({x,m,a,s}:Part):number {
    return x+m+a+s;
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim())

    const {parts,workflows} = parseInput(cleanedLines);

    console.log(parts,workflows);

    const acceptedParts = parts.filter(p=>runWorkflow(workflows,p));

    const answer = sum(acceptedParts,summarizePart)

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
