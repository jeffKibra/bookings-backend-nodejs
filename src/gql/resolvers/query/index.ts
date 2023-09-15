const queryResolvers = {
  vehicle: (
    parent: unknown,
    args: { id: string },
    context: Record<string, unknown>
  ) => {
    console.log(`book: ${args?.id}`, { args, parent, context });

    // const book = _.find(books, { id: args?.id });

    // return book;
    return { id: args?.id };
  },
  vehicles: (
    parent: unknown,
    args: { id: string },
    context: Record<string, unknown>
  ) => {
    console.log(`book: ${args?.id}`, { args, parent, context });

    // const book = _.find(books, { id: args?.id });

    // return book;
    return { id: args?.id };
  },
};

export default queryResolvers;
