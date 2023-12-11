import { runMain, sum, } from "../util.ts";
import { count, map } from "../iter_util.ts";

export type Foo = {
    TODO:unknown,
};

function foo() {

}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const values = 'TODO'

    console.log(values);

    const answer = 'TODO'

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
