import { runMain, splitArray, sum, } from "../util.ts";
import { count, map } from "../iter_util.ts";
import { memoize, pipe, } from '../func_util.ts';
import * as gu from "../grid_util.ts";

export type Computer = {
    A:number,
    B:number,
    C:number,
    instructionPointer:number,
    programRaw:number[],
    output:number[],
}

export type Instruction = {
    name:string,
    //operandType:"literal"|"combo",
    execute(input:Computer):Computer,
};

export function parseComboOperand(op:number, context:Computer) {
    switch(op) {
        case 0:
        case 1:
        case 2:
        case 3:
            return op;
        case 4:
            return context.A;
        case 5:
            return context.B;
        case 6:
            return context.C;
        case 7:
        default:
            throw "bad operand";
    }
}

export function getRawOperand({instructionPointer,programRaw}:Computer) {
    return programRaw[instructionPointer+1];
}

export function getLiteralOperand({instructionPointer,programRaw}:Computer) {
    return programRaw[instructionPointer+1];
}

export function getComboOperand(computer:Computer) {
    const {instructionPointer,programRaw} = computer;
    return parseComboOperand(programRaw[instructionPointer+1],computer);
}



export const instructionsByOpcode:{ [key:number]: Instruction } = {
    0:{
        name: "adv",
        execute(input) {
            const num = input.A;
            const denom = 2**getComboOperand(input);
            return {
                ...input,
                instructionPointer: input.instructionPointer + 2,
                A: Math.trunc(num/denom),
            };
        }
    },
    1:{
        name: "bxl",
        execute(input) {
            return {
                ...input,
                instructionPointer: input.instructionPointer + 2,
                B: input.B ^ getLiteralOperand(input),
            };
        }
    },
    2:{
        name: "bst",
        execute(input) {
            return {
                ...input,
                instructionPointer: input.instructionPointer + 2,
                B: getComboOperand(input) % 8,
            };
        }
    },
    3:{
        name: "jnz",
        execute(input) {
            return {
                ...input,
                instructionPointer: input.A === 0 ? input.instructionPointer + 2 : getLiteralOperand(input),
            };
        }
    },
    4:{
        name: "bxc",
        execute(input) {
            return {
                ...input,
                instructionPointer: input.instructionPointer + 2,
                B: input.B ^ input.C
            };
        }
    },
    5:{
        name: "out",
        execute(input) {
            return {
                ...input,
                instructionPointer: input.instructionPointer + 2,
                output: input.output.concat(getComboOperand(input) % 8)
            };
        }
    },
    6:{
        name: "bdv",
        execute(input) {
            const num = input.A;
            const denom = 2**getComboOperand(input);
            return {
                ...input,
                instructionPointer: input.instructionPointer + 2,
                B: Math.trunc(num/denom),
            };
        }
    },
    7:{
        name: "cdv",
        execute(input) {
            const num = input.A;
            const denom = 2**getComboOperand(input);
            return {
                ...input,
                instructionPointer: input.instructionPointer + 2,
                C: Math.trunc(num/denom),
            };
        }
    },
} as const;

export function parseInput(lines:string[]):Computer {
    const [
        [,regA],
        [,regB],
        [,regC],
        [,program],
    ] = lines.map(l=>Array.from(/.*?: (\d+(,\d+)*)/.exec(l)!))

    return {
        A: +regA,
        B: +regB,
        C: +regC,
        instructionPointer: 0,
        programRaw: program.split(',').map(Number),
        output: [],
    };
}

export function clock(computer:Computer):[didHalt:boolean,Computer] {
    const {instructionPointer, programRaw} = computer;
    
    if(instructionPointer >= programRaw.length)
        return [true,computer];

    const opcode = programRaw[instructionPointer];
    const op = instructionsByOpcode[opcode].execute;
    return [false,op(computer)];
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const initState = parseInput(cleanedLines);

    console.log(initState);

    let [halted,state] = [false,initState];

    while(!halted) 
        [halted,state] = clock(state);

    console.log(state);

    const answer = state.output.join(",");

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
