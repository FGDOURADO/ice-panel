import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlavorService, FlavorCategory, Flavor, Title, Image } from '../services/flavor.service';
import { StaticImagesService } from '../services/static-images.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  constructor() {}

  addCategory(): void {
    const name = this.newCategoryName.trim();
    if (!name) return;
    this.flavorService.addCategory(name);
    this.newCategoryName = '';
  }

  renameCategory(category: FlavorCategory, name: string): void {
    const next = name.trim();
    if (!next) return;
    this.flavorService.renameCategory(category.id, next);
  }

  removeCategory(category: FlavorCategory): void {
    if (confirm(`Remover categoria "${category.name}" e suas imagens?`)) {
      this.flavorService.removeCategory(category.id);
    }
  }


  // Title management
  addTitle(): void {
    const name = this.newTitleName.trim();
    if (!name) return;
    this.flavorService.addTitle(name);
    this.newTitleName = '';
  }

  onTitleNameInput(titleId: string, value: string): void {
    this.editTitleNames.update((m) => ({ ...m, [titleId]: value }));
  }

  commitTitleName(title: Title): void {
    const pending = this.editTitleNames()[title.id];
    const next = (pending ?? title.name).trim();
    if (!next || next === title.name) return;
    this.flavorService.renameTitle(title.id, next);
  }

  removeTitle(title: Title): void {
    if (confirm(`Remover título "${title.name}"?`)) {
      this.flavorService.removeTitle(title.id);
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
  }

  moveImage(image: Image, categoryId: string): void {
    this.flavorService.moveImageToCategory(image.id, categoryId);
  }

  removeImage(image: any): void {
    if (confirm(`Remover imagem "${image.name}"?`)) {
      // Remove do StaticImagesService (dados reais)
      this.staticImagesService.removeImage(image.id);
      // Remove do grid se estiver posicionada
      this.flavorService.removeImage(image.id);
    }
  }





  readonly imagesByCategory = computed(() => {
    const byCat = new Map<string, Image[]>();
    const images = this.images();
    for (const i of images) {
      const cat = this.categories().find(c => c.id === i.categoryId);
      if (!cat) continue;
      if (!byCat.has(cat.id)) byCat.set(cat.id, []);
      byCat.get(cat.id)!.push(i);
    }
    return Array.from(byCat.entries()).map(([id, images]) => ({
      category: this.categories().find(c => c.id === id)!,
      images
    }));
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
    const newName = this.editCategoryName().trim();
    if (newName) {
      this.flavorService.updateCategory(categoryId, newName);
    }
    this.cancelCategoryEdit();
  }

  saveTitleEdit(titleId: string): void {
    const newName = this.editTitleName().trim();
    if (newName) {
      this.flavorService.updateTitle(titleId, newName);
    }
    this.cancelTitleEdit();
  }

  saveImageEdit(imageId: string): void {
    const newName = this.editImageName().trim();
    const newUrl = this.editImageUrl().trim();
    const newCategory = this.editImageCategory();
    
    if (newName && newUrl && newCategory) {
      this.staticImagesService.updateImage(imageId, newName, newUrl, newCategory);
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
}


