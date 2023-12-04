import { linesFrom } from "../util.ts";

import * as p1 from "./part1.ts";

async function main() {
    const lines = (await linesFrom()).filter(l=>l!='');
    //const lines = p1.example.split('\n');

    const games = lines.map(p1.parseGame);

    const minimalBags = games.map(g=>({id: g.id, bag: p1.smallestBagFor(g)}));
    const powerSetOfBags = minimalBags.map(({bag:{red,green,blue}})=>red*green*blue);

    console.log(minimalBags.map((g,i)=>`id: ${g.id} ; power: ${powerSetOfBags[i]}`));

    const answer = powerSetOfBags.reduce((a,c)=>a+c);

    console.log(answer);
}

if(import.meta.main)
    await main();
