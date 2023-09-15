import _ from 'lodash';
import { composeResolvers } from '@graphql-tools/resolvers-composition';
import { GraphQLFieldResolver } from 'graphql';
//
import queryResolvers from './query';
import mutationResolvers from './mutation';
//
import resolversComposition from './resolversComposition';
//
import { IGQLContext } from '../../types';
//

//

const resolvers = {
  Query: queryResolvers,
  Mutation: mutationResolvers,

  // Book: {
  //   author(book: Record<string, string>, args: { id: string }) {
  //     console.log('Author decendant of Book', { book, args });

  //     const author = _.find(authors, { id: book?.authorId });

  //     return author;
  //   },
  // },
};

const composedResolvers = composeResolvers(resolvers, resolversComposition);

export default composedResolvers;
