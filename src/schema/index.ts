import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
} from 'graphql';
import _ from 'lodash';
//
import { authors, books } from './dummyData';

const BookTypeRoot = new GraphQLObjectType({
  name: 'Book',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    genre: { type: GraphQLString },
    authorId: { type: GraphQLString },
    author: {
      type: AuthorType,
      resolve: (parent, args) => {
        //parent-in this case its the book retrieved
        console.log('author as sub-set of book', { parent });

        return _.find(authors, { id: parent?.authorId });
      },
    },
  }),
});

const BookType = BookTypeRoot;

const AuthorTypeRoot = new GraphQLObjectType({
  name: 'Author',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    age: { type: GraphQLInt },
    // books: {
    //   type: new GraphQLList(BookTypeRoot),
    //   resolve: (parent, args) => {
    //     return _.filter(books, { id: parent?.id });
    //   },
    // },
  }),
});

const AuthorType = AuthorTypeRoot;

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    book: {
      type: BookType,
      args: { id: { type: GraphQLID } },
      resolve: (parent, args) => {
        //write code to get data
        console.log('root book query', { parent });

        return _.find(books, { id: args?.id });
      },
    },
    author: {
      type: AuthorType,
      args: { id: { type: GraphQLID } },
      resolve: (parent, args) => {
        console.log('root author query', { parent });

        return _.find(authors, { id: args?.id });
      },
    },
  },
});

const schema = new GraphQLSchema({
  query: RootQuery,
});

export default schema;
