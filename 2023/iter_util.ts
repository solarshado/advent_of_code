
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
        for(let r = l ; r < len; ++r)
            yield [list[l],list[r]];
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

// TODO move these elsewhere (to util.ts?)
export type Mapper<T,U> = (t:T)=>U;
export type Predicate<T> = Mapper<T,boolean>;
export type Reducer<T,U> = (acc:T,cur:U)=>T;

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

