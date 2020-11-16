;(async () => {
  console.log('> GraphQL > Codegen')
  await exec('graphql-codegen --config ./packages/graphql/codegen.yml')
  console.log('\n')

  console.log('> GraphQL > Prettier')
  await exec('prettier --config .prettierrc.js -w ./packages/graphql/__generated__/')
  console.log('\n')
})()

function exec(cmd) {
  const child_process = require('child_process')
  return new Promise((resolve) => {
    const proc = child_process.spawn('yarn', [cmd], { stdio: 'inherit', shell: true })
    proc.on('exit', resolve)
  })
}
