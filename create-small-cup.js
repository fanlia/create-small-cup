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

const package_json_path = path.join(root, 'package.json')

if (fs.existsSync(package_json_path)) {
    console.log('package.json already existed, skip creating')
    process.exit()
}

mkdirSync('src/html')

writeFileSync('src/html/about.html', `
<h1>about</h1>
`)

writeFileSync('src/html/home.html', `
<h1>home</h1>
<p>count is <button component='counter'></button></p>
`)

writeFileSync('src/html/nav.html', `
<p>
    <a href='/' component='a'>home</a>
    <a href='/about' component='a'>about</a>
</p>
`)

writeFileSync('.gitignore', `
node_modules/
`)

writeFileSync('src/index.html', `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>small cup</title>
  </head>
  <body>
    <div app></div>
    <script type="module" src="./index.js"></script>
  </body>
</html>
`)

writeFileSync('src/components.js', `
import { a, h, link } from 'small-cup'

export default {
    a,
    counter: (el, ctx, render) => {
        el.onupdate = () => {
            el.textContent = ctx.count
        }

        el.onunload = () => {
            console.log('unloaded')
        }

        el.onclick = () => {
            ctx.count++
            render()
        }
    },
}
`)

writeFileSync('src/context.js', `
export default {
    count: 0,
}
`)

writeFileSync('src/routes.js', `
import home from 'bundle-text:./html/home.html'
import about from 'bundle-text:./html/about.html'
import nav from 'bundle-text:./html/nav.html'

export default [
    {
        name: 'home',
        path: '/',
        before: async (ctx) => {
            ctx.$root.innerHTML = \`
                \${nav}
                \${home}
            \`
        },
    },
    {
        name: 'about',
        path: '/about',
        before: async (ctx) => {
            ctx.$root.innerHTML = \`
                \${nav}
                \${about}
            \`
        },
    },
]
`)

writeFileSync('src/index.js', `
if (module.hot) {
    module.hot.accept()
}

import cup, { onpathname } from 'small-cup'

import context from './context.js'
import components from './components.js'
import routes from './routes.js'

const app = cup({
    context,
    components,
    routes,
})

onpathname(app)
`)

execSync('rm -rf node_modules/')
execSync('npm init -y')

const package = require(package_json_path)
delete package.main
delete package.scripts.test
package.scripts.start = 'parcel src/index.html'
package.scripts.build = 'parcel build src/index.html'

fs.writeFileSync(package_json_path, JSON.stringify(package, null, 2))

console.log('please wait')

execSync('npm i small-cup --registry=https://registry.npmmirror.com')
execSync('npm i -D parcel @parcel/transformer-inline-string --registry=https://registry.npmmirror.com')

console.log(`\nyou can 'npm start' now`)
