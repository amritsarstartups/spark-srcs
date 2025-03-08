import { initializeApp } from 'firebase/app';
import {
  addDoc,
  collection,
  CollectionReference,
  doc,
  DocumentData,
  DocumentReference,
  getDoc,
  getDocs,
  getFirestore,
} from 'firebase/firestore';
import { environment } from '@sml/environments';
import { from, map, mergeMap, Observable } from 'rxjs';
import * as _ from 'lodash';

export class FirebaseApiService<T extends DocumentData> {
  private readonly _app = initializeApp(environment.firebaseConfig);
  private readonly _db = getFirestore(this._app);

  protected readonly collection: CollectionReference<T, T>;

  constructor(protected readonly collectionName: string) {
    this.collection = collection(
      this._db,
      collectionName
    ) as CollectionReference<T, T>;
  }

  public post(item: DocumentData) {
    return from(addDoc(this.collection, item)).pipe(
      mergeMap((docRef) => this.getByDoc(docRef))
    );
  }

  public get(id: string) {
    return this.getByDoc(doc(this.collection, id));
  }

  public getAll() {
    return from(getDocs(this.collection)).pipe(
      map(({ docs }) =>
        _.map(docs, (doc) => ({ id: doc.id, ...doc.data() } as T))
      )
    );
  }

  public getByDoc(doc: DocumentReference) {
    return from(getDoc(doc)).pipe(map((doc) => doc.data() as T));
  }
}
