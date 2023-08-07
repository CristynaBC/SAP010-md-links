const path = require('path');

const {
  describe,
  it,
  expect,
} = require('@jest/globals');

const axios = require('axios');

const {
  mdLinks,
  getHTTPStatus,
} = require('../index');

jest.mock('axios');

describe('mdLinks - path ending with .md file', () => {
  it('should resolve with an empty array when the file contains no URLs', async () => {
    const result = await mdLinks('./test/vazio.md');
    expect(result).toEqual([]);
  });

  it('should throw new error when the path is not valid', async () => {
    await expect(mdLinks('invalid.md')).rejects.toThrowError(
      "Erro ao verificar o caminho: ENOENT: no such file or directory, stat 'invalid.md",
    );
  });

  it('should throw new error when it`s not able to read the file', async () => {
    await expect(mdLinks('invalid.md')).rejects.toThrowError(
      "Erro ao verificar o caminho: ENOENT: no such file or directory, stat 'invalid.md",
    );
  });
  it('should resolve with an array of objects containing the URLs wit href, text, file', async () => {
    const result = await mdLinks('./test/markdown.md');
    expect(result).toEqual([
      {
        file: './test/markdown.md',
        href: 'https://www.google.com/',
        text: 'google',
      },
      {
        file: './test/markdown.md',
        href: 'https://www.facebook.com/',
        text: 'facebook',
      },
      {
        file: './test/markdown.md',
        href: 'https://www.github.com/',
        text: 'gitHub',
      },
      {
        file: './test/markdown.md',
        href: 'https://www.github.com/',
        text: 'gitHub',
      },
      {
        file: './test/markdown.md',
        href: 'https://www.github.com/',
        text: 'gitHub',
      },
      {
        file: './test/markdown.md',
        href: 'https://www.ashdkajsdla.com/',
        text: 'link quebrado',
      },
      {
        file: './test/markdown.md',
        href: 'https://123milhas.com/',
        text: '123 milhas',
      },
    ]);
  });
});

describe('mdLinks path leading to directory', () => {
  const testDir = path.join(__dirname, 'test-dir');

  it('should return the links in all the .md files in the directory', async () => {
    const result = await mdLinks(testDir);
    expect(result).toEqual([
      {
        file: '/Users/mac/Documents/laboratoria/SAP010-md-links/test/test-dir/test1.md',
        href: 'https://www.example.com/link1',
        text: 'Link 1',
      },
      {
        file: '/Users/mac/Documents/laboratoria/SAP010-md-links/test/test-dir/test1.md',
        href: 'https://www.example.com/link2',
        text: 'Link 2',
      },
      {
        file: '/Users/mac/Documents/laboratoria/SAP010-md-links/test/test-dir/test2.md',
        href: 'https://www.example.com/link3',
        text: 'Link 3',
      },
      {
        file: '/Users/mac/Documents/laboratoria/SAP010-md-links/test/test-dir/test2.md',
        href: 'https://www.example.com/link4',
        text: 'Link 4',
      },
    ]);
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
