[![BCH compliance](https://bettercodehub.com/edge/badge/cmusv-fse/f22-ESN-SB1?branch=main&token=5f6f0501ce5ebeb66c05bcc821434f923b77bdb9)](https://bettercodehub.com/)

# README

- [README](#readme)
  - [Installation](#installation)
    - [Step 0: Install VScode extension](#step-0-install-vscode-extension)
    - [Step 1: Install npm packages](#step-1-install-npm-packages)
    - [Step 2: Install Docker](#step-2-install-docker)
    - [Step 3: Launch MongoDB](#step-3-launch-mongodb)
    - [Step 4: Lunch express server](#step-4-lunch-express-server)
    - [Step 5: Open UI via Command Line](#step-5-open-ui-via-command-line)
  - [How to...](#how-to)
  - [Workflow](#workflow)
  - [API Spec](#api-spec)
  - [Schema Design](#schema-design)
  - [Naming Convention](#naming-convention)
  - [Selected Libraries](#selected-libraries)
  - [Disclaimer](#disclaimer)

## Installation

### Step 0: Install VScode extension

[ESlint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

[Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

### Step 1: Install npm packages

```
npm install
```

or

```
yarn add
```

### Step 2: Install Docker

If you already installed Docker on your laptop, you can skip this step.

[Docker Installation Guide](https://docs.docker.com/engine/install/)

### Step 3: Launch MongoDB

Start Docker Compose:

```
docker-compose -f mongo.yml up -d
```

Terminate Docker Compose:

```
docker-compose -f mongo.yml down
```

### Step 4: Lunch express server

```
npm run start
```

or

```
yarn start
```

### Step 5: Open UI via Command Line

Express Server:

```
open http://localhost:5566
```

Mongo-express:

```
open http://localhost:8081
```

## How to...

[How to...](/doc/how_to.md)

## Workflow

[Workflow - GitHub Flow](/doc/workflow.md)

## API Spec

[View Spec Here](https://hackmd.io/giLSlaDvQ1OYTjWPx2dOxA?both)

# Schema Design

[View Schema Design Here](https://hackmd.io/@hUJN9SiyTvK3fyE7k32QGQ/rJvM1L-fs)

## Naming Convention

[Naming Convention](/doc/naming_convention.md)

## Selected Libraries

[Selected Library](/doc/selected_libraries.md)

## Disclaimer

YOU ARE _NOT_ PERMITTED TO SHARE THIS REPO OUTSIDE THIS GITHUB ORG. YOU ARE _NOT_ PERMITTED TO FORK THIS REPO UNDER ANY CIRCUMSTANCES. YOU ARE _NOT_ PERMITTED TO CREATE ANY PUBLIC REPOS INSIDE THE CMUSV-FSE ORGANIZATION. YOU SHOULD HAVE LINKS FROM THIS README FILE TO YOUR PROJECT DOCUMENTS, SUCH AS YOUR REST API SPECS AND YOUR ARCHITECTURE DOCUMENT. _IMPORTANT_: MAKE SURE TO CHECK AND UPDATE YOUR LOCAL GIT CONFIGURATION IN ORDER TO MATCH YOUR LOCAL GIT CREDENTIALS TO YOUR SE-PROJECT GITHUB CREDENTIALS (COMMIT USING THE SAME EMAIL ASSOCIATED WITH YOUR GITHUB ACCOUNT): OTHERWISE YOUR COMMITS WILL NOT BE INCLUDED IN GITHUB STATISTICS AND REPO AUDITS WILL UNDERESTIMATE YOUR CONTRIBUTION.
