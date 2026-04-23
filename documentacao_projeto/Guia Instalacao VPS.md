# Guia de Instalação VPS

## Setor de Inteligência Artificial

Versão 2.0 - Abril 2026
## 1. Objetivo deste guia

Este guia ensina a instalar o BKPilot do zero em uma VPS Linux, com foco em Ubuntu 22.04 ou 24.04 LTS.

Ele foi escrito para uso operacional real. Isso significa que não basta instalar pacotes até parar de dar erro. O objetivo é deixar a máquina pronta para:

- rodar o projeto com estabilidade;
- executar Playwright em modo headless;
- operar as CLIs suportadas pelo projeto;
- gerar evidências e artefatos corretamente;
- reduzir erro de configuração manual.

Se você seguir este guia sem pular etapas, ao final terá uma VPS pronta para operar o BKPilot.

## 2. O que você está instalando

Ao instalar o BKPilot em uma VPS, você não está instalando apenas um projeto Node.

Na prática, está preparando uma máquina para rodar:

- o repositório do projeto;
- as dependências Node.js;
- o browser headless do Playwright;
- conversão de vídeo;
- CLIs de agente;
- geração de evidências e documentação.

Ou seja: a VPS precisa atender tanto a uma camada de automação de browser quanto a uma camada de execução de scripts e geração de artefatos.

## 3. Visão geral da stack na VPS

| Componente | Papel no ambiente |
|---|---|
| Ubuntu | sistema operacional da VPS |
| Node.js | runtime principal do projeto |
| npm | instalação de dependências e CLIs |
| Git | clonagem e atualização do repositório |
| Playwright | automação de browser |
| Chromium | browser controlado pelo Playwright |
| ffmpeg | conversão de `.webm` para `.mp4` |
| Claude Code / Codex / OpenCode | ambientes operacionais possíveis |

## 4. Requisitos mínimos da VPS

| Recurso | Mínimo | Recomendado |
|---|---|---|
| CPU | 2 vCPUs | 4 vCPUs |
| RAM | 4 GB | 8 GB |
| Disco | 20 GB SSD | 40 GB SSD |
| Sistema operacional | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |
| Rede | saída para internet | saída estável para APIs e sistemas alvo |

### 4.1 Leitura prática desses números

O mínimo serve para rodar o projeto.

O recomendado serve para rodar o projeto com margem mais segura quando:

- o Chromium headless estiver aberto;
- houver geração de vídeo;
- múltiplos processos Node estiverem ativos;
- o QA estiver fazendo mais de uma validação ou rebuild no mesmo ambiente.

## 5. Acesso inicial e usuário de operação

Evite operar o projeto como `root`. O ideal é criar um usuário dedicado.

### 5.1 Conectar via SSH

```bash
ssh root@<IP_DA_VPS>
```

### 5.2 Criar usuário dedicado

```bash
adduser bkpilot
usermod -aG sudo bkpilot
su - bkpilot
```

### 5.3 Por que isso importa

Rodar como `root` até pode parecer mais simples no início, mas aumenta risco operacional. Um ambiente de automação já tem poder suficiente; não vale ampliar isso desnecessariamente.

## 6. Atualizar o sistema

Antes de instalar qualquer dependência do projeto, atualize os pacotes do sistema.

```bash
sudo apt update
sudo apt upgrade -y
```

### Verificação

```bash
cat /etc/os-release
```

Você deve confirmar que a VPS realmente está em Ubuntu 22.04 ou 24.04.

## 7. Instalar dependências básicas do sistema

```bash
sudo apt install -y \
  curl \
  wget \
  unzip \
  build-essential \
  ca-certificates \
  gnupg \
  lsb-release \
  software-properties-common \
  git
```

### O que esse bloco resolve

Esse conjunto cobre a base de trabalho:

- download de pacotes;
- compilação de dependências nativas;
- uso de repositórios externos;
- controle de versão.

Sem isso, a instalação do restante tende a quebrar de forma fragmentada.

## 8. Instalar Node.js

O projeto roda sobre Node.js. Use uma versão LTS moderna.

### 8.1 Instalar via NodeSource

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
```

### 8.2 Verificar instalação

```bash
node -v
npm -v
```

### Resultado esperado

| Comando | Esperado |
|---|---|
| `node -v` | `v22.x.x` |
| `npm -v` | `10.x.x` ou superior |

## 9. Instalar ffmpeg

O BKPilot usa vídeo como evidência. O Playwright grava em `.webm` e o projeto converte para `.mp4` quando `ffmpeg` está disponível.

```bash
sudo apt install -y ffmpeg
```

### Verificação

```bash
ffmpeg -version
```

### Observação importante

Sem `ffmpeg`, o projeto ainda funciona. Mas a evidência fica em `.webm`, o que costuma ser menos conveniente para entrega e revisão.

## 10. Clonar o repositório

```bash
cd ~
git clone <URL_DO_REPOSITORIO> bkpilot
cd bkpilot
```

Substitua `<URL_DO_REPOSITORIO>` pela URL real do repositório.

## 11. Instalar dependências do projeto

```bash
npm install
```

### O que isso instala

| Pacote | Papel |
|---|---|
| `playwright` | automação de browser |
| `xlsx` | leitura e escrita de planilhas |
| `docx` | geração de documentos Word |
| `canvas` | gráficos e suporte visual |
| `dotenv` | leitura de variáveis de ambiente |

### Se `canvas` falhar

Algumas VPS exigem libs nativas extras.

```bash
sudo apt install -y libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev librsvg2-dev
npm install
```

## 12. Instalar dependências do browser

O Chromium headless precisa de bibliotecas de sistema que nem sempre vêm por padrão na VPS.

```bash
sudo npx playwright install-deps chromium
```

Esse passo é crítico. Sem ele, o browser pode até instalar, mas falhar ao abrir.

## 13. Instalar o Chromium do Playwright

```bash
npx playwright install chromium
```

### Teste rápido

```bash
node -e "const { chromium } = require('playwright'); (async()=>{ const b = await chromium.launch({ headless: true }); console.log('Chromium OK'); await b.close(); })()"
```

Se aparecer `Chromium OK`, a base do browser está funcional.

## 14. Instalar as CLIs operacionais

O BKPilot hoje é multi-CLI. Isso significa que a VPS pode ser preparada para mais de um ambiente operacional.

### 14.1 Claude Code

```bash
npm install -g @anthropic-ai/claude-code
```

Verificação:

```bash
claude --version
```

### 14.2 Codex

```bash
npm install -g @openai/codex
```

Verificação:

```bash
codex --version
```

### 14.3 OpenCode

```bash
npm install -g opencode-ai
```

Verificação:

```bash
opencode --version
```

### 14.4 Qual delas é obrigatória

Depende da operação da equipe.

Se o time opera majoritariamente em uma CLI, instale ao menos a principal. Se a VPS for ambiente multiuso do time, faz sentido instalar as três.

## 15. Configurar o `.env`

Crie o arquivo de ambiente a partir do template:

```bash
cp .env.example .env
nano .env
```

Preencha pelo menos:

```env
QA_PASSWORD=<senha_do_usuario_qa>
```

Dependendo da CLI e do fluxo operacional, também poderão ser necessárias chaves como:

```env
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...
```

### Regra importante

Nunca coloque senha inline no comando de execução. A senha deve vir do `.env`.

## 16. Executar o setup do projeto

O repositório já possui um `setup.sh` e ele deve ser usado.

```bash
chmod +x setup.sh
bash setup.sh
```

### O que esse passo deve resolver

O `setup.sh` existe para reduzir divergência entre instalações. Ele ajuda a:

- validar pré-requisitos;
- preparar a estrutura do projeto;
- alinhar configuração básica do ambiente.

Mesmo quando você já instalou dependências manualmente, ainda vale rodar esse passo para garantir consistência.

## 17. Rodar o Skill Converter

O BKPilot usa uma base única de skills e gera distribuições por target.

```bash
node converter/render.js --lint
node converter/render.js --build-all
```

### O que validar aqui

- as skills estão consistentes;
- os targets são gerados sem erro;
- a instalação não quebrou a cadeia de build do projeto.

## 18. Teste operacional mínimo

Depois da instalação, valide o ambiente com uma sequência curta:

```bash
node -v
npm -v
git --version
ffmpeg -version
npx playwright --version
claude --version
codex --version
```

E faça o teste de browser:

```bash
node -e "const { chromium } = require('playwright'); (async()=>{ const b = await chromium.launch({ headless: true }); console.log('Chromium OK'); await b.close(); })()"
```

## 19. Primeiro uso real

Depois de validar o ambiente:

```bash
claude
```

Ou a CLI escolhida pelo time.

A partir daí, o primeiro fluxo recomendado continua sendo:

```text
/explorar <URL> --login <email>
```

Esse primeiro teste é importante porque valida o caminho completo:

- CLI;
- projeto;
- browser;
- credencial;
- artefatos.

## 20. Checklist final

| Item | Como verificar | Esperado |
|---|---|---|
| Ubuntu atualizado | `cat /etc/os-release` | 22.04 ou 24.04 |
| Node.js | `node -v` | `v22.x.x` |
| npm | `npm -v` | versão instalada |
| Git | `git --version` | versão instalada |
| ffmpeg | `ffmpeg -version` | versão instalada |
| Playwright | `npx playwright --version` | versão instalada |
| Chromium | teste headless | `Chromium OK` |
| `.env` | `cat .env` | variável de QA preenchida |
| Skill Converter | `node converter/render.js --lint` | sem erro |
| CLI operacional | `claude --version` / `codex --version` / `opencode --version` | disponível |

## 21. Problemas comuns

### 21.1 `canvas` não instala

```bash
sudo apt install -y libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev librsvg2-dev
npm rebuild canvas
```

### 21.2 Chromium não abre

```bash
sudo npx playwright install-deps chromium
```

Se continuar falhando, revise bibliotecas do sistema e teste o browser headless isoladamente.

### 21.3 CLI não reconhecida

Se `claude`, `codex` ou `opencode` não forem encontrados, confirme:

- instalação global via npm;
- `PATH` do usuário correto;
- shell atual após a instalação.

### 21.4 `.env` ausente ou incompleto

Se a autenticação falhar logo no começo, o primeiro lugar para olhar é o `.env`.

### 21.5 Projeto instala, mas não opera

Instalar dependências não significa que a cadeia operacional está saudável. Se o projeto abre, mas não executa bem, valide na ordem:

1. browser headless;
2. `.env`;
3. skill converter;
4. CLI;
5. primeiro fluxo real com `/explorar`.

## 22. Boas práticas para VPS de operação

- use usuário dedicado;
- não rode rotina diária como `root`;
- mantenha o sistema atualizado;
- não armazene credenciais fora do `.env`;
- valide browser e CLI após qualquer atualização importante;
- mantenha espaço em disco sob observação, porque vídeos e screenshots crescem rápido.

## 23. Conclusão

Uma instalação boa do BKPilot em VPS não é só conseguir rodar `npm install`. É deixar o ambiente pronto para operar com consistência.

Se a VPS estiver corretamente preparada, você reduz:

- tempo perdido em troubleshooting básico;
- falhas de browser;
- divergência entre ambientes;
- risco de artefato incompleto;
- erro operacional do QA.

Em caso de dúvida, prefira validar cada camada em ordem: sistema, Node, browser, projeto, converter, CLI e fluxo real.

BKPilot - Setor de Inteligência Artificial
