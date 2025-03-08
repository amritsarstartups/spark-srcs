import { Tagged } from 'type-fest';

export declare namespace UserModel {
  export type User = {
    id: Id;
    name: string;
  };

  export type Id = Tagged<string, 'userId'>;
}
