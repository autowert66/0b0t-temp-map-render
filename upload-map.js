const fs = require('fs'),
  path = require('path'),
  child_process = require('child_process');

//#region util
const bold = (str) => `\x1b[1m${str}\x1b[0m`;
const green = (str) => `\x1b[32m${str}\x1b[0m`;

/** @param {Boolean | { logCmd: Boolean; logStdout: Boolean; logTime: Boolean; }} opts */
function exec(cmd, opts = true) {
  return new Promise((resolve, reject) => {
    const defaultOpts = {
      logCmd: false,
      logStdout: false,
      logTime: false,
    };

    if (opts === false) {
      opts = {};
    } else if (opts === true) {
      opts = defaultOpts;
      Object.keys(opts).forEach((key) => (opts[key] = true));
    } else {
      opts = {
        ...opts,
      };
    }

    if (opts.logCmd) {
      const cmdMessage =
        '> ' +
        bold(
          cmd.length > process.stdout.columns - 15
            ? cmd.slice(0, process.stdout.columns - 5) + '...'
            : cmd
        );
      console.log(cmdMessage);
    }
    const startTime = Date.now();

    const child = child_process.exec(cmd);
    if (opts.logStdout) {
      child.stdout.pipe(process.stdout);
      child.stderr.pipe(process.stderr);
    }

    child.once('exit', () => {
      if (opts.logTime) {
        const successMessage =
          green('✓ ') +
          'Finished in ' +
          bold((Date.now() - startTime) / 1000 + 's');
        console.log(successMessage);
      }
      resolve();
    });
    child.once('error', reject);
  });
}
function getFiles(folder) {
  const files = [];
  const step = (dir) => {
    const contents = fs.readdirSync(dir);
    for (const content of contents) {
      const contentPath = path.join(dir, content);
      if (fs.lstatSync(contentPath).isDirectory()) {
        step(contentPath);
      } else {
        files.push(contentPath);
      }
    }
  };
  step(folder);
  return files;
}
//#endregion

async function main() {
  const files = child_process
    .execSync('git status --short')
    .toString()
    .split('\n')
    .filter((line) => /^ . .*\.png$/.test(line))
    .map((line) => line.slice(3));
  // files.push(...getFiles('./world_isometric'));
  // files.push(...getFiles('./world_topdown'));

  const total = files.length;
  let done = 0;
  while (files.length > 0) {
    const PER_RUN = 10;
    for (let i = 0; i < 750; i += PER_RUN) {
      const fileList = files.splice(0, PER_RUN);
      done += fileList.length;
      const addCmd = `git add "${fileList.join('" "')}"`;

      await exec(addCmd, false);
    }

    const commitCmd = `git commit -m "🚀 Map upload ${done}/${total}"`;
    const pushCmd = `git push`;

    await exec(commitCmd, { logCmd: true });
    await exec(pushCmd, { logCmd: true, logStdout: true });

    console.log(
      '\n',
      `${done}/${total} (${((done / total) * 100).toFixed(2)}%)`,
      '\n'
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
