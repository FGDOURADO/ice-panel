import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlavorService, Flavor, Title, Image } from '../services/flavor.service';
import { StaticImagesService, StaticImage } from '../services/static-images.service';

@Component({
  selector: 'app-visor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visor.component.html',
  styleUrls: ['./visor.component.css']
})
export class VisorComponent {
  private readonly flavorService = inject(FlavorService);
  private readonly staticImagesService = inject(StaticImagesService);

  readonly grid = this.flavorService.grid;
  readonly flavors = this.flavorService.flavors;
  readonly categories = this.flavorService.categories;
  readonly titles = this.flavorService.titles;
  readonly images = this.staticImagesService.images;
  readonly settings = this.flavorService.settings;
  readonly headerGrid = this.flavorService.headerGrid;

  readonly placedFlavors = computed<Flavor[]>(() => {
    const ids = this.grid().cells.filter((id): id is string => !!id);
    const list = ids
      .map((id) => this.flavors().find((f) => f.id === id))
      .filter((f): f is Flavor => !!f);
    return list;
  });

  nameFor(id: string | null): string {
    if (!id) return '';
    return this.flavors().find(f => f.id === id)?.name ?? '';
  }

  categoryName(id: string | null): string {
    if (!id) return '';
    return this.categories().find(c => c.id === id)?.name ?? '';
  }

  titleName(id: string | null): string {
    if (!id) return '';
    return this.titles().find(t => t.id === id)?.name ?? '';
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


