import { Mapper, Predicate, Reducer } from "./func_util.ts";

export function* range(start:number, length:number) {
    for(let n = start; n < start+length; ++n)
    yield n;
}

export function* repeat<T>(value:T, count:number) {
    while(--count >= 0){
        yield value;
    }
}

export function* genPairs<T>(list:T[]):IterableIterator<[T,T]> {
    const len = list.length;

    for(let l = 0 ; l < len - 1; ++l)
        for(let r = l+1 ; r < len; ++r)
            yield [list[l],list[r]];
}

/** @deprecated */
export function* pairWise<T>(src:T[]):IterableIterator<[T,T]> {
    const len = src.length;
    for(let i = 0 ; i < len - 1; ++i){
        const a = src[i], b = src[i+1];
        yield [a,b]
    }
}

/** TODO test this */
export function* pairwise<T>(src:Iterable<T>|Iterator<T>):IterableIterator<[T,T]> {
    const iter = ("next" in src && typeof src.next === "function") ?
                    src as Iterator<T> :
                    (src as Iterable<T>)[Symbol.iterator]();

    let prev = iter.next();
    while(true) {
        const next = iter.next();

        yield [prev.value,next.value];

        if(next.done) break;

        prev = next;
    }
}

export function count(iter:Iterable<unknown>) {
  return reduce((acc, _) => acc + 1, 0, iter);
}

export function toArray<T>(iter:Iterable<T>):T[] {
    return [...iter];
}

export function* concat<T>(...iters:Iterable<T>[]) {
    for(const iter of iters)
        yield* iter;
}

export function isIterable(o: unknown): o is Iterable<unknown> {
    return !!o && typeof o == "object" && Symbol.iterator in o;
}


type MapParam<T,U> = Mapper<T,U> | Iterable<T>;

export function map<T,U>(iter:Iterable<T>, mapper:Mapper<T,U>):IterableIterator<U>
export function map<T,U>(mapper:Mapper<T,U>, iter:Iterable<T>):IterableIterator<U>

export function* map<T,U>(first:MapParam<T,U>, second:MapParam<T,U>):IterableIterator<U> {
    const [mapper,iter] =
        typeof first === "function" && typeof second === "object" ?
        [first,second] :
        typeof first === "object" && typeof second === "function" ?
        [second,first] :
        (function() { throw "Bad parameters!"; })();

    for (const item of iter)
        yield mapper(item);
}

type FilterParam<T> = Predicate<T> | Iterable<T>

export function filter<T>(predecate:Predicate<T>, iter:Iterable<T>):IterableIterator<T>
export function filter<T>(iter:Iterable<T>, predecate:Predicate<T>):IterableIterator<T>

export function* filter<T>(first:FilterParam<T>, second:FilterParam<T>):IterableIterator<T> {
    const [predecate,iter] =
        typeof first === "function" && typeof second === "object" ?
        [first,second] :
        typeof first === "object" && typeof second === "function" ?
        [second,first] :
        (function() { throw "Bad parameters!"; })();

    for(const item of iter)
        if(predecate(item))
            yield item;
}

type ReduceParam<T,U> = T extends Function ? never : ( Reducer<T,U> | Iterable<U> );

export function reduce<T,U>(reducer:Reducer<T,U>, seed:T, iter:Iterable<U>):T 
export function reduce<T,U>(iter:Iterable<U>, reducer:Reducer<T,U>, seed:T):T 

export function reduce<T,U>(first:ReduceParam<T,U>, second:Reducer<T,U>|T, third:Iterable<U>|T):T {

    const [iter,reducer,seed] =
        typeof first === "function" &&  isIterable(third) ?
        [third, first, second as T] :
        isIterable(first) && typeof second === "function" ?
        [first, second as Reducer<T,U>, third as T] :
        (function() { throw "Bad parameters!"; })();

    let acc = seed;
    for(const item of iter)
        acc = reducer(acc,item);

    return acc;
}

export function some<T>(predecate:Predicate<T>, iter:Iterable<T>):boolean;
export function some<T>(iter:Iterable<T>, predecate:Predicate<T>):boolean;

export function some<T>(first:FilterParam<T>, second:FilterParam<T>):boolean {
    const [predecate,iter] =
        typeof first === "function" && typeof second === "object" ?
        [first,second] :
        typeof first === "object" && typeof second === "function" ?
        [second,first] :
        (function() { throw "Bad parameters!"; })();

    for(const item of iter)
        if(predecate(item))
            return true;
    return false;
}

export function every<T>(predecate:Predicate<T>, iter:Iterable<T>):boolean;
export function every<T>(iter:Iterable<T>, predecate:Predicate<T>):boolean;

export function every<T>(first:FilterParam<T>, second:FilterParam<T>):boolean {
    const [predecate,iter] =
        typeof first === "function" && typeof second === "object" ?
        [first,second] :
        typeof first === "object" && typeof second === "function" ?
        [second,first] :
        (function() { throw "Bad parameters!"; })();

    for(const item of iter)
        if(!predecate(item))
            return false;
    return true;
}
