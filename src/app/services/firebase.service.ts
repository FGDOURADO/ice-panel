import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, onSnapshot } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { FlavorCategory, Title, Image } from './flavor.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private firestore = inject(Firestore);
  private storage = inject(Storage);

  // Categories
  async addCategory(category: Omit<FlavorCategory, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(this.firestore, 'categories'), category);
    return docRef.id;
  }

  async getCategories(): Promise<FlavorCategory[]> {
    const snapshot = await getDocs(collection(this.firestore, 'categories'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FlavorCategory));
  }

  async updateCategory(id: string, data: Partial<FlavorCategory>): Promise<void> {
    await updateDoc(doc(this.firestore, 'categories', id), data);
  }

  async deleteCategory(id: string): Promise<void> {
    await deleteDoc(doc(this.firestore, 'categories', id));
  }

  // Titles
  async addTitle(title: Omit<Title, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(this.firestore, 'titles'), title);
    return docRef.id;
  }

  async getTitles(): Promise<Title[]> {
    const snapshot = await getDocs(collection(this.firestore, 'titles'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Title));
  }

  async updateTitle(id: string, data: Partial<Title>): Promise<void> {
    await updateDoc(doc(this.firestore, 'titles', id), data);
  }

  async deleteTitle(id: string): Promise<void> {
    await deleteDoc(doc(this.firestore, 'titles', id));
  }

  // Images
  async uploadImage(file: File, name: string, categoryId: string): Promise<{ id: string; url: string }> {
    console.log('FirebaseService.uploadImage called:', { fileName: file.name, name, categoryId });
    
    try {
      // Upload to Firebase Storage
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      console.log('Uploading to storage:', fileName);
      
      const storageRef = ref(this.storage, `images/${fileName}`);
      const snapshot = await uploadBytes(storageRef, file);
      console.log('Storage upload successful');
      
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('Download URL:', downloadURL);

      // Save metadata to Firestore
      const imageData = {
        name,
        url: downloadURL,
        categoryId,
        fileName,
        createdAt: new Date()
      };
      
      console.log('Saving to Firestore:', imageData);
      const docRef = await addDoc(collection(this.firestore, 'images'), imageData);
      console.log('Firestore save successful:', docRef.id);
      
      return {
        id: docRef.id,
        url: downloadURL
      };
    } catch (error) {
      console.error('FirebaseService.uploadImage error:', error);
      throw error;
    }
  }

  async getImages(): Promise<Image[]> {
    console.log('FirebaseService.getImages called');
    try {
      const snapshot = await getDocs(collection(this.firestore, 'images'));
      const images = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Image));
      console.log('Images loaded from Firestore:', images);
      return images;
    } catch (error) {
      console.error('Error loading images from Firestore:', error);
      throw error;
    }
  }

  async updateImage(id: string, data: Partial<Image>): Promise<void> {
    await updateDoc(doc(this.firestore, 'images', id), data);
  }

  async deleteImage(id: string, fileName?: string): Promise<void> {
    // Delete from Firestore
    await deleteDoc(doc(this.firestore, 'images', id));
    
    // Delete from Storage if fileName is provided
    if (fileName) {
      const storageRef = ref(this.storage, `images/${fileName}`);
      await deleteObject(storageRef);
    }
  }

  // Settings
  async updateSettings(settings: any): Promise<void> {
    const settingsRef = doc(this.firestore, 'settings', 'main');
    await updateDoc(settingsRef, settings);
  }

  async getSettings(): Promise<any> {
    const snapshot = await getDocs(collection(this.firestore, 'settings'));
    if (snapshot.empty) return null;
    return snapshot.docs[0].data();
  }
}
