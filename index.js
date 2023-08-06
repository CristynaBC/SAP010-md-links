const fs = require('fs');
const pathModule = require('path');
const axios = require('axios');

function mdLinks(path) {
  return new Promise((resolve, reject) => {
    fs.stat(path, (err, stats) => {
      if (err) {
        reject(new Error(`Erro ao verificar o caminho: ${err.message}`));
      } else if (stats.isFile() && path.endsWith('.md')) {
        const regex = /\[([^[\]]+)\]\(([^()\s]+|\S+)?\)/g;
        fs.readFile(path, 'utf8', (readErr, fileContent) => {
          if (!readErr) {
            const strFiles = fileContent.toString();
            const links = [];

            const matches = [...strFiles.matchAll(regex)];

            matches.forEach((match) => {
              const [, text, href] = match;
              const link = {
                href,
                text: text.replace(/[\r\n]+/g, '').trim(),
                file: path,
              };
              links.push(link);
            });

            resolve(links);
          }
        });
      } else if (stats.isDirectory()) {
        try {
          const fileList = fs.readdirSync(path);
          const filteredList = fileList.filter(
            (file) => pathModule.extname(file) === '.md'
          );
          const promises = filteredList.map((file) =>
            mdLinks(pathModule.join(path, file))
          );
          Promise.all(promises)
            .then((results) => {
              const linksArray = results.reduce(
                (accumulator, links) => accumulator.concat(links),
                []
              );
              resolve(linksArray);
            })
            .catch((error) => {
              reject(new Error(`Erro ao processar promessas no diretório ${path}: ${error.message}`));
            });
        } catch (error) {
          reject(new Error(`Erro ao ler o diretório: ${path}: ${error.message}`));
        }
      } else {
        resolve([]);
      }
    });
  });
}

// retorna os links de um arquivo específico (como objetos)

function getHTTPStatus(linksObject) {
  let brokenCount = 0;
  const linkPromises = linksObject.map((links) =>
    axios
      .get(links.href)
      .then((response) => {
        const updatedLinks = { ...links, status: response.status };
        if (response.status >= 200 && response.status < 300) {
          updatedLinks.ok = 'Ok';
        } else if (response.status >= 300) {
          updatedLinks.ok = 'FAIL';
          brokenCount += 1;
        }
        return updatedLinks;
      })
      .catch(() => {
        const updatedLinks = { ...links };
        updatedLinks.status = 'Erro ao realizar requisição HTTP';
        updatedLinks.ok = 'FAIL';
        brokenCount += 1;
        return updatedLinks;
      })
  );

  return Promise.all(linkPromises).then((updLinks) => ({
    linksObject: updLinks,
    brokenCount,
  }));
}

module.exports = {
  mdLinks,
  getHTTPStatus,
};

// teste computador novo
// teste 2
