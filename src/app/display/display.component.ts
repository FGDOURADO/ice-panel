import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CdkDrag, CdkDropList, DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { FlavorService } from '../services/flavor.service';
import { StaticImagesService } from '../services/static-images.service';

@Component({
  selector: 'app-display',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DragDropModule],
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.css']
})
export class DisplayComponent {
  private readonly flavorService = inject(FlavorService);
  private readonly staticImagesService = inject(StaticImagesService);

  readonly grid = this.flavorService.grid;
  readonly headerGrid = this.flavorService.headerGrid;
  readonly images = this.staticImagesService.images;
  readonly categories = this.flavorService.categories;
  readonly titles = this.flavorService.titles;

  // Estado de mudanças
  readonly hasChanges = signal(false);
  private lastSavedState: string = '';


  get columns(): number { return this.grid().columns; }
  get rows(): number { return this.grid().rows; }

  set columns(v: number) {
    this.flavorService.setGridColumns(v);
    this.flavorService.setHeaderGridSize(v, 1);
  }

  set rows(v: number) {
    this.flavorService.setGridRows(v);
  }

  readonly imagesByCategory = computed(() => {
    const byCat = new Map<string, any[]>();
    for (const image of this.images()) {
      const cat = this.categories().find(c => c.id === image.categoryId);
      if (!cat) continue;
      if (!byCat.has(cat.id)) byCat.set(cat.id, []);
      byCat.get(cat.id)!.push(image);
    }
    return Array.from(byCat.entries()).map(([id, images]) => ({
      category: this.categories().find(c => c.id === id)!,
      images
    }));
  });

  // Get available images (not used in grid)
  readonly availableImages = computed(() => {
    const usedImageIds = new Set(this.grid().cells.filter(id => id !== null));
    return this.images().filter(image => !usedImageIds.has(image.id));
  });

  // Get available images by category (not used in grid)
  readonly availableImagesByCategory = computed(() => {
    const usedImageIds = new Set(this.grid().cells.filter(id => id !== null));
    const byCat = new Map<string, any[]>();
    
    for (const image of this.images()) {
      if (usedImageIds.has(image.id)) continue; // Skip used images
      
      const cat = this.categories().find(c => c.id === image.categoryId);
      if (!cat) continue;
      if (!byCat.has(cat.id)) byCat.set(cat.id, []);
      byCat.get(cat.id)!.push(image);
    }
    
    return Array.from(byCat.entries()).map(([id, images]) => ({
      category: this.categories().find(c => c.id === id)!,
      images
    }));
  });

  readonly cellIds = computed(() => this.grid().cells.map((_, i) => `cell-${i}`));
  readonly connectedIds = computed(() => ['image-palette', ...this.cellIds()]);
  readonly headerCellIds = computed(() => this.headerGrid().cells.map((_, i) => `header-cell-${i}`));
  readonly headerConnectedIds = computed(() => ['title-palette', ...this.headerCellIds()]);
  readonly availableTitles = computed(() => this.titles().filter(t => !this.headerGrid().cells.includes(t.id)));

  dropToCell(event: CdkDragDrop<number, any, any>, cellIndex: number): void {
    const itemId = event.item.data as string | null;
    const fromCellIndex = typeof event.previousContainer.data === 'number' ? (event.previousContainer.data as number) : null;

    if (itemId == null && fromCellIndex == null) return;

    // Se está movendo dentro do grid
    if (fromCellIndex != null && fromCellIndex !== cellIndex) {
      this.flavorService.swapCells(fromCellIndex, cellIndex);
      this.markAsChanged();
      return;
    }

    // Se está colocando um item novo
    if (itemId) {
      this.flavorService.placeFlavorAtCell(cellIndex, itemId);
      this.markAsChanged();
    }
  }

  clearCell(index: number): void {
    this.flavorService.placeFlavorAtCell(index, null);
    this.markAsChanged();
  }


  // Métodos para títulos
  dropHeaderToCell(event: CdkDragDrop<number, any, any>, cellIndex: number): void {
    const fromIdx = typeof event.previousContainer.data === 'number' ? (event.previousContainer.data as number) : null;
    const draggedTitleId = event.item.data as string | null;
    
    // Se está movendo dentro do grid de títulos
    if (fromIdx != null && fromIdx !== cellIndex) {
      this.flavorService.swapHeaderCells(fromIdx, cellIndex);
      this.markAsChanged();
      return;
    }
    
    // Se está colocando um título novo
    if (draggedTitleId) {
      this.flavorService.placeCategoryAtHeaderCell(cellIndex, draggedTitleId);
      this.markAsChanged();
    }
  }

  clearHeaderCell(index: number): void {
    this.flavorService.placeCategoryAtHeaderCell(index, null);
    this.markAsChanged();
  }

  titleName(titleId: string | null): string {
    if (!titleId) return '';
    return this.titles().find(t => t.id === titleId)?.name ?? '';
  }

  nameFor(id: string | null): string {
    if (!id) return '';
    return this.images().find(i => i.id === id)?.name ?? '';
  }

  imageName(imageId: string | null): string {
    if (!imageId) return '';
    return this.images().find(i => i.id === imageId)?.name ?? '';
  }

  imageUrl(imageId: string | null): string {
    if (!imageId) return '';
    return this.images().find(i => i.id === imageId)?.url ?? '';
  }

  // Detectar mudanças
  private markAsChanged(): void {
    this.hasChanges.set(true);
  }

  // Salvar mudanças com confirmação
  saveChanges(): void {
    if (confirm('💾 Deseja salvar as mudanças? O visor será atualizado automaticamente.')) {
      // Salvar no localStorage
      this.flavorService.forceSave();
      this.staticImagesService.forceSave();
      
      // Atualizar estado
      this.hasChanges.set(false);
      this.lastSavedState = this.getCurrentState();
      
      // Notificar visor via BroadcastChannel
      const channel = new BroadcastChannel('ice-panel-updates');
      channel.postMessage({
        type: 'data-saved',
        timestamp: new Date().toISOString(),
        source: 'display'
      });
      channel.close();
      
      // Mostrar confirmação
      alert('✅ Mudanças salvas com sucesso! O visor foi atualizado.');
      
      console.log('💾 Mudanças salvas no display:', new Date().toLocaleTimeString());
    }
  }

  // Obter estado atual para comparação
  private getCurrentState(): string {
    return JSON.stringify({
      grid: this.grid(),
      headerGrid: this.headerGrid(),
      images: this.images()
    });
  }

  // Clear grid with confirmation
  clearGrid(): void {
    if (confirm('Limpar todas as células do grid (sabores e títulos)?')) {
      this.flavorService.clearGrid();
      this.flavorService.clearHeaderGrid();
      this.markAsChanged();
    }
  }

}
