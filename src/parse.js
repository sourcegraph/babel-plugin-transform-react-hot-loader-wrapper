const { readFileSync } = require('fs')
const { parse } = require('babylon')

console.log(JSON.stringify(parse(readFileSync(process.argv[2], 'utf8'), { sourceType: 'module' }), null, 2))
