import { Injectable, signal, inject } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, doc, deleteDoc } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';

export interface CloudImage {
  id: string;
  name: string;
  url: string;
  categoryId: string;
  fileName: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CloudStorageService {
  private firestore = inject(Firestore);
  private storage = inject(Storage);
  
  readonly images = signal<CloudImage[]>([]);

  constructor() {
    this.loadImages();
  }

  async uploadImage(file: File, name: string, categoryId: string): Promise<{ id: string; url: string }> {
    try {
      // Upload para Firebase Storage
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const storageRef = ref(this.storage, `images/${fileName}`);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Salvar metadata no Firestore
      const imageData = {
        name,
        url: downloadURL,
        categoryId,
        fileName,
        createdAt: new Date()
      };

      const docRef = await addDoc(collection(this.firestore, 'images'), imageData);
      
      // Atualizar estado local
      const newImage: CloudImage = { id: docRef.id, ...imageData };
      this.images.update(prev => [...prev, newImage]);

      return { id: docRef.id, url: downloadURL };
    } catch (error) {
      console.error('Error uploading to cloud:', error);
      throw error;
    }
  }

  async loadImages(): Promise<void> {
    try {
      const snapshot = await getDocs(collection(this.firestore, 'images'));
      const images = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CloudImage));
      this.images.set(images);
    } catch (error) {
      console.error('Error loading images from cloud:', error);
    }
  }

  async deleteImage(imageId: string, fileName: string): Promise<void> {
    try {
      // Deletar do Firestore
      await deleteDoc(doc(this.firestore, 'images', imageId));
      
      // Deletar do Storage
      const storageRef = ref(this.storage, `images/${fileName}`);
      await deleteObject(storageRef);
      
      // Atualizar estado local
      this.images.update(prev => prev.filter(img => img.id !== imageId));
    } catch (error) {
      console.error('Error deleting from cloud:', error);
      throw error;
    }
  }
}
