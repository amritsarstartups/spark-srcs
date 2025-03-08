import { Tagged } from 'type-fest';
import { BookAuthorModel } from './book-author.model';
import { CommonModel } from './common.model';
import { WritableItem } from './helpers';

export declare namespace BookModel {
  export type Book = {
    readonly id: Id;
    title: string;
    author: BookAuthorModel.Id;
    readonly createdAt: CommonModel.TimestampISO;
  };

  export type Id = Tagged<string, 'bookId'>;

  export type ManageBook = WritableItem<Book>;
}
