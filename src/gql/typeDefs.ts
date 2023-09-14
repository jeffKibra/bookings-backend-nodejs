const typeDefs = `#graphql
    type Book {
        id: ID
        name: String
        genre: String
        authorId: String
        author: Author
    }
    type Author {
        id: ID
        name: String
        age: Int
        books: [Book]
    }
    type Query {
        books: [Book]
        book(id:ID): Book
        authors: [Author]
        author(id:ID): Author
    }
`;

export default typeDefs;
