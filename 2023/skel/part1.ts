import { linesFrom, sum, product } from "../util.ts";
import { count } from "../iter_util2.ts";

export const example = `
`.trim();

export type Foo = {
    TODO:unknown,
};

function foo() {

}

async function main() {
    //const lines = (await linesFrom()).filter(l=>l!='');
    const lines = example.split('\n');

    const values = 'TODO'

    console.log(values);

    const answer = 'TODO'

    console.log(answer);
}

if(import.meta.main)
    await main();
