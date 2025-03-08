import { WritableKeysOf } from 'type-fest';

export type WritableItem<T extends object> = Pick<T, WritableKeysOf<T>>;
