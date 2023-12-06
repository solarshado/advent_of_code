
export function* range(start:number, length:number) {
    for(let n = start; n < start+length; ++n)
    yield n;
}

export function* concat<T>(...iters:Iterable<T>[]) {
    for(const iter of iters)
        yield* iter;
}

export function* map<T,U>(mapper:(item:T)=>U, iter:Iterable<T>) {
    for(const item of iter)
        yield mapper(item);
}

export function* filter<T>(predecate:(item:T)=>boolean, iter:Iterable<T>) {
    for(const item of iter)
        if(predecate(item))
            yield item;
}

export function reduce<T,U>(reducer:(acc:T,cur:U)=>T, seed:T, iter:Iterable<U>) {
    let acc = seed;
    for(const item of iter)
        acc = reducer(acc,item);

    return acc;
}

export const count = (iter:Iterable<unknown>) => reduce((acc,_)=>acc+1, 0, iter);
