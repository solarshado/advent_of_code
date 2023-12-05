import { linesFrom, setIntersection, sum } from "../util.ts";

const example = `
Card 1: 41 48 83 86 17 | 83 86  6 31 17  9 48 53
Card 2: 13 32 20 16 61 | 61 30 68 82 17 32 24 19
Card 3:  1 21 53 59 44 | 69 82 63 72 16 21 14  1
Card 4: 41 92 73 84 69 | 59 84 76 51 58  5 54 83
Card 5: 87 83 26 28 32 | 88 30 70 12 93 22 82 36
Card 6: 31 18 13 56 72 | 74 77 10 23 35 67 36 11
`.trim();

class Card {
    public readonly id:number;
    private readonly winners:Set<number>;
    private readonly have:Set<number>;

    constructor(raw:string) {
        const [prefix, numberSets] = raw.split(':');
        this.id = +prefix.replace("Card ","");
        const [list1, list2] = numberSets.split('|').map(s=>s.trim().split(/\s+/).map(n=>+n));
        this.winners = new Set(list1);
        this.have = new Set(list2);
    }

    get winningNumbers():Set<number> {
        const value = setIntersection(this.have, this.winners);
        // memoize
        Object.defineProperty(this,"winningNumbers",{value, writable: false});
        return value;
    }

    get pointValue() {
        const matches = this.winningNumbers.size;
        return matches > 0 ? Math.pow(2,matches-1) : 0;
    }
}

async function main() {
    const lines = (await linesFrom()).filter(l=>l!='');
    //const lines = example.split('\n');

    const cards = lines.map(l=>new Card(l));

    console.log(cards);

    console.log(sum(cards,c=>c.pointValue));
}

if(import.meta.main)
    await main();
