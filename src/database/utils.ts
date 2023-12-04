import { isObject } from '../shared'
import type { DataSnapshot } from 'firebase/database'
import type { _RefWithState } from '../shared'

/**
 * Convert firebase Database snapshot of a ref **that exists** into a bindable data record.
 *
 * @param snapshot
 * @return
 */
export function createRecordFromDatabaseSnapshot(
  snapshot: DataSnapshot
): VueDatabaseDocumentData<unknown> {
  if (!snapshot.exists()) return null

  const value: unknown = snapshot.val()
  return isObject(value)
    ? (Object.defineProperties(value, {
        // allow destructuring without interfering without using the `.key` property
        '.key': { value: snapshot.key },
        '.priority': { value: snapshot.priority },
        '.ref': { value: snapshot.ref },
        '.size': { value: snapshot.size },
      }) as VueDatabaseDocumentData<unknown>)
    : {
        // if the value is a primitive we can just return a regular object, it's easier to debug
        // @ts-expect-error: $value doesn't exist
        $value: value,
        '.key': snapshot.key,
        '.priority': snapshot.priority,
        '.ref': snapshot.ref,
        '.size': snapshot.size,
      }
}

export interface DatabaseSnapshotSerializer<T = unknown> {
  (snapshot: DataSnapshot): VueDatabaseDocumentData<T>
}

/**
 * Find the index for an object with given key.
 *
 * @param array
 * @param key
 * @return the index where the key was found
 */
export function indexForKey(
  array: NonNullable<VueDatabaseDocumentData>[],
  key: string | null | number
): number {
  for (let i = 0; i < array.length; i++) {
    if (array[i]['.key'] === key) return i
  }

  return -1
}

export interface _RefDatabase<T> extends _RefWithState<T, Error> {}

/**
 * Type used by default by the `serialize` option.
 */
export type VueDatabaseDocumentData<T = unknown> =
  | null
  | (T & {
      /**
       * The key (last part of the path) of the location of this DataSnapshot.The last token in a Database location is
       * considered its key. For example, "ada" is the key for the /users/ada/ node. Accessing the key on any
       * DataSnapshot will return the key for the location that generated it. However, accessing the key on the root URL
       * of a Database will return null.
       */
      readonly '.key': string
      /**
       * The priority value of the data in this DataSnapshot.Applications need not use priority but can order
       * collections by ordinary properties.
       */
      readonly '.priority': string
      /**
       * The location of this document data.
       */
      readonly '.ref': string
      /**
       * The number of child properties of this document data.
       */
      readonly '.size': string
    })

/**
 * Same as VueDatabaseDocumentData but for a query.
 */
export type VueDatabaseQueryData<T = unknown> = Array<
  NonNullable<VueDatabaseDocumentData<T>>
>
