const express = require('express')
const expressGraphQL = require('express-graphql').graphqlHTTP
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull
} = require('graphql')
const app = express()

const authors = [
	{ id: 1, name: 'Budi Budiman' },
	{ id: 2, name: 'Dede Sudrajat' },
    { id: 3, name: 'Danar Rahmanto' },
    { id: 3, name: 'Idza Priyanti' }
	
]

const busways = [
	{ id: 1, name: 'Doa Ibu', authorId: 1 },
	{ id: 2, name: 'PO Budiman', authorId: 2 },
	{ id: 3, name: ' Timbul Jaya', authorId: 3 },
	{ id: 4, name: 'PO Dewi Sri', authorId: 4 }
	
]

const BusType = new GraphQLObjectType({
  name: 'Bus',
  description: 'Daftar pemilik bus',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    authorId: { type: GraphQLNonNull(GraphQLInt) },
    author: {
      type: AuthorType,
      resolve: (bus) => {
        return authors.find(author => author.id === bus.authorId)
      }
    }
  })
})

const AuthorType = new GraphQLObjectType({
  name: 'Author',
  description: 'This represents a author of a bus',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    busways: {
      type: new GraphQLList(BusType),
      resolve: (author) => {
        return busways.filter(bus => bus.authorId === author.id)
      }
    }
  })
})

const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'Root Query',
  fields: () => ({
    bus: {
      type: BusType,
      description: 'A Single Bus',
      args: {
        id: { type: GraphQLInt }
      },
      resolve: (parent, args) => busways.find(bus => bus.id === args.id)
    },
    busways: {
      type: new GraphQLList(BusType),
      description: 'List of All busways',
      resolve: () => busways
    },
    authors: {
      type: new GraphQLList(AuthorType),
      description: 'List of All Authors',
      resolve: () => authors
    },
    author: {
      type: AuthorType,
      description: 'A Single Author',
      args: {
        id: { type: GraphQLInt }
      },
      resolve: (parent, args) => authors.find(author => author.id === args.id)
    }
  })
})

const RootMutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Root Mutation',
  fields: () => ({
    addBus: {
      type: BusType,
      description: 'Add a bus',
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: (parent, args) => {
        const bus = { id: busways.length + 1, name: args.name, authorId: args.authorId }
        busways.push(bus)
        return bus
      }
    },
    addAuthor: {
      type: AuthorType,
      description: 'Add an author',
      args: {
        name: { type: GraphQLNonNull(GraphQLString) }
      },
      resolve: (parent, args) => {
        const author = { id: authors.length + 1, name: args.name }
        authors.push(author)
        return author
      }
    }
  })
})

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType
})

app.use('/graphql', expressGraphQL({
  schema: schema,
  graphiql: true
}))
app.listen(5000, () => console.log('Server Running'))