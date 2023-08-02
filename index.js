const fs = require('fs');
const pathModule = require('path')
const axios = require('axios');

function getLinksFromFile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, fileContent) => {
      if (err) {
        reject(new Error(`Erro ao retornar arquivos: ${err.message}`));
      } else if (!path.endsWith('.md')) {
        reject(new Error('O caminho de entrada não corresponde a um arquivo .md'));
      } else {
        const regex = /\[([^[\]]+)\]\(([^()\s]+|\S+)?\)/g;
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
  });
}

function readDirectory(path) {
  try {
    const fileList = fs.readdirSync(path);
    const filteredList = fileList.filter((file) => pathModule.extname(file) === '.md');
    const promises = filteredList.map((file) => {
      const filePath = pathModule.join(path, file);
      return getLinksFromFile(filePath);
    });
    return Promise.all(promises);
  } catch (err) {
    console.error('Erro ao ler diretórios', err);
    return Promise.resolve([]);
  }
}


function mdLinks(path) {
  return new Promise((resolve) => {
    fs.stat(path, (err, stats) => {
      if (!err) {
        if (stats.isFile()) {
          resolve(getLinksFromFile(path));
        } else if (stats.isDirectory()) {
          readDirectory(path).then((results) => {
            const linksArray = results.reduce((accumulator, links) => accumulator.concat(links), []);
            resolve(linksArray);
          });
        }
      }
    });
  });
}


// retorna os links de um arquivo específico (como objetos)

function getHTTPStatus(linksObject) {
  let brokenCount = 0;
  const linkPromises = linksObject.map((links) => axios.get(links.href)
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
    }));

  return Promise.all(linkPromises).then((updLinks) => ({ linksObject: updLinks, brokenCount }));
}

module.exports = {
  mdLinks,
  getHTTPStatus,
  getLinksFromFile,
  readDirectory,
}


// teste computador novo 