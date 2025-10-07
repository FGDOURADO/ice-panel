import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type FlavorCategory = {
  id: string;
  name: string;
};

export type Title = {
  id: string;
  name: string;
};

export type Image = {
  id: string;
  name: string;
  url: string;
  categoryId: string;
};

export type Flavor = {
  id: string;
  name: string;
  categoryId: string;
};

export type DisplayGrid = {
  columns: number;
  rows: number;
  cells: Array<string | null>; // flavor ids placed on the grid
};

export type DisplaySettings = {
  logoImageUrl: string;
  titleColor: string;
  showGridLines: boolean;
};

@Injectable({ providedIn: 'root' })
export class FlavorService {
  private static readonly STORAGE_KEY = 'ice-panel-data-v1';
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  // signals for reactive state
  readonly categories = signal<FlavorCategory[]>([]);
  readonly flavors = signal<Flavor[]>([]);
  readonly titles = signal<Title[]>([]);
  readonly images = signal<Image[]>([]);
  readonly grid = signal<DisplayGrid>({ columns: 3, rows: 3, cells: Array(9).fill(null) });
  readonly settings = signal<DisplaySettings>({ logoImageUrl: '', titleColor: '#000000', showGridLines: true });
  readonly headerGrid = signal<DisplayGrid>({ columns: 3, rows: 1, cells: Array(3).fill(null) });

  constructor() {
    this.load();
    this.loadImagesFromStorage();
  }

  async loadImagesFromStorage(): Promise<void> {
    if (!this.isBrowser) return;
    
    try {
      console.log('Loading images from localStorage...');
      const stored = localStorage.getItem(FlavorService.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.images.set(data.images || []);
        console.log('Images loaded from localStorage');
      }
    } catch (error) {
      console.error('Error loading images from storage:', error);
    }
  }

  addCategory(name: string): void {
    const id = this.generateId();
    this.categories.update((prev) => [...prev, { id, name }]);
    this.save();
  }

  renameCategory(categoryId: string, name: string): void {
    this.categories.update((prev) => prev.map((c) => (c.id === categoryId ? { ...c, name } : c)));
    this.save();
  }

  updateCategory(id: string, newName: string): void {
    this.categories.update((prev) => prev.map((c) => (c.id === id ? { ...c, name: newName } : c)));
    this.save();
  }

  removeCategory(categoryId: string): void {
    this.categories.update((prev) => prev.filter((c) => c.id !== categoryId));
    // remove associated flavors
    const removedFlavorIds = new Set(
      this.flavors().filter((f) => f.categoryId === categoryId).map((f) => f.id)
    );
    this.flavors.update((prev) => prev.filter((f) => !removedFlavorIds.has(f.id)));
    // clear removed flavors from grid
    this.grid.update((g) => ({
      ...g,
      cells: g.cells.map((id) => (id && removedFlavorIds.has(id) ? null : id)),
    }));
    this.save();
  }

  addFlavor(name: string, categoryId: string): void {
    const id = this.generateId();
    this.flavors.update((prev) => [...prev, { id, name, categoryId }]);
    this.save();
  }

  renameFlavor(flavorId: string, name: string): void {
    this.flavors.update((prev) => prev.map((f) => (f.id === flavorId ? { ...f, name } : f)));
    this.save();
  }

  moveFlavorToCategory(flavorId: string, categoryId: string): void {
    this.flavors.update((prev) =>
      prev.map((f) => (f.id === flavorId ? { ...f, categoryId } : f))
    );
    this.save();
  }

  removeFlavor(flavorId: string): void {
    this.flavors.update((prev) => prev.filter((f) => f.id !== flavorId));
    // clear from grid
    this.grid.update((g) => ({ ...g, cells: g.cells.map((id) => (id === flavorId ? null : id)) }));
    this.save();
  }

  setGridSize(columns: number, rows: number): void {
    const total = columns * rows;
    this.grid.update((g) => {
      const nextCells = g.cells.slice(0, total);
      if (nextCells.length < total) {
        nextCells.push(...Array(total - nextCells.length).fill(null));
      }
      return { columns, rows, cells: nextCells };
    });
    this.save();
  }

  setGridColumns(columns: number): void {
    const currentGrid = this.grid();
    this.setGridSize(columns, currentGrid.rows);
  }

  setGridRows(rows: number): void {
    const currentGrid = this.grid();
    this.setGridSize(currentGrid.columns, rows);
  }

  placeFlavorAtCell(cellIndex: number, flavorId: string | null): void {
    this.grid.update((g) => {
      const cells = g.cells.slice();
      cells[cellIndex] = flavorId;
      return { ...g, cells };
    });
    this.save();
  }

  // Check if a flavor is already used in the grid
  isFlavorUsed(flavorId: string): boolean {
    return this.grid().cells.includes(flavorId);
  }

  // Get available flavors (not used in grid)
  getAvailableFlavors(): Flavor[] {
    const usedFlavorIds = new Set(this.grid().cells.filter(id => id !== null));
    return this.flavors().filter(flavor => !usedFlavorIds.has(flavor.id));
  }

  swapCells(a: number, b: number): void {
    this.grid.update((g) => {
      const cells = g.cells.slice();
      [cells[a], cells[b]] = [cells[b], cells[a]];
      return { ...g, cells };
    });
    this.save();
  }

  clearGrid(): void {
    this.grid.update((g) => ({ ...g, cells: Array(g.columns * g.rows).fill(null) }));
    this.save();
  }

  setHeaderGridSize(columns: number, rows: number): void {
    const total = columns * rows;
    this.headerGrid.update((g) => {
      const next = g.cells.slice(0, total);
      if (next.length < total) next.push(...Array(total - next.length).fill(null));
      return { columns, rows, cells: next };
    });
    this.save();
  }

  placeCategoryAtHeaderCell(cellIndex: number, categoryId: string | null): void {
    this.headerGrid.update((g) => {
      const cells = g.cells.slice();
      cells[cellIndex] = categoryId;
      return { ...g, cells };
    });
    this.save();
  }

  swapHeaderCells(a: number, b: number): void {
    this.headerGrid.update((g) => {
      const cells = g.cells.slice();
      [cells[a], cells[b]] = [cells[b], cells[a]];
      return { ...g, cells };
    });
    this.save();
  }

  clearHeaderGrid(): void {
    this.headerGrid.update((g) => ({ ...g, cells: Array(g.columns * g.rows).fill(null) }));
    this.save();
  }

  // Title management
  addTitle(name: string): void {
    const id = this.generateId();
    this.titles.update((prev) => [...prev, { id, name }]);
    this.save();
  }

  renameTitle(titleId: string, name: string): void {
    this.titles.update((prev) => prev.map((t) => (t.id === titleId ? { ...t, name } : t)));
    this.save();
  }

  updateTitle(id: string, newName: string): void {
    this.titles.update((prev) => prev.map((t) => (t.id === id ? { ...t, name: newName } : t)));
    this.save();
  }

  removeTitle(titleId: string): void {
    this.titles.update((prev) => prev.filter((t) => t.id !== titleId));
    // clear from header grid
    this.headerGrid.update((g) => ({ ...g, cells: g.cells.map((id) => (id === titleId ? null : id)) }));
    this.save();
  }

  // Image management
  addImage(name: string, url: string, categoryId: string): void {
    const id = this.generateId();
    const newImage = { id, name, url, categoryId };
    this.images.update((prev) => [...prev, newImage]);
    this.save();
    console.log('Image added to local state:', newImage);
  }

  renameImage(imageId: string, name: string): void {
    this.images.update((prev) => prev.map((i) => (i.id === imageId ? { ...i, name } : i)));
    this.save();
  }

  updateImageUrl(imageId: string, url: string): void {
    this.images.update((prev) => prev.map((i) => (i.id === imageId ? { ...i, url } : i)));
    this.save();
  }

  moveImageToCategory(imageId: string, categoryId: string): void {
    this.images.update((prev) => prev.map((i) => (i.id === imageId ? { ...i, categoryId } : i)));
    this.save();
  }

  removeImage(imageId: string): void {
    this.images.update((prev) => prev.filter((i) => i.id !== imageId));
    // clear from grid
    this.grid.update((g) => ({ ...g, cells: g.cells.map((id) => (id === imageId ? null : id)) }));
    this.save();
  }

  private save(): void {
    if (!this.isBrowser) return;
    const data = JSON.stringify({
      categories: this.categories(),
      flavors: this.flavors(),
      titles: this.titles(),
      images: this.images(),
      grid: this.grid(),
      headerGrid: this.headerGrid(),
      settings: this.settings(),
    });
    localStorage.setItem(FlavorService.STORAGE_KEY, data);
  }

  private load(): void {
    try {
      if (!this.isBrowser) {
        // Em ambiente de servidor, inicializa apenas em memória, sem persistência
        this.seed();
        return;
      }
      const raw = localStorage.getItem(FlavorService.STORAGE_KEY);
      if (!raw) {
        this.seed();
        return;
      }
      const parsed = JSON.parse(raw) as {
        categories: FlavorCategory[];
        flavors: Flavor[];
        titles?: Title[];
        images?: Image[];
        grid: DisplayGrid;
        headerGrid?: DisplayGrid;
        settings?: DisplaySettings;
      };
      this.categories.set(parsed.categories ?? []);
      this.flavors.set(parsed.flavors ?? []);
      this.titles.set(parsed.titles ?? []);
      this.images.set(parsed.images ?? []);
      const grid = parsed.grid ?? { columns: 3, rows: 3, cells: Array(9).fill(null) };
      const total = grid.columns * grid.rows;
      if (!Array.isArray(grid.cells) || grid.cells.length !== total) {
        grid.cells = Array(total).fill(null);
      }
      this.grid.set(grid);
      const header = parsed.headerGrid ?? { columns: 3, rows: 1, cells: Array(3).fill(null) };
      const headerTotal = header.columns * header.rows;
      if (!Array.isArray(header.cells) || header.cells.length !== headerTotal) {
        header.cells = Array(headerTotal).fill(null);
      }
      this.headerGrid.set(header);
      this.settings.set(parsed.settings ?? { logoImageUrl: '', titleColor: '#000000', showGridLines: true });
    } catch {
      this.seed();
    }
  }

  private seed(): void {
    const traditionalId = this.generateId();
    const dietId = this.generateId();
    const veganId = this.generateId();
    this.categories.set([
      { id: traditionalId, name: 'Tradicionais' },
      { id: dietId, name: 'Diet' },
      { id: veganId, name: 'Veganos' },
    ]);
    this.flavors.set([
      { id: this.generateId(), name: 'Baunilha', categoryId: traditionalId },
      { id: this.generateId(), name: 'Chocolate', categoryId: traditionalId },
      { id: this.generateId(), name: 'Morango', categoryId: traditionalId },
      { id: this.generateId(), name: 'Limão (Diet)', categoryId: dietId },
      { id: this.generateId(), name: 'Coco', categoryId: veganId },
    ]);
    this.titles.set([
      { id: this.generateId(), name: 'Tradicionais' },
      { id: this.generateId(), name: 'Diet' },
      { id: this.generateId(), name: 'Veganos' },
    ]);
    this.images.set([]);
    this.grid.set({ columns: 3, rows: 3, cells: Array(9).fill(null) });
    this.headerGrid.set({ columns: 3, rows: 1, cells: Array(3).fill(null) });
    this.settings.set({ logoImageUrl: '', titleColor: '#000000', showGridLines: true });
    this.save();
  }

  private generateId(): string {
    // Fallback seguro para SSR e navegadores antigos
    if (this.isBrowser && 'crypto' in globalThis && typeof (globalThis as any).crypto?.randomUUID === 'function') {
      return (globalThis as any).crypto.randomUUID();
    }
    // Gera um ID pseudo-único
    return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  setLogoImageUrl(url: string): void {
    this.settings.update((s) => ({ ...s, logoImageUrl: url }));
    this.save();
  }

  setTitleColor(color: string): void {
    this.settings.update((s) => ({ ...s, titleColor: color }));
    this.save();
  }

  setShowGridLines(show: boolean): void {
    this.settings.update((s) => ({ ...s, showGridLines: show }));
    this.save();
  }

  // Método público para forçar salvamento
  public forceSave(): void {
    this.save();
  }
}


