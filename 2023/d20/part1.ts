import { runMain, yeet, } from "../util.ts";
import { filter, map } from "../iter_util.ts";
import { memoize, pipe } from "../func_util.ts";

export type ModuleName = string;

export type PulseType = "H"|"L";

export type Pulse = {
    type: PulseType
    src: ModuleName,
    dest: ModuleName,
}

export type Module = {
    name: ModuleName,
    outputs: ModuleName[], // module names
    process(p:Pulse):PulseType|null
}
export type ModuleWithState<TState> = Module & {
    state:TState,
    extractState():TState,
    applyState(state:TState):void,
}

export class FlipFlopModule implements ModuleWithState<boolean> {
    public state = false 
    constructor(
        public name:ModuleName,
        public outputs:ModuleName[],
    ) {}
    process({type}:Pulse) {
        if(type === "H")
            return null;

        this.state = !this.state;

        return this.state ? 
            // off->on
            "H" :
            // on->off
            "L";
    }
    extractState():boolean {
        return this.state;
    }
    applyState(state: boolean): void {
        this.state = state;
    }
}

export class ConjunctionModule implements ModuleWithState<ConjunctionModule["state"]> {
    public state:{ [src:ModuleName]: PulseType };
    constructor(
        public name:ModuleName,
        public outputs:ModuleName[],
        inputs:string[],
    ) {
        this.state = Object.fromEntries(inputs.map(i=>[i,"L"]));
    }
    process({src,type}:Pulse) {
        this.state[src] = type;

        return Object.values(this.state)
                        .every(s=>s==="H") ? "L" : "H";
    }
    extractState(): { [src: string]: PulseType } {
        return Object.assign({}, this.state);
    }
    applyState(state: { [src: string]: PulseType }): void {
        this.state = Object.assign({}, state);
    }
}

export class BroadcasterModule implements Module {
    public static readonly NAME:ModuleName = "broadcaster";
    public readonly name:ModuleName = BroadcasterModule.NAME;
    constructor(
        public outputs:ModuleName[],
    ) {}
    process({type}:Pulse) { return type; }
}

export type ModuleNetwork = Map<ModuleName,Module|ModuleWithState<unknown>>;

export const buttonPulse:Pulse = {src:"button", dest:BroadcasterModule.NAME, type: "L"}

// flip flop: %+name
// conjunction: &+name
// "broadcaster": unique

export function parseInput(lines:string[]):ModuleNetwork {
    let bcast:BroadcasterModule;
    const flipFlops:FlipFlopModule[] = [];

    const conjsProto = [] as {name:ModuleName, outputs:ModuleName[]}[];

    // name->names which output to this name
    const oiMap:Map<ModuleName,ModuleName[]> = new Map();

    for(const line of lines) {
        const [nameRaw,outputsRaw] = line.split(" -> ");

        const outputs = outputsRaw.split(", ");

        const type = nameRaw.substring(0,1) as "b"|"%"|"&";
        const name = type === "b" ? nameRaw : nameRaw.substring(1);

        for(const out of outputs) {
            if(!oiMap.has(out))
                oiMap.set(out,[]);

            oiMap.get(out)!.push(name)
        }

        if(type === "b") {
            bcast = new BroadcasterModule(outputs);
        }
        else if(type === "%") {
            flipFlops.push(new FlipFlopModule(name,outputs));
        }
        else if(type === "&") {
            conjsProto.push({name,outputs});
        }
        else throw "unknown module type: "+type;
    }

    if(!bcast!)
        throw "failed to find broadcast node!";

    const conjs = conjsProto.map(({name,outputs})=>
                                 new ConjunctionModule(name, outputs, oiMap.get(name)!));

    return new Map([bcast, ...flipFlops, ...conjs].map(m=>[m.name,m]));
}

export function extractStates(network:ModuleNetwork) {
    return pipe(network.entries(),
                es=> (filter(es,
                             ([_,v])=> "extractState" in v) as IterableIterator<[string,ModuleWithState<unknown>]>),
                es=> map(es, ([k,v])=>[k,v.extractState()] as const),
                es=> Object.fromEntries(es));
}

export type ModuleStateSnapshot = ReturnType<typeof extractStates>

export function applyStates(network:ModuleNetwork, snapshot:ModuleStateSnapshot) {
    const states = Object.entries(snapshot);

    for(const [name,state] of states) {
        const mod = (network.get(name) ?? yeet("failed to get module for state"));

        if(!("applyState" in mod))
            throw "module has no 'applyState' prop:"+mod;

        if(typeof mod.applyState !== "function")
            throw "module has non-function 'applyState' prop"+mod;

        mod.applyState(state);
    }
}

export type PushButtonResult = {
    totalPulses: { [key in PulseType]: number },
    finalState: ModuleStateSnapshot,
}

export function pushButton(network:ModuleNetwork, setInitState?:ModuleStateSnapshot):PushButtonResult {
    const totalPulses = { H:0, L:0 };

    if(setInitState)
        applyStates(network,setInitState)

    const pulseQueue:Pulse[] = [];

    pulseQueue.push(buttonPulse);

    //console.log("button pushed!")
    
    while(pulseQueue.length > 0) {
        const curPulse = pulseQueue.shift()!;

        //const {src,type,dest} = curPulse;
        //console.log("pulse:",src,"-",type,">",dest);

        totalPulses[curPulse.type] += 1;

        const mod = network.get(curPulse.dest);

        if(mod === undefined)
            continue;

        const result = mod.process(curPulse);

        if(result === null)
            continue;

        for(const dest of mod.outputs)
            pulseQueue.push({
                src: mod.name,
                type: result,
                dest,
            });
    }

    const finalState = extractStates(network);

    //console.log("network quiet after",totalPulses,"pulses, final state:",finalState);

    return { totalPulses, finalState, }
}

export function pushButtonRepeatedly(network:ModuleNetwork, count=1000) {
    // memoizing turns out to be useless for the full puzzle...
    // based on part 2's results, states don't repeat until at
    // least 200 trillion pushes... oh well
    type ParamT = Parameters<typeof pushButton>[1];
    const memo = memoize((state:ParamT)=>pushButton(network,state), (startState)=>JSON.stringify(startState));

    const firstResult = memo(undefined);

    const pulses = firstResult.totalPulses;
    let lastState = firstResult.finalState;

    for(let i = 1; i < count; ++i) {
        const {totalPulses,finalState} = memo(lastState);

        pulses.H += totalPulses.H;
        pulses.L += totalPulses.L;

        lastState = finalState;
    }

    return pulses;
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const modules = parseInput(cleanedLines);

    //console.log(modules);

    const pushResult = pushButtonRepeatedly(modules);

    console.log(pushResult); 

    const answer = pushResult.H * pushResult.L;

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
