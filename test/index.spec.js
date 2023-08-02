const { describe, it, expect } = require('@jest/globals');
const fs = require('fs');

const path = require('path');

const axios = require('axios');

const {
  mdLinks,
  getHTTPStatus,
  getLinksFromFile,
  readDirectory,
} = require('../index');

jest.mock('axios');

jest.mock('fs');

describe('readDirectory', () => {
  it('should call getLinksFromFile for each .md file', (done) => {
    const fileList = ['file1.md', 'file2.txt', 'file3.md'];
    fs.readdirSync.mockReturnValue(fileList);

    // Implementação alternativa para getLinksFromFile
    const mockGetLinksFromFile = jest.fn().mockReturnValue(Promise.resolve([]));

    const directoryPath = '/path/example/directory';
    readDirectory(directoryPath, mockGetLinksFromFile).then(() => {
      // Verificar se getLinksFromFile foi chamada corretamente
      expect(mockGetLinksFromFile).toHaveBeenCalledTimes(2);
      expect(mockGetLinksFromFile).toHaveBeenCalledWith(path.join(directoryPath, 'file1.md'));
      expect(mockGetLinksFromFile).toHaveBeenCalledWith(path.join(directoryPath, 'file3.md'));

      done();
    });
  });
});

describe('getLinksFromFile', () => {
  describe('Test to return links from a .md file', () => {
    it('Should return the links found in a .md file', async () => {
      const fileContent = `
        [Link 1](https://www.link1.com)
        [Link 2](https://www.link2.com)
        [Link 3](https://www.link3.com)
      `;

      fs.readFile = jest.fn().mockImplementation((fakePath, callback) => {
        callback(null, Buffer.from(fileContent));
      });

      const fakePath = 'fakePath.md';
      const links = await getLinksFromFile(fakePath);

      expect(links).toHaveLength(3);

      expect(links[0]).toEqual({
        href: 'https://www.link1.com',
        text: 'Link 1',
        file: fakePath,
      });

      expect(links[1]).toEqual({
        href: 'https://www.link2.com',
        text: 'Link 2',
        file: fakePath,
      });

      expect(links[2]).toEqual({
        href: 'https://www.link3.com',
        text: 'Link 3',
        file: fakePath,
      });
    });
  });

  describe('Test to return an error when the file is not .md', () => {
    it('Should return an error when the file is not .md', async () => {
      const fileContent = '[Link 1](https://www.link1.com)';

      fs.readFile = jest.fn().mockImplementation((fakePath, callback) => {
        callback(null, Buffer.from(fileContent));
      });

      const fakePath = 'fakePath.txt';
      await expect(getLinksFromFile(fakePath)).rejects.toThrowError(
        'O caminho de entrada não corresponde a um arquivo .md',
      );
    });
  });

  describe('Test to return an errorreading the file', () => {
    it('Should return an error when an error occurs while reading the file', async () => {
      fs.readFile = jest.fn().mockImplementation((fakePath, callback) => {
        callback(new Error('Erro ao ler o arquivo'));
      });

      const fakePath = 'fakePath.md';
      await expect(getLinksFromFile(fakePath)).rejects.toThrowError(
        'Erro ao retornar arquivos: Erro ao ler o arquivo',
      );
    });
  });
});

describe('mdLinks', () => {
  it('should be a function', () => {
    expect(typeof mdLinks).toBe('function');
  });
  it('should return a Promise', () => {
    const result = mdLinks('fakePath');
    expect(result instanceof Promise).toBe(true);
  });
});

describe('getHTTPStatus', () => {
  it('should be a function', () => {
    expect(typeof getHTTPStatus).toBe('function');
  });
  it('should return correct status for successful HTTP requests', async () => {
    const linksObject = [
      { href: 'https://www.example.com/link1' },
      { href: 'https://www.example.com/link2' },
    ];

    axios.get.mockResolvedValueOnce({ status: 200 });

    axios.get.mockResolvedValueOnce({ status: 301 });

    const result = await getHTTPStatus(linksObject);

    expect(result.linksObject).toEqual([
      { href: 'https://www.example.com/link1', status: 200, ok: 'Ok' },
      { href: 'https://www.example.com/link2', status: 301, ok: 'FAIL' },
    ]);

    expect(result.brokenCount).toBe(1);
  });

  it('should return correct status for failed HTTP requests', async () => {
    const linksObject = [
      { href: 'https://www.example.com/link1' },
      { href: 'https://www.example.com/link2' },
    ];

    axios.get.mockRejectedValueOnce(
      new Error('Erro ao realizar requisição HTTP'),
    );

    axios.get.mockResolvedValueOnce({ status: 200 });

    const result = await getHTTPStatus(linksObject);

    expect(result.linksObject).toEqual([
      {
        href: 'https://www.example.com/link1',
        status: 'Erro ao realizar requisição HTTP',
        ok: 'FAIL',
      },
      { href: 'https://www.example.com/link2', status: 200, ok: 'Ok' },
    ]);

    expect(result.brokenCount).toBe(1);
  });

  it('should handle an empty linksObject', async () => {
    const linksObject = [];

    const result = await getHTTPStatus(linksObject);

    expect(result.linksObject).toEqual([]);
    expect(result.brokenCount).toBe(0);
  });
});
