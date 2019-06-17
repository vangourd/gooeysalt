# gooeysalt



## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your tests
```
npm run test
```

### Lints and fixes files
```
npm run lint
```

### Run your unit tests
```
npm run test:unit
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).


## Sample Config.json

{
    "server": "salt.contoso.com",
    "port": "8000",
    "eauth": "auto"
}

### How to configure git to ignore local changes to config.json during development. 


git update-index --assume-unchanged [<file> ...]


To undo and start tracking again (if you forgot what files were untracked, see this [question](https://stackoverflow.com/questions/2363197)):
git update-index --no-assume-unchanged [<file> ...]git update-index --assume-unchanged [<file> ...]

https://stackoverflow.com/questions/3319479/can-i-git-commit-a-file-and-ignore-its-content-changes
https://git-scm.com/docs/git-update-index/