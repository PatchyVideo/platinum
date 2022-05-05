const fs = require('fs/promises')
const path = require('path')

async function run() {
  const html = await fs.readFile(path.join(__dirname, '../dist/index.html'), 'utf-8')
  fs.writeFile(
    path.join(__dirname, '../functions/libs/index.ts'),
    (await fs.readFile(path.join(__dirname, '../functions/libs/index.ts'), 'utf-8'))
      .replace('\'__INDEX_HTML__\'', JSON.stringify(html)),
  )
}

run()
