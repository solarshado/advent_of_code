import { readStringDelim } from "https://deno.land/std@0.105.0/io/mod.ts";

export async function linesFrom(source:Deno.Reader = Deno.stdin):Promise<string[]> {
    const ret = [];
    const reader = readStringDelim(source, '\n');

    for await (const line of reader) {
        ret.push(line);
    }

    return ret;
}

export function sum(nums:number[], mapper?:((v:number)=>number)):number;
export function sum<T>(nums:T[], mapper:((v:T)=>number)):number;

export function sum<T>(nums:T[], mapper?:((v:T)=>number)):number
{
    const reducer:(acc:number,curr:T)=>number =
        typeof mapper === "function" ?
        (acc,curr)=> acc + mapper(curr) :
        (acc,curr)=> acc + +curr;

    return nums.reduce(reducer,0);
}

export function product(nums:number[], mapper?:((v:number)=>number)):number;
export function product<T>(nums:T[], mapper:((v:T)=>number)):number;

export function product<T>(nums:T[], mapper?:((v:T)=>number)):number
{
    const reducer:(acc:number,curr:T)=>number =
        typeof mapper === "function" ?
        (acc,curr)=> acc * mapper(curr) :
        (acc,curr)=> acc * +curr;

    return nums.reduce(reducer,1);
}


export function setIntersection<T>(a:Set<T>, b:Set<T>):Set<T> {
    const [larger, smaller] = a.size > b.size ? [a,b] : [b,a];

    return new Set(_intersect(larger,smaller))
}
function* _intersect<T>(larger:Set<T>, smaller:Set<T>) {
    for(const item of smaller)
        if(larger.has(item))
            yield item;
}
