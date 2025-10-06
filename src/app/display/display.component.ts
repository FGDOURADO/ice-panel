import { Component, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDrag, CdkDropList, DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { FlavorService, Flavor, FlavorCategory, Title, Image } from '../services/flavor.service';
import { StaticImagesService, StaticImage } from '../services/static-images.service';

@Component({
  selector: 'app-display',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.css']
})
export class DisplayComponent {
  private readonly flavorService = inject(FlavorService);
  private readonly staticImagesService = inject(StaticImagesService);

  readonly grid = this.flavorService.grid;
  readonly flavors = this.flavorService.flavors;
  readonly categories = this.flavorService.categories;
  readonly titles = this.flavorService.titles;
  readonly images = this.staticImagesService.images;
  readonly settings = this.flavorService.settings;
  readonly headerGrid = this.flavorService.headerGrid;

  get columns(): number { return this.grid().columns; }
  get rows(): number { return this.grid().rows; }

  set columns(v: number) {
    const cols = Number(v);
    this.flavorService.setGridSize(cols, this.rows);
    this.flavorService.setHeaderGridSize(cols, 1);
  }
  set rows(v: number) { this.flavorService.setGridSize(this.columns, Number(v)); }

  readonly placedFlavorIds = computed(() => new Set(this.grid().cells.filter(Boolean) as string[]));
  readonly placedTitleIds = computed(() => new Set(this.headerGrid().cells.filter(Boolean) as string[]));
  readonly availableTitles = computed<Title[]>(() => this.titles().filter(t => !this.placedTitleIds().has(t.id)));
  readonly availableImages = computed<Image[]>(() => this.images().filter(i => !this.placedFlavorIds().has(i.id)));

  readonly imagesByCategory = computed(() => {
    const byCat = new Map<string, Image[]>();
    const available = this.availableImages();
    for (const i of available) {
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
  readonly cellIds = computed(() => this.grid().cells.map((_, i) => `cell-${i}`));
  readonly connectedIds = computed(() => ['image-palette', ...this.cellIds()]);
  readonly headerCellIds = computed(() => this.headerGrid().cells.map((_, i) => `header-cell-${i}`));
  readonly headerConnectedIds = computed(() => ['cat-palette', ...this.headerCellIds()]);


  nameFor(id: string | null): string {
    if (!id) return '';
    // Check if it's an image first
    const image = this.images().find(i => i.id === id);
    if (image) return image.name;
    // Fallback to flavors for backward compatibility
    return this.flavors().find(f => f.id === id)?.name ?? '';
  }

  dropToCell(event: CdkDragDrop<number, any, any>, cellIndex: number): void {
    const itemId = event.item.data as string | null;
    const fromCellIndex = typeof event.previousContainer.data === 'number' ? (event.previousContainer.data as number) : null;

    if (itemId == null && fromCellIndex == null) return;

    if (fromCellIndex != null) {
      // came from another cell: swap
      this.flavorService.swapCells(fromCellIndex, cellIndex);
      return;
    }

    if (itemId) {
      this.flavorService.placeFlavorAtCell(cellIndex, itemId);
    }
  }

  clearCell(index: number): void {
    this.flavorService.placeFlavorAtCell(index, null);
  }

  clearGrid(): void {
    if (confirm('Limpar todas as células do grid (sabores e títulos)?')) {
      this.flavorService.clearGrid();
      this.flavorService.clearHeaderGrid();
    }
  }


  // Header titles helpers
  dropHeaderToCell(event: CdkDragDrop<number, any, any>, cellIndex: number): void {
    const fromIdx = typeof event.previousContainer.data === 'number' ? (event.previousContainer.data as number) : null;
    const draggedCatId = event.item.data as string | null;
    if (fromIdx != null) {
      this.flavorService.swapHeaderCells(fromIdx, cellIndex);
      return;
    }
    if (draggedCatId) {
      this.flavorService.placeCategoryAtHeaderCell(cellIndex, draggedCatId);
    }
  }

  clearHeaderCell(index: number): void {
    this.flavorService.placeCategoryAtHeaderCell(index, null);
  }

  clearHeaderGrid(): void {
    if (confirm('Limpar todos os títulos?')) this.flavorService.clearHeaderGrid();
  }

  categoryName(categoryId: string | null): string {
    if (!categoryId) return '';
    return this.categories().find(c => c.id === categoryId)?.name ?? '';
  }

  titleName(titleId: string | null): string {
    if (!titleId) return '';
    return this.titles().find(t => t.id === titleId)?.name ?? '';
  }

  imageName(imageId: string | null): string {
    if (!imageId) return '';
    return this.images().find(i => i.id === imageId)?.name ?? '';
  }

  imageUrl(imageId: string | null): string {
    if (!imageId) return '';
    return this.images().find(i => i.id === imageId)?.url ?? '';
  }
}


