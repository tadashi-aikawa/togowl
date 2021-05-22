<h1 align="center">
    Togowl
</h1>

<p align="center">
    <img alt="Togowl" src="./static/icon.png?raw=true" width="240" />
</p>

<p align="center">
Togowl is task and life management tools for next generation owls.  
</p>
<p align="center">
It integrates with Toggl, Todoist, and Slack unofficially.
</p>

<p align="center">
  <a href="https://github.com/tadashi-aikawa/togowl/actions">
    <img alt="Tests" src="https://github.com/tadashi-aikawa/togowl/workflows/Tests/badge.svg" />
  </a>
  <a href="https://codecov.io/gh/tadashi-aikawa/togowl">
    <img alt="Coverage" src="https://codecov.io/gh/tadashi-aikawa/togowl/branch/master/graph/badge.svg" />
  </a>
</p>

<p align="center">
  <img src="https://cdn.svgporn.com/logos/typescript-icon.svg" width="60" style="margin: 0 20px;"/>
  <img src="https://cdn.svgporn.com/logos/nuxt.svg" width="60" style="margin: 0 20px;"/>
  <img src="https://cdn.svgporn.com/logos/vuetifyjs.svg" width="60" style="margin: 0 20px;"/>
  <img src="https://cdn.svgporn.com/logos/firebase.svg" width="60" style="margin: 0 20px;"/>
</p>


✅ For all
----------

`node.js >= v14` is required.

### Clone and install dependencies

```
git clone https://github.com/tadashi-aikawa/togowl.git
cd togowl
npm install
```

### Create your app on firebase

Create togowl app on firebase as different name (ex: yourtogowl)

👉 https://console.firebase.google.com/

### Create `.firebase.config.json`

Please copy `.firebase.config.sample.json` and edit it.

You can see in `Project Overview > Settings`


💃 Use as your service
----------------------

### Deploy

Before deploy, you need to login with your firebase account.

Ex.

```
npm install -g firebase-tools
firebase login
```

Then

```
npm run deploy
```


💻 For developers
-----------------

### Serve with hot reload at localhost:3000

```
npm run dev
```

### Tests

```
npm test
```

### Build for production and launch server

```
npm run build
npm run start
```

### e2e Test

First, you need to set environment variables.

| Name                | Description o                |
| ------------------- | ---------------------------- |
| TOGOWL_MAIL_ADDRESS | Your mail address registered |
| TOGOWL_PASSWORD     | Your password registered     |

If ok,

```
npm run build
npm run test:e2e
```


### Release (Only for )

Before release, you need to be able to deploy.  
If you can, then...

```
make release version=x.y.z
```
