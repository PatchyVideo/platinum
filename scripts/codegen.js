;(async () => {
  console.log('> GraphQL > Pre codegen')
  await exec('graphql-codegen --config ./packages/graphql/precodegen.yml')
  console.log('\n')

  console.log('> GraphQL > Process schema')
  await exec('node ./packages/graphql/scripts/processSchema.js')
  console.log('\n')

  console.log('> GraphQL > Post codegen')
  await exec('graphql-codegen --config ./packages/graphql/postcodegen.yml')
  console.log('\n')

  console.log('> GraphQL > Prettier')
  await exec('prettier --config .prettierrc.js -w ./packages/graphql/__generated__/')
  console.log('\n')
})()

function exec(cmd) {
  const child_process = require('child_process')
  return new Promise((resolve) => {
    const proc = child_process.spawn('yarn', [cmd], {
      stdio: 'inherit',
      shell: true,
    })
    proc.on('error', (e) => {
      throw e
    })
    proc.on('exit', resolve)
  })
}
