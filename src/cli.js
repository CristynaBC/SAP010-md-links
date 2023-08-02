
const chalk = require('chalk');
const { mdLinks, getHTTPStatus } = require('./index');

const path = process.argv[2];

const options = {
  validate: process.argv.includes('--validate'),
  stats: process.argv.includes('--stats'),
};

function printLinks(linksObject) {
  linksObject.forEach((link) => {
    if (link.ok === 'Ok') {
      console.log(chalk.cyan(`\nhref: ${link.href} `));
      console.log(chalk.yellow(`text: ${link.text}`));
      console.log(chalk.magenta(`file: ${link.file}`));
      console.log(chalk.blue(`status: ${link.status}`));
      console.log(chalk.green(`ok: ${link.ok} \n`));
      console.log(
        '------------------------------------------------------------------------',
      );
    } else if (link.ok === 'FAIL') {
      console.log(chalk.cyan(`\nhref: ${link.href} `));
      console.log(chalk.yellow(`text: ${link.text}`));
      console.log(chalk.magenta(`file: ${link.file}`));
      console.log(chalk.red(`status: ${link.status}`));
      console.log(chalk.bgRed(`ok: ${link.ok} \n`));
      console.log(
        '------------------------------------------------------------------------',
      );
    } else {
      console.log(chalk.cyan(`\nhref: ${link.href} `));
      console.log(chalk.yellow(`text: ${link.text}`));
      console.log(chalk.magenta(`file: ${link.file} \n`));
      console.log(
        '------------------------------------------------------------------------',
      );
    }
  });
}

mdLinks(path, options).then((linksObject) => {
  if (options.validate) {
    getHTTPStatus(linksObject).then((result) => {
      printLinks(result.linksObject);
    });
  } else if (options.stats) {
    getHTTPStatus(linksObject).then((result) => {
      const failStatCount = result.brokenCount;

      const uniqueLinks = [...new Set(linksObject.map((link) => link.href))]
        .length;

      const stats = {
        'Unique Links': uniqueLinks,
        'Total Links': linksObject.length,
        'Broken Links': failStatCount,
      };

      console.table(stats);
    });
  } else {
    printLinks(linksObject);
  }
});
