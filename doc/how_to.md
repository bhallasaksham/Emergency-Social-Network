# How to

- [How to](#how-to)
  - [How to Config Linter on VSCode](#how-to-config-linter-on-vscode)
  - [How to Add an API](#how-to-add-an-api)
    - [Step. 1 Add an API Router](#step-1-add-an-api-router)
    - [Step. 2 Add the Controller for Router](#step-2-add-the-controller-for-router)
    - [Step. 3 Add the DAO fn (Add if Necessary)](#step-3-add-the-dao-fn-add-if-necessary)
    - [Step. 4 Add the Schema (Add if Necessary)](#step-4-add-the-schema-add-if-necessary)
    - [Step. 5 Add New Router (Add if Necessary)](#step-5-add-new-router-add-if-necessary)
  - [How to Add An UI Page](#how-to-add-an-ui-page)
    - [Step. 1 Add HTML/ JS/ CSS - Path: `/src/public/*`](#step-1-add-html-js-css---path-srcpublic)
    - [Step. 2 Hook Files into Server - Path: `/src/server/views/*`](#step-2-hook-files-into-server---path-srcserverviews)
  - [How to add new middleware](#how-to-add-new-middleware)
  - [How to Connect Socket Server from Client-Side JavaScript](#how-to-connect-socket-server-from-client-side-javascript)
  - [How to Trigger CICD](#how-to-trigger-cicd)
  - [How to Write Unit Test](#how-to-write-unit-test)

## How to Config Linter on VSCode

1. Install `ESLint`
2. Install `Prettier - Code formatter`
3. Open `setting.json` via `command + shift + p` and choose `Preferences: Open User Settings (JSON)` and use the following json config.

```json
{
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[css]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[html]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "editor.formatOnSave": true
}
```

## How to Add an API

We use MVC architecture here. The API logic will be placed at `/src/server/controllers/*`. The data schema will be defined at `/src/server/models/schema/*`. The Data Access Object (DAO) fn is defined at `/src/server/models/*`. The API router is defined in `/src/routes/*`.

### Step. 1 Add an API Router

> Router will be the one defined in our API document.

Add code in `/src/server/routes/*` (Example: [Get User API](https://github.com/cmusv-fse/f22-ESN-SB1/blob/f9e73f92897f5c3ba83db2a538b19b29393773df/src/server/routes/user.js#L13))

### Step. 2 Add the Controller for Router

> Controller plays the role to handle inbound request, it handles application business logic.

Add code in `/src/server/controllers/*` (Example: [Get User Controller](https://github.com/cmusv-fse/f22-ESN-SB1/blob/f9e73f92897f5c3ba83db2a538b19b29393773df/src/server/controllers/user.js#L3-L31))

### Step. 3 Add the DAO fn (Add if Necessary)

> A DAO fn is the one who accesses database. Define DAO fn here and prevent the access of database from other place. Another benefit of this approach is the DAO fn could be reused by multiple controllers.
>
> Add code in `/src/server/models/*` (Example: [getUser](https://github.com/cmusv-fse/f22-ESN-SB1/blob/f9e73f92897f5c3ba83db2a538b19b29393773df/src/server/models/user.js#L15-L26))

### Step. 4 Add the Schema (Add if Necessary)

> The database schema is defined here.

Add code in `/src/server/models/schema/*` (Example: [User Model](https://github.com/cmusv-fse/f22-ESN-SB1/blob/f9e73f92897f5c3ba83db2a538b19b29393773df/src/server/models/schema/user.js))

### Step. 5 Add New Router (Add if Necessary)

> Let's say we decide to add new routers instead of using [existed routers](https://github.com/cmusv-fse/f22-ESN-SB1/blob/f9e73f92897f5c3ba83db2a538b19b29393773df/src/server/util/routerConstants.js#L1-L3)

1. Add new router const in `/src/server/util/routerConstants.js` (Example: [add new **user** router](https://github.com/cmusv-fse/f22-ESN-SB1/blob/f9e73f92897f5c3ba83db2a538b19b29393773df/src/server/util/routerConstants.js#L3))
2. Add new API routing file in `/src/server/routes/YOUR_ROUTER_NAME.js` (Example: [.../routes/user.js ](https://github.com/cmusv-fse/f22-ESN-SB1/blob/f9e73f92897f5c3ba83db2a538b19b29393773df/src/server/routes/user.js))
3. Use new API routing in `/src/server/routes/index.js` (Example:[import user from './user';](https://github.com/cmusv-fse/f22-ESN-SB1/blob/f9e73f92897f5c3ba83db2a538b19b29393773df/src/server/routes/index.js#L6) + [router.use(USER_PATH, user);](https://github.com/cmusv-fse/f22-ESN-SB1/blob/f9e73f92897f5c3ba83db2a538b19b29393773df/src/server/routes/index.js#L15))

## How to Add An UI Page

We use MVC architecture here. The client-side templates and scripts are located under `/src/public/*`. The server-side code for view is located at `/src/server/views/*`

### Step. 1 Add HTML/ JS/ CSS - Path: `/src/public/*`

1. add an HTML file into `/src/public/templates`, you can include JS file into this template using `<script src="/js/YOUR_JAVASCRIPT.js"></script>` (Example: [welcome.html](https://github.com/cmusv-fse/f22-ESN-SB1/blob/f9e73f92897f5c3ba83db2a538b19b29393773df/src/public/templates/welcome.html))
2. (add if necessary) add a JS file into `/src/public/js` (Example: [welcome.js](https://github.com/cmusv-fse/f22-ESN-SB1/blob/f9e73f92897f5c3ba83db2a538b19b29393773df/src/public/js/welcome.js))
3. (add if necessary) add a CSS file into `/src/public/styles` (Example: [welcome.css](https://github.com/cmusv-fse/f22-ESN-SB1/blob/f9e73f92897f5c3ba83db2a538b19b29393773df/src/public/styles/welcome.css))

### Step. 2 Hook Files into Server - Path: `/src/server/views/*`

1. add a JS file and fn `/src/server/views` to resolve HTML file (Example: [welcome.js](https://github.com/cmusv-fse/f22-ESN-SB1/blob/f9e73f92897f5c3ba83db2a538b19b29393773df/src/server/views/welcome.js))
2. export JS fn in `/src/server/views/index.js` (Example: [index.js](https://github.com/cmusv-fse/f22-ESN-SB1/blob/f9e73f92897f5c3ba83db2a538b19b29393773df/src/server/views/index.js))
3. add const for URL path in `routerConstants.js` (Example: [routerConstants.js](https://github.com/cmusv-fse/f22-ESN-SB1/blob/f9e73f92897f5c3ba83db2a538b19b29393773df/src/server/util/routerConstants.js#L7))
4. attach file into `/src/config/server.js` (Example: [server.js](https://github.com/cmusv-fse/f22-ESN-SB1/blob/f9e73f92897f5c3ba83db2a538b19b29393773df/src/config/server.js#L23))

## How to add new middleware

[Pull Request for adding Auth Middleware](https://github.com/cmusv-fse/f22-ESN-SB1/pull/74)

## How to Connect Socket Server from Client-Side JavaScript

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.5.2/socket.io.js"></script>
<script src="/js/cookie.js"></script>
<script>
  const token = getCookie('token');
  const socket = io('http://localhost:5566', {
    auth: {token},
  });

  socket.on('public-message', (msg) => {
    // do logic here
    console.log(msg);
  });
</script>
```

## How to Trigger CICD

> TBD

## How to Write Unit Test

> TBD
