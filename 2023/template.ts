import { linesFrom, sum } from "../util.ts";

const example = `
`.trim();

function foo() {

}

async function main() {
    //const lines = (await linesFrom()).filter(l=>l!='');
    const lines = example.split('\n');

    //const values = lines.map(...);

    console.log(sum(values));
}

if(import.meta.main)
    await main();
