import _ from 'lodash';
import { composeResolvers } from '@graphql-tools/resolvers-composition';
import { GraphQLFieldResolver } from 'graphql';
//
//
import resolversComposition from './resolversComposition';
//
import { IBook, IGQLContext } from '../../types';
//
import { authors, books } from '../../schema/dummyData';

type BooksResolver = GraphQLFieldResolver<
  unknown,
  IGQLContext,
  unknown,
  IBook[]
>;
//
type IRootResolver = {
  [x: string]: unknown;
  books: BooksResolver;
};

const queryResolvers: IRootResolver = {
  books(parent: unknown, args: unknown) {
    console.log('books', { args });

    return books;
  },
  book: (
    parent: unknown,
    args: { id: string },
    context: Record<string, unknown>
  ) => {
    console.log(`book: ${args?.id}`, { args, parent, context });

    const book = _.find(books, { id: args?.id });

    return book;
  },
  authors: (parent: unknown, args: null) => {
    console.log('authors', { args });

    return authors;
  },
  author: (parent: unknown, args: { id: string }) => {
    console.log(`author: ${args?.id}`, { args, parent });

    return _.find(authors, { id: args?.id });
  },
};

const resolvers = {
  Query: queryResolvers,
  Book: {
    author(book: Record<string, string>, args: { id: string }) {
      console.log('Author decendant of Book', { book, args });

      const author = _.find(authors, { id: book?.authorId });

      return author;
    },
  },
  Author: {
    books(author: Record<string, string>, args: { id: string }) {
      console.log('Author decendant of Book', { author, args });

      const authorBooks = _.filter(books, { authorId: author?.id });

      return authorBooks;
    },
  },
};

const composedResolvers = composeResolvers(resolvers, resolversComposition);

export default composedResolvers;
