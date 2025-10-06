import { Injectable, signal } from '@angular/core';

export interface ImgurImage {
  id: string;
  name: string;
  url: string;
  categoryId: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImgurImagesService {
  // Signal for reactive state
  readonly images = signal<ImgurImage[]>([
    // URLs do Imgur (gratuito para sempre)
    // Substitua pelas suas URLs reais do Imgur
    {
      id: '1',
      name: 'Sorvete de Chocolate',
      url: 'https://i.imgur.com/abc123.jpg',
      categoryId: 'traditional'
    },
    {
      id: '2', 
      name: 'Sorvete de Morango',
      url: 'https://i.imgur.com/def456.jpg',
      categoryId: 'traditional'
    },
    {
      id: '3',
      name: 'Sorvete Vegano',
      url: 'https://i.imgur.com/ghi789.jpg', 
      categoryId: 'vegan'
    }
  ]);

  addImage(name: string, url: string, categoryId: string): void {
    const id = this.generateId();
    const newImage: ImgurImage = { id, name, url, categoryId };
    this.images.update(prev => [...prev, newImage]);
  }

  removeImage(id: string): void {
    this.images.update(prev => prev.filter(img => img.id !== id));
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}