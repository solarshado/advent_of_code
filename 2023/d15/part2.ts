import { runMain, sum, } from "../util.ts";
import { filter, map, } from "../iter_util.ts";
import { hash as hashFunc } from './part1.ts';

type Step = {
    label:string,
    hash:number,
} & ({op:"-"} | {op:"=", fl:number });

function parseStep(s:string):Step {
    const [_,label,opRaw] = Array.from(/([a-z]+)(-|=\d)/.exec(s)!);
    const hash = hashFunc(label);

    const op = opRaw[0] as "-"|"=";

    return op === "=" ? {label, hash, op, fl: +opRaw[1] } : {label, hash, op, };
}

function stringifyStep(s:Step) {
    return s.label+s.op+(s.op === "=" ? s.fl : "")
}

class Lens {
    constructor(
        public readonly label:string,
        public readonly fl:number,
    ) {}
    //toString() { return `[${this.label} ${this.fl}]`; }
    //[Symbol.for("Deno.customInspect")]() { return this.toString(); }
}

class Box {
    public lenses:Lens[] = [];
    constructor(
        public readonly id:number
    ) {}
}

class AutovivifyingArray<T> {
    #inner:T[] = [];

    constructor(
        private readonly elementConstructor:{new(idx:number):T}
    ){}

    get(idx:number):T {
        return idx in this.#inner ?
            this.#inner[idx] :
            (this.#inner[idx] = new this.elementConstructor(idx));
    }

    *[Symbol.iterator]() { yield* this.#inner; }
    //[Symbol.for("Deno.customInspect")]() { return Deno.inspect(this.#inner); }
}

function doSteps<T extends {get(i:number):Box}>(steps:Step[], boxes:T):T {

    for(const step of steps) {
        doStep(step);
        /*
        console.log("after step",stringifyStep(step));
        console.log(boxes);
        */
    }

    return boxes;

    function doStep(step:Step) {
        const {
            label,
            hash: boxId,
            op: operation,
        } = step;

        const box = boxes.get(boxId);

        if(operation === "-") {
            box.lenses = box.lenses.filter(l=>l.label != label);
        }
        else if(operation === "=") {
            const {fl} = step;

            const l = new Lens(label, fl);

            const found = box.lenses.findIndex(l=> l.label == label);

            if(found !== -1)
                box.lenses[found] = l;
            else
                box.lenses.push(l);
        }
        else
            throw "bad operation: "+operation;

        //console.log("doStep; done",stringifyStep(step),box);
    }
}

export async function main(lines:string[]) {
    const fullInput = lines.map(l=>l.trim()).filter(l=>l!='').join("");

    const steps = fullInput.split(",").map(parseStep);

    console.log(steps);

    const boxes = doSteps(steps,new AutovivifyingArray(Box));

    const focusingPower = map(filter(boxes, b=>!!b), ({id,lenses})=>lenses.map((l,i)=>(id+1)*(i+1)*l.fl));

    const answer = sum([...focusingPower].flat());

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
