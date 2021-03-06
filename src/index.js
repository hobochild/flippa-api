require('dotenv').config()
const fs = require('fs')
const path = require('path')
const debug = require('debug')('server')
const { GraphQLServer } = require('graphql-yoga')

const DB = require('./db')
const resolvers = require('./resolvers')
const { middleware } = require('./auth')

const start = async () => {
  try {
    const db = await DB.sync({ force: false })

    const schemaFile = path.join(__dirname, 'schema.graphql')
    const typeDefs = fs.readFileSync(schemaFile, 'utf8')

    const options = {
      disableSubscriptions: true, // same as default value
      port: 8080,
      playgroundEndpoint: '/playground',
      disablePlayground: false // same as default value
    }

    const context = ({ request }) => {
      return { db, user: request.user }
    }

    const server = new GraphQLServer({ typeDefs, resolvers, context, options })
    server.express.use((req, res, next) => {
      debug(req.headers)
      next()
    })
    server.express.use(middleware)
    server.start(() => debug(`Server is running on localhost:${options.port}`))
  } catch (err) {
    throw err
  }
}

start()
