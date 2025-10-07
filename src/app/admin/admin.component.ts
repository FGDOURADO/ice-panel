import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FlavorService, FlavorCategory, Flavor, Title, Image } from '../services/flavor.service';
import { StaticImagesService } from '../services/static-images.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  readonly flavorService = inject(FlavorService);
  private readonly staticImagesService = inject(StaticImagesService);

  readonly categories = this.flavorService.categories;
  readonly flavors = this.flavorService.flavors;
  readonly titles = this.flavorService.titles;
  readonly images = this.staticImagesService.images;


  newCategoryName = '';
  newTitleName = '';
  newImageName = '';
  newImageCategoryId = '';
  newImageUrl = '';
  readonly editTitleNames = signal<Record<string, string>>({});
  readonly editImageNames = signal<Record<string, string>>({});

  // Editing state
  editingCategory = signal<string | null>(null);
  editingTitle = signal<string | null>(null);
  editingImage = signal<string | null>(null);
  editCategoryName = signal<string>('');
  editTitleName = signal<string>('');
  editImageName = signal<string>('');
  editImageUrl = signal<string>('');
  editImageCategory = signal<string>('');

  // Configurações de exibição
  readonly settings = this.flavorService.settings;
  logoUrl = '';
  titleColor = '#000000';
  showGridLines = true;

  // Busca de imagens
  readonly searchImagesTerm = signal('');

  // Método para atualizar busca de imagens
  updateImagesSearchTerm(value: string): void {
    console.log('🔍 Admin: Busca de imagens atualizada:', value);
    this.searchImagesTerm.set(value);
  }

  constructor() {
    // Inicializar configurações
    this.loadSettings();
  }

  addCategory(): void {
    const name = this.newCategoryName.trim();
    if (!name) return;
    this.flavorService.addCategory(name);
    this.newCategoryName = '';
    this.notifyVisorUpdate();
  }

  renameCategory(category: FlavorCategory, name: string): void {
    const next = name.trim();
    if (!next) return;
    this.flavorService.renameCategory(category.id, next);
    this.notifyVisorUpdate();
  }

  removeCategory(category: FlavorCategory): void {
    if (confirm(`Remover categoria "${category.name}" e suas imagens?`)) {
      this.flavorService.removeCategory(category.id);
      this.notifyVisorUpdate();
    }
  }


  // Title management
  addTitle(): void {
    const name = this.newTitleName.trim();
    if (!name) return;
    this.flavorService.addTitle(name);
    this.newTitleName = '';
    this.notifyVisorUpdate();
  }

  onTitleNameInput(titleId: string, value: string): void {
    this.editTitleNames.update((m) => ({ ...m, [titleId]: value }));
  }

  commitTitleName(title: Title): void {
    const pending = this.editTitleNames()[title.id];
    const next = (pending ?? title.name).trim();
    if (!next || next === title.name) return;
    this.flavorService.renameTitle(title.id, next);
    this.notifyVisorUpdate();
  }

  removeTitle(title: Title): void {
    if (confirm(`Remover título "${title.name}"?`)) {
      this.flavorService.removeTitle(title.id);
      this.notifyVisorUpdate();
    }
  }

  // Image management
  addImage(): void {
    const name = this.newImageName.trim();
    const url = this.newImageUrl.trim();
    const categoryId = this.newImageCategoryId;
    
    console.log('addImage called:', { name, url, categoryId });
    
    if (!name || !url || !categoryId) {
      console.log('Missing required fields:', { name, url, categoryId });
      alert('Preencha todos os campos: nome, URL e categoria');
      return;
    }

    try {
      console.log('Adding static image...');
      this.staticImagesService.addImage(name, url, categoryId);
      console.log('Image added successfully');
      
      this.newImageName = '';
      this.newImageUrl = '';
      this.newImageCategoryId = '';
      
      this.notifyVisorUpdate();
      alert('Imagem adicionada com sucesso!');
    } catch (error) {
      console.error('Error adding image:', error);
      alert('Erro ao adicionar a imagem: ' + error);
    }
  }

  onImageNameInput(imageId: string, value: string): void {
    this.editImageNames.update((m) => ({ ...m, [imageId]: value }));
  }

  commitImageName(image: Image): void {
    const pending = this.editImageNames()[image.id];
    const next = (pending ?? image.name).trim();
    if (!next || next === image.name) return;
    this.flavorService.renameImage(image.id, next);
    this.notifyVisorUpdate();
  }

  moveImage(image: Image, categoryId: string): void {
    this.flavorService.moveImageToCategory(image.id, categoryId);
    this.notifyVisorUpdate();
  }

  removeImage(image: any): void {
    if (confirm(`Remover imagem "${image.name}"?`)) {
      // Remove do StaticImagesService (dados reais)
      this.staticImagesService.removeImage(image.id);
      // Remove do grid se estiver posicionada
      this.flavorService.removeImage(image.id);
      this.notifyVisorUpdate();
    }
  }





  readonly imagesByCategory = computed(() => {
    const byCat = new Map<string, Image[]>();
    const images = this.images();
    const searchLower = this.searchImagesTerm().toLowerCase().trim();
    
    console.log('🔍 Admin: Computed imagesByCategory executado com termo:', searchLower);
    
    for (const i of images) {
      // Apply search filter
      if (searchLower && !i.name.toLowerCase().includes(searchLower)) {
        continue;
      }
      
      const cat = this.categories().find(c => c.id === i.categoryId);
      if (!cat) continue;
      if (!byCat.has(cat.id)) byCat.set(cat.id, []);
      byCat.get(cat.id)!.push(i);
    }
    
    const result = Array.from(byCat.entries()).map(([id, images]) => ({
      category: this.categories().find(c => c.id === id)!,
      images
    })).filter(group => group.images.length > 0); // Only show categories with matching images
    
    console.log('🔍 Admin: Resultado da busca de imagens:', result.length, 'categorias encontradas');
    return result;
  });

  // Métodos para edição inline
  startEditCategory(category: FlavorCategory): void {
    this.editingCategory.set(category.id);
    this.editCategoryName.set(category.name);
  }

  startEditTitle(title: Title): void {
    this.editingTitle.set(title.id);
    this.editTitleName.set(title.name);
  }

  startEditImage(image: any): void {
    this.editingImage.set(image.id);
    this.editImageName.set(image.name);
    this.editImageUrl.set(image.url);
    this.editImageCategory.set(image.categoryId);
  }

  saveCategoryEdit(categoryId: string): void {
    console.log('⚙️ Admin: saveCategoryEdit chamado para:', categoryId);
    const newName = this.editCategoryName().trim();
    if (newName) {
      console.log('⚙️ Admin: Atualizando categoria:', newName);
      this.flavorService.updateCategory(categoryId, newName);
      this.notifyVisorUpdate();
    }
    this.cancelCategoryEdit();
  }

  saveTitleEdit(titleId: string): void {
    console.log('⚙️ Admin: saveTitleEdit chamado para:', titleId);
    const newName = this.editTitleName().trim();
    if (newName) {
      console.log('⚙️ Admin: Atualizando título:', newName);
      this.flavorService.updateTitle(titleId, newName);
      this.notifyVisorUpdate();
    }
    this.cancelTitleEdit();
  }

  saveImageEdit(imageId: string): void {
    console.log('⚙️ Admin: saveImageEdit chamado para:', imageId);
    const newName = this.editImageName().trim();
    const newUrl = this.editImageUrl().trim();
    const newCategory = this.editImageCategory();
    
    if (newName && newUrl && newCategory) {
      console.log('⚙️ Admin: Atualizando imagem:', newName);
      this.staticImagesService.updateImage(imageId, newName, newUrl, newCategory);
      this.notifyVisorUpdate();
    }
    this.cancelImageEdit();
  }

  cancelCategoryEdit(): void {
    this.editingCategory.set(null);
    this.editCategoryName.set('');
  }

  cancelTitleEdit(): void {
    this.editingTitle.set(null);
    this.editTitleName.set('');
  }

  cancelImageEdit(): void {
    this.editingImage.set(null);
    this.editImageName.set('');
    this.editImageUrl.set('');
    this.editImageCategory.set('');
  }

  // Carregar configurações
  private loadSettings(): void {
    const currentSettings = this.settings();
    this.logoUrl = currentSettings.logoImageUrl;
    this.titleColor = currentSettings.titleColor;
    this.showGridLines = currentSettings.showGridLines;
  }

  // Atualizar URL da logo
  updateLogoUrl(): void {
    console.log('⚙️ Admin: Atualizando URL da logo:', this.logoUrl);
    this.flavorService.setLogoImageUrl(this.logoUrl);
    this.notifyVisorUpdate();
  }

  // Atualizar cor dos títulos
  updateTitleColor(): void {
    console.log('⚙️ Admin: Atualizando cor dos títulos:', this.titleColor);
    this.flavorService.setTitleColor(this.titleColor);
    this.notifyVisorUpdate();
  }

  // Atualizar mostrar linhas do grid
  updateShowGridLines(): void {
    console.log('⚙️ Admin: Atualizando mostrar linhas do grid:', this.showGridLines);
    this.flavorService.setShowGridLines(this.showGridLines);
    this.notifyVisorUpdate();
  }

  // Notificar visor sobre mudanças
  private notifyVisorUpdate(): void {
    console.log('⚙️ Admin: notifyVisorUpdate() chamado');
    
    // Forçar salvamento dos dados
    this.flavorService.forceSave();
    this.staticImagesService.forceSave();
    
    console.log('⚙️ Admin: Dados salvos, enviando notificação...');
    
    // Aguardar um pouco para garantir que os dados foram salvos
    setTimeout(() => {
      // Notificar visor via BroadcastChannel
      const channel = new BroadcastChannel('ice-panel-updates');
      
      const message = {
        type: 'data-saved',
        timestamp: new Date().toISOString(),
        source: 'admin'
      };
      
      console.log('⚙️ Admin: Enviando mensagem:', message);
      
      channel.postMessage(message);
      
      // Aguardar um pouco antes de fechar o canal
      setTimeout(() => {
        channel.close();
        console.log('⚙️ Admin: Canal fechado');
      }, 100);
      
      console.log('⚙️ Admin: Mudanças salvas e visor notificado:', new Date().toLocaleTimeString());
    }, 100);
  }

}


