import { Injectable, signal } from '@angular/core';

export interface CloudinaryImage {
  id: string;
  name: string;
  url: string;
  categoryId: string;
}

@Injectable({
  providedIn: 'root'
})
export class CloudinaryImagesService {
  // Signal for reactive state
  readonly images = signal<CloudinaryImage[]>([
    // URLs do Cloudinary (gratuito até 25GB)
    {
      id: '1',
      name: 'Sorvete de Chocolate',
      url: 'https://res.cloudinary.com/SEU-CLOUD/image/upload/v1234567890/sorvete-chocolate.jpg',
      categoryId: 'traditional'
    },
    {
      id: '2', 
      name: 'Sorvete de Morango',
      url: 'https://res.cloudinary.com/SEU-CLOUD/image/upload/v1234567890/sorvete-morango.jpg',
      categoryId: 'traditional'
    },
    {
      id: '3',
      name: 'Sorvete Vegano',
      url: 'https://res.cloudinary.com/SEU-CLOUD/image/upload/v1234567890/sorvete-vegano.jpg', 
      categoryId: 'vegan'
    }
  ]);

  addImage(name: string, url: string, categoryId: string): void {
    const id = this.generateId();
    const newImage: CloudinaryImage = { id, name, url, categoryId };
    this.images.update(prev => [...prev, newImage]);
  }

  removeImage(id: string): void {
    this.images.update(prev => prev.filter(img => img.id !== id));
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
