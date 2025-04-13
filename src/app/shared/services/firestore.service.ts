import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  DocumentData
} from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';

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
}
