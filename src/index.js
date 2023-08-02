const fs = require('fs');

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
  return new Promise((resolve) => {
    try {
      const fileList = fs.readdirSync(path);
      const filteredList = fileList.filter((file) => path.extname(file) === '.md');

      const promises = filteredList.map((file) => {
        const filePath = path.join(path, file);
        return getLinksFromFile(filePath);
      });

      Promise.all(promises).then(() => {
        resolve();
      });
    } catch (err) {
      console.error('Erro ao ler diretórios', err);
      resolve(); // Continuar resolvendo mesmo em caso de erro
    }
  });
}

function mdLinks(path) {
  return new Promise((resolve) => {
    fs.stat(path, (err, stats) => {
      if (!err) {
        if (stats.isFile()) {
          resolve(getLinksFromFile(path));
        } else if (stats.isDirectory()) {
          resolve(readDirectory(path));
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
};
