import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface LocalImage {
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
export class LocalStorageService {
  private readonly STORAGE_KEY = 'ice-panel-images-v1';
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  
  // Signal for reactive state
  readonly images = signal<LocalImage[]>([]);

  constructor() {
    if (this.isBrowser) {
      this.loadImages();
    }
  }

  private loadImages(): void {
    if (!this.isBrowser) return;
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.images.set(parsed);
      }
    } catch (error) {
      console.error('Error loading images from localStorage:', error);
    }
  }

  private saveImages(): void {
    if (!this.isBrowser) return;
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.images()));
    } catch (error) {
      console.error('Error saving images to localStorage:', error);
    }
  }

  async uploadImage(file: File, name: string, categoryId: string): Promise<{ id: string; url: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        const id = this.generateId();
        const fileName = `${Date.now()}_${file.name}`;
        
        const imageData: LocalImage = {
          id,
          name,
          url: base64,
          categoryId,
          fileName,
          createdAt: new Date()
        };
        
        this.images.update(prev => [...prev, imageData]);
        this.saveImages();
        
        resolve({ id, url: base64 });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  getImages(): LocalImage[] {
    return this.images();
  }

  deleteImage(id: string): void {
    this.images.update(prev => prev.filter(img => img.id !== id));
    this.saveImages();
  }

  updateImage(id: string, updates: Partial<LocalImage>): void {
    this.images.update(prev => 
      prev.map(img => img.id === id ? { ...img, ...updates } : img)
    );
    this.saveImages();
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
