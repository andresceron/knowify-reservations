import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  DocumentData,
  onSnapshot,
  DocumentReference,
  runTransaction
} from '@angular/fire/firestore';
import { Observable, from, map, Subject, finalize, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  constructor(private firestore: Firestore) { }

  public addDocument(collectionName: string, data: DocumentData): Observable<string> {
    const collectionRef = collection(this.firestore, collectionName);
    const docRef = doc(collectionRef);
    const id = docRef.id;
    const dataWithId = { ...data, id };

    return from(setDoc(docRef, dataWithId)).pipe(
      map(() => id)
    );
  }

  public getDocument<T>(collectionName: string, id: string): Observable<T | null> {
    const docRef = doc(this.firestore, collectionName, id);
    return from(getDoc(docRef)).pipe(
      map(docSnap => docSnap.exists() ? docSnap.data() as T : null)
    );
  }

  public getCollection<T>(collectionName: string): Observable<T[]> {
    const collectionRef = collection(this.firestore, collectionName);
    return from(getDocs(collectionRef)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as unknown as T))
    );
  }

  public listenToDocument<T>(path: string): Observable<T | null> {
    const docRef = doc(this.firestore, path) as DocumentReference<DocumentData>;
    const subject = new Subject<T | null>();

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          subject.next({ id: docSnap.id, ...docSnap.data() } as unknown as T);
        } else {
          subject.next(null);
        }
      },
      (error) => {
        console.error('Error listening to document:', error);
        subject.error(error);
      }
    );

    return subject.asObservable().pipe(
      finalize(() => {
        unsubscribe();
      })
    );
  }

  public getDocRef(path: string): any {
    return doc(this.firestore, path);
  }

  public getCollectionRef(path: string): any {
    return collection(this.firestore, path);
  }

  public runTransaction<T>(updateFn: (transaction: any) => Promise<T>): Observable<T> {
    try {
      return from(runTransaction(this.firestore, updateFn)).pipe(
        catchError(error => {
          console.error('Error running transaction:', error);
          throw error;
        })
      );
    } catch (error) {
      console.error('Error in runTransaction:', error);
      throw error;
    }
  }
}
