togowl
======

[![Actions Status](https://github.com/tadashi-aikawa/togowl/workflows/Tests/badge.svg)](https://github.com/tadashi-aikawa/togowl/actions)
[![codecov](https://codecov.io/gh/tadashi-aikawa/togowl/branch/master/graph/badge.svg)](https://codecov.io/gh/tadashi-aikawa/togowl)

<img src="./static/icon.png" width="240" />

Togowl is task and life management tools for next generation owls.  
It integrates with Toggl, Todoist and Slack.

<div style="display: flex;">
  <img src="https://cdn.svgporn.com/logos/typescript-icon.svg" width="60" />
  <img src="https://cdn.svgporn.com/logos/nuxt.svg" width="60" />
  <img src="https://cdn.svgporn.com/logos/vuetifyjs.svg" width="60" />
  <img src="https://cdn.svgporn.com/logos/firebase.svg" width="60" />
</div>


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
