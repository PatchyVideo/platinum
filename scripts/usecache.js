const fs = require('fs')
if (!fs.existsSync('./.cache') || fs.statSync('./.cache').isFile()) fs.mkdirSync('./.cache')
