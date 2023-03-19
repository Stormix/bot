import { standardLibrary } from '@/lib/language';
import { parseAllExprs } from '@/lib/parser';
import type { EvalScope } from '@/lib/scoping';
import { EvalContext } from '@/lib/scoping';
import fs, { existsSync } from 'fs';
import yargs from 'yargs/yargs';
import { evaluate } from '..';

const args = yargs(process.argv.slice(2)).options({
  debug: {
    alias: 'd',
    description: 'Will dump the AST to the console',
  }
})
  .parseSync();

async function run() {

  const file = args._[0] as string;
  const debug = args.debug;

  // Read file content
  if (!existsSync(file)) {
    throw new Error(`File ${file} does not exist`);
  }

  if (!file.endsWith('.bot')) {
    throw new Error(`File ${file} is not a .bot file`);
  }

  const content = fs.readFileSync(file, 'utf-8').replace(/\r?\n|\r/g, ''); // Remove newlines

  // Parse and evaluate
  const loop: EvalScope = {
    vars: {},
    funcs: {
      ...standardLibrary
    }
  };

  const context = new EvalContext();

  context.pushScope(loop);

  const [exprs, err] = parseAllExprs(content);

  if (err !== null) {
    throw err;
  }

  if (debug) {
    for (let i = 0; i < exprs.length; i++) {
      exprs[i].dump();

    }
  } else {
    const results = await evaluate(content, loop);
  }
}

run()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
