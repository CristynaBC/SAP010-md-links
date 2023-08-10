# MD-LINKS
## 1. Introdução
O **MD-Links** é uma ferramenta de linha de comando (CLI) desenvolvida utilizando NodeJS que permite extrair links de arquivos Markdown (.md) e fornecer informações úteis sobre eles. Com essa ferramenta, você pode facilmente verificar a validade dos links e obter estatísticas sobre o número de links presentes nos arquivos.

## 2. Funcionalidades
- Extrai links de arquivos Markdown (.md).
- Verifica o status HTTP dos links através da opção `--validate`.
- Fornece estatísticas sobre os links presentes nos arquivos utilizando a opção `--stats`.
- Combinando as opções `--stats` e `--validate`, você obtém estatísticas detalhadas, incluindo o número total de links, quantos são únicos e quantos estão quebrados.

## 3. Guia de instalação e uso
### 3.1 Pré-requisitos
- Node.js
- NPM 

### 3.2 Instalação
1. Abra o terminal
2. Execute o seguinte comando para instalar o MD-Links globalmente:
```bash
npm install -g md-links-cristyna
```
### 3.3 Uso

**1. Para extrair links de um arquivo Markdown:**
```bash
md-links caminho/do/arquivo.md
```
**Exemplo de resultado:** 

![Extrair links](<img/Captura de Tela 2023-08-07 às 19.29.26.png>)

**2. Para extrair e verificar o status HTTP dos links:**

```bash
md-links caminho/do/arquivo.md --validate
``` 
**Exemplo de resultado:** 

![Links validate](<img/Captura de Tela 2023-08-07 às 19.29.09.png>)

**3. Para obter estatísticas sobre os links:**

```bash
md-links caminho/do/arquivo.md --stats
``` 
**Exemplo de resultado:** 

![Link stats](<img/Captura de Tela 2023-08-07 às 19.28.28.png>)

**4. Para obter estatísticas e validar os links:**

```bash
md-links caminho/do/arquivo.md --stats --validate
``` 
**Exemplo de resultado:** 

![Link validate and stats](<img/Captura de Tela 2023-08-07 às 19.28.41.png>)

## 4. Tecnologias utilizadas
![JAVASCRIPT ICON](https://skillicons.dev/icons?i=js,nodejs,jest,git,vscode)

## 4. Desenvolvedora

### Cristyna Becker Costa 

cristynabcosta@gmail.com

[![LINKEDIN ICON](https://skillicons.dev/icons?i=linkedin)](https://www.linkedin.com/in/cristyna-becker-costa/)
[![GITHUB ICON](https://skillicons.dev/icons?i=github)](https://github.com/CristynaBC)
