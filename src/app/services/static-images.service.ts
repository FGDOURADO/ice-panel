import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface StaticImage {
  id: string;
  name: string;
  url: string;
  categoryId: string;
}

@Injectable({
  providedIn: 'root'
})
export class StaticImagesService {
  private static readonly STORAGE_KEY = 'ice-panel-static-images-v1';
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  // Signal for reactive state
  readonly images = signal<StaticImage[]>([]);

  constructor() {
    if (this.isBrowser) {
      this.load();
    }
  }

  private load(): void {
    try {
      const stored = localStorage.getItem(StaticImagesService.STORAGE_KEY);
      if (stored) {
        const images = JSON.parse(stored);
        this.images.set(images);
      }
    } catch (error) {
      console.error('Error loading static images from localStorage:', error);
    }
  }

  private save(): void {
    try {
      localStorage.setItem(StaticImagesService.STORAGE_KEY, JSON.stringify(this.images()));
    } catch (error) {
      console.error('Error saving static images to localStorage:', error);
    }
  }

  // Métodos para gerenciar imagens estáticas
  addImage(name: string, url: string, categoryId: string): void {
    const id = this.generateId();
    const newImage: StaticImage = { id, name, url, categoryId };
    this.images.update((prev) => [...prev, newImage]);
    this.save();
  }

  removeImage(imageId: string): void {
    this.images.update((prev) => prev.filter((i) => i.id !== imageId));
    this.save();
  }

  updateImage(imageId: string, name: string, url: string, categoryId: string): void {
    this.images.update((prev) => 
      prev.map((i) => 
        i.id === imageId 
          ? { ...i, name, url, categoryId }
          : i
      )
    );
    this.save();
  }

  private generateId(): string {
    return this.isBrowser && typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 15);
  }

  // Public method to force save (for auto-refresh)
  public forceSave(): void {
    this.save();
  }
}
