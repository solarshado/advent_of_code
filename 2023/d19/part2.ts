import { product, runMain, sum, yeet, } from "../util.ts";
import { Action, Condition, Worflow, parseInput } from './part1.ts';

type Range = {
    top:number,
    bottom:number,
}

type AbstractPart = {
    x:Range,
    m:Range,
    a:Range,
    s:Range
}

function isInRange(value:number, {top,bottom}:Range):boolean {
   return value >= bottom && value <= top;
}

function countValuesInRange({top,bottom}:Range):number {
    return Math.max(0, top-(bottom-1));
}

function applyCondition(range:Range, {op,val}:Pick<Condition,"op"|"val">):{passed?:Range, failed?:Range} {
    if(!isInRange(val,range)) {
        const key = testCondition({op,val},range.top)?"passed":"failed";
        return {[key]:range}
    }

    const [topAdj,botAdj] = op == ">" ? [0,1] : [-1,0];

    const upper = { ...range, bottom: val + botAdj};
    const lower = { ...range, top: val + topAdj};

    const [passed,failed] = op == ">" ? [upper,lower] : [lower,upper];
    return {passed,failed};
}

function testCondition(cond:Omit<Condition,"prop">|null, partVal:number):boolean {
    if(cond === null)
        return true;
    const {op,val} = cond;
    return op === "<" ? partVal < val :
        op === ">" ? partVal > val :
        yeet("bad operator:"+op);
}

type State = "A"|"R"|{wf:string, ruleIdx:number};

export function runWorkflow(wfs:Map<string,Worflow>, part:AbstractPart):AbstractPart[] {
    const getWf = (s:string)=>wfs.get(s);
    
    type Part = {part:AbstractPart, state:State};

    const partQueue:Part[] = [{part, state:{wf:"in", ruleIdx:0}}];

    const passedParts:AbstractPart[] = [];
    //const failed = [];

    while(partQueue.length > 0) {
        const {part,state} = partQueue.pop()!;
        
        if(state === "R")
            continue;
        if(state === "A") {
            passedParts.push(part);
            continue;
        }

        const {wf,ruleIdx} = state;

        const {condition,action} = getWf(wf)!.rules[ruleIdx];

        if(condition === null) {
            const state = actionToState(action);
            partQueue.unshift({part,state});
            continue;
        }

        const {prop} = condition;

        const {passed,failed} = applyCondition(part[prop], condition);

        // somwhere hereish we should test for empty ranges?
        
        if(passed !== undefined) {
            const state = actionToState(action);
            const newPart = {
                ...part,
                [prop]:passed
            }
            partQueue.push({part: newPart, state})
        }

        if(failed !== undefined) {
            const state:State = {wf, ruleIdx: ruleIdx+1};
            const newPart = {
                ...part,
                [prop]:failed
            }
            partQueue.push({part: newPart, state})
        }
    }

    function actionToState(action:Action):State {
        return (action === "A" || action === "R") ?
            action as State :
            { wf: action.jumpTo, ruleIdx: 0 };
    }

    return passedParts;
}

export function countRealParts(ab:AbstractPart) {
    const {x,m,a,s} = ab;
    const counts = [x,m,a,s].map(countValuesInRange);
    const total = product(counts)
    return total;
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim())

    const {parts:_,workflows} = parseInput(cleanedLines);

    const fullRange = ():Range=>({top:4000,bottom:1,});

    const initPart:AbstractPart = {
        x: fullRange(),
		m: fullRange(),
		a: fullRange(),
		s: fullRange(),
    }

    const passedParts = runWorkflow(workflows,initPart);

    console.log(passedParts);

    const answer = sum(passedParts, countRealParts);

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
