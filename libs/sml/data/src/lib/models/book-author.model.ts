import { Tagged } from 'type-fest';

export declare namespace BookAuthorModel {
  export type BookAuthor = {
    id: Id;
    name: string;
  };

  export type Id = Tagged<string, 'bookId'>;
}
