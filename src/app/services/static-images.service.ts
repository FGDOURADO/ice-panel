import { Injectable, signal } from '@angular/core';

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
  // Signal for reactive state
  readonly images = signal<StaticImage[]>([
    // Exemplo de imagens - você pode adicionar mais aqui
    {
      id: '1',
      name: 'Sorvete de Chocolate',
      url: '/assets/images/chocolate.jpg',
      categoryId: 'traditional'
    },
    {
      id: '2', 
      name: 'Sorvete de Morango',
      url: '/assets/images/morango.jpg',
      categoryId: 'traditional'
    },
    {
      id: '3',
      name: 'Sorvete Vegano',
      url: '/assets/images/vegano.jpg', 
      categoryId: 'vegan'
    }
  ]);

  // Métodos para gerenciar imagens estáticas
  addImage(name: string, url: string, categoryId: string): void {
    const id = this.generateId();
    const newImage: StaticImage = { id, name, url, categoryId };
    this.images.update(prev => [...prev, newImage]);
  }

  removeImage(id: string): void {
    this.images.update(prev => prev.filter(img => img.id !== id));
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}