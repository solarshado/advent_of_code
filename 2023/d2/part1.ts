import { linesFrom } from "../util.ts";

const example = `
Game 1: 3 blue, 4 red; 1 red, 2 green, 6 blue; 2 green
Game 2: 1 blue, 2 green; 3 green, 4 blue, 1 red; 1 green, 1 blue
Game 3: 8 green, 6 blue, 20 red; 5 blue, 4 red, 13 green; 5 green, 1 red
Game 4: 1 green, 3 red, 6 blue; 3 green, 6 red; 3 green, 15 blue, 14 red
Game 5: 6 red, 1 blue, 3 green; 2 blue, 1 red, 2 green
`.trim();

type Game = {id:number, pulls:ItemSet[]};
type ItemSet = {red:number, green:number, blue:number};

function parseGame(str:string):Game {
    const idRegex = /Game (\d+): /;

    const id = +idRegex.exec(str)![1];

    const pullsRaw = str.replace(idRegex,"").split(";")

    const pulls = pullsRaw.map(p=>{
        const colors = p.split(',');

        const colorRegex = /(\d+) (red|green|blue)/;

        const pull = colors.reduce(
            (acc,cur)=>{
                const [_, count, color] = colorRegex.exec(cur)!;
                acc[color as keyof ItemSet] = +count;
                return acc;
            },
            {red:0, green:0, blue:0});

        return pull;
    });

    return {id, pulls};
}

function smallestBagFor(game:Game):ItemSet {
    return game.pulls.reduce((l,r)=>({
        blue: Math.max(l.blue,r.blue),
        green: Math.max(l.green,r.green),
        red: Math.max(l.red,r.red),
    }));
}

function isFirstLargerOrEqual(a:ItemSet, b:ItemSet):boolean {
    return (a.blue >= b.blue) &&
        (a.green >= b.green) &&
        (a.red >= b.red);
}

function filterPossibleGames(games:Game[], wholeBag:ItemSet):Game[] {
    return games.filter(g=> isFirstLargerOrEqual(wholeBag, smallestBagFor(g)));
}

async function main() {
    const lines = (await linesFrom()).filter(l=>l!='');
    //const lines = example.split('\n');

    const games = lines.map(parseGame);

    const possibleGames = filterPossibleGames(games, {red: 12, green: 13, blue: 14});

    console.log(possibleGames.map(g=>g.id));

    const answer = possibleGames.reduce((a,c)=>a+c.id,0);

    console.log(answer);
}

if(import.meta.main)
    await main();

export {type Game, type ItemSet, example, parseGame, smallestBagFor, isFirstLargerOrEqual, filterPossibleGames};
