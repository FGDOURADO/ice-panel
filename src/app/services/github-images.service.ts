import { Injectable, signal } from '@angular/core';

export interface GitHubImage {
  id: string;
  name: string;
  url: string;
  categoryId: string;
}

@Injectable({
  providedIn: 'root'
})
export class GitHubImagesService {
  // Signal for reactive state
  readonly images = signal<GitHubImage[]>([
    // URLs diretas do GitHub (gratuito para sempre)
    // INSTRUÇÕES:
    // 1. Substitua SEU-USUARIO pelo seu usuário do GitHub
    // 2. Substitua NOME-DO-REPOSITORIO pelo nome do seu repositório de imagens
    // 3. Exemplo: https://raw.githubusercontent.com/felip/ice-panel-images/main/chocolate.jpg
    // 4. Para encontrar a URL: vá na imagem no GitHub → clique "Raw" → copie a URL
    
    {
      id: '1',
      name: 'Sorvete de Chocolate',
      url: 'https://raw.githubusercontent.com/SEU-USUARIO/NOME-DO-REPOSITORIO/main/chocolate.jpg',
      categoryId: 'traditional'
    },
    {
      id: '2', 
      name: 'Sorvete de Morango',
      url: 'https://raw.githubusercontent.com/SEU-USUARIO/NOME-DO-REPOSITORIO/main/morango.jpg',
      categoryId: 'traditional'
    },
    {
      id: '3',
      name: 'Sorvete Vegano',
      url: 'https://raw.githubusercontent.com/SEU-USUARIO/NOME-DO-REPOSITORIO/main/vegano.jpg', 
      categoryId: 'vegan'
    }
  ]);

  addImage(name: string, url: string, categoryId: string): void {
    const id = this.generateId();
    const newImage: GitHubImage = { id, name, url, categoryId };
    this.images.update(prev => [...prev, newImage]);
  }

  removeImage(id: string): void {
    this.images.update(prev => prev.filter(img => img.id !== id));
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}