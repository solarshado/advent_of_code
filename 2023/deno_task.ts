import { basename, dirname, join } from "https://deno.land/std@0.208.0/path/mod.ts";

const tasks = {
    "init": init,
} as Record<string,(args?:string[])=>void>;

export function init(args:string[]) {
    const init_cwd = Deno.env.get("INIT_CWD");

    if(typeof init_cwd === "undefined") {
       console.error("failed to find $INIT_CWD!");
       Deno.exit(1);
    }

    Deno.chdir(init_cwd);

    const skelPath = join(init_cwd, "..", "skel")

    for(const {name, isFile} of Deno.readDirSync(skelPath)) {
        if(!isFile) continue;

        const srcPath = join(skelPath,name);
        const destPath = join(init_cwd,name);

        Deno.copyFileSync(srcPath,destPath);
    }


    //////// TODO

    const day = basename(init_cwd).replace("d","");
    const year = basename(dirname(init_cwd));
    const inputUrl = `https://adventofcode.com/${year}/day/${day}/input`;

    console.log(init_cwd,day,year,inputUrl);
}

function main() {
    const [subcommand=undefined,...args] = Deno.args;

    if(typeof subcommand === "undefined") {
        console.error("missing subcommand!");
        Deno.exit(1);
    }

    const func = tasks[subcommand];
    if(typeof func !== "function") {
        console.error(`unknown subcommand '${subcommand}', try:\n${Object.keys(tasks).join('\n\t')}`);
        Deno.exit(1);
    }

    func(args);
}

if(import.meta.main)
    main();
