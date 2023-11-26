#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const mkdirSync = (filepath) => {
    if (fs.existsSync(filepath)) {
        return
    }
    fs.mkdirSync(filepath, { recursive: true })
    console.log(`created ${filepath}`)
}

const writeFileSync = (filepath, data) => {
    if (fs.existsSync(filepath)) {
        return
    }
    fs.writeFileSync(filepath, data)
    console.log(`created ${filepath}`)
}

const root = process.cwd()
console.log(root)
mkdirSync('src')

const package_json_path = path.join(root, 'package.json')

if (fs.existsSync(package_json_path)) {
    console.log('package.json already existed, skip creating')
    process.exit()
}

writeFileSync('.gitignore', `
node_modules/
dist/
`)

writeFileSync('index.html', `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>small cup</title>
  </head>
  <body>
    <div app></div>
    <script type="module" src="src/index.js"></script>
  </body>
</html>
`)

writeFileSync('src/index.js', `

import { render, mount } from 'small-cup'

const counter = {
  onload: (el, ctx, dom) => {
    el.onupdate = () => {
      el.textContent = ctx.count
    }
    el.onunload = () => {
      console.log('unload counter')
    }
    el.onclick = () => {
      ctx.count++
      dom.update()
    }
  },
}

const nav = {
  template: \`
<a href='#/'>home</a>
<a href='#/about'>about</a>
  \`,
  onload: (el) => {
    const hash = location.hash || '#/'
    for (const a of el.querySelectorAll('a')) {
      if (a.hash === hash) {
        a.style.color = 'red'
      }
    }
  },
}

const home = {
  template: \`
    <p component='nav'></p>
    <h1>home</h1>
    <p><button component='counter'></button></p>
  \`,
  components: {
    nav,
    counter,
  },
}

const about = {
  template: \`
    <p component='nav'></p>
    <h1>about</h1>
  \`,
  components: {
    nav,
  },
}

const router = {
  onload: (el, ctx) => {
    const hash = location.hash
    let component = home
    switch (location.hash) {
      case "#/home": {
        component = home
        break
      }
      case "#/about": {
        component = about
        break
      }
    }
    return component
  },
}

const context = {
  count: 0,
}

const root = document.querySelector('[app]')

mount(root, router, context)
`)

execSync('rm -rf node_modules/')
execSync('npm init -y')

const package = require(package_json_path)
delete package.main
delete package.scripts.test
package.scripts.start = 'vite'
package.scripts.build = 'vite build'
package.scripts.preview = 'vite preview'

fs.writeFileSync(package_json_path, JSON.stringify(package, null, 2))

console.log('please wait')

execSync('npm i small-cup')
execSync('npm i -D vite')

console.log(`\nyou can 'npm start' now`)
