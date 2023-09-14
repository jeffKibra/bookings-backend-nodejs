import { IAuthor, IBook } from '../types';

export const books: IBook[] = [
  {
    name: 'Book 1',
    id: '1',
    genre: 'Fiction',
    authorId: 'a1',
  },
  {
    name: 'Book 2',
    id: '2',
    genre: 'Science',
    authorId: 'a3',
  },
  {
    name: 'Book 3',
    id: '3',
    genre: 'Poetry',
    authorId: 'a1',
  },
  {
    name: 'Book 4',
    id: '4',
    genre: 'Narrative',
    authorId: 'a2',
  },
  {
    name: 'Book 5',
    id: '5',
    genre: 'Forklore',
    authorId: 'a1',
  },
];

export const authors: IAuthor[] = [
  {
    name: 'Johnstone M',
    age: 35,
    id: 'a1',
  },
  {
    name: 'Kinuthia P',
    age: 43,
    id: 'a2',
  },
  {
    name: 'Crocodile Nyangumi',
    age: 22,
    id: 'a3',
  },
];
