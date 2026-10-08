import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild
} from '@angular/core';
import { formatPrice, plural } from '@nails/shared/common/util';
import type { LatLng, MapPin } from '@nails/shared/masters/data-access';
import { Icon } from '@nails/web/common/ui';
import * as L from 'leaflet';
import { masterForms } from '../texts';
import { clusterPoints, viewportMarginPx, type PointGroup } from './cluster';

const tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const tileAttribution =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>';
const minskCenter: L.LatLngTuple = [53.9038, 27.5567];
const startZoom = 13;
const minZoom = 5;
const maxZoom = 19;
const locatedZoom = 14;
const clusterZoomStep = 2;
const fitPadding: L.PointTuple = [64, 64];
const fitMaxZoom = 14;
const bigCluster = 10;

@Component({
  selector: 'app-masters-map',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      position: relative;
      display: block;
      overflow: hidden;
      isolation: isolate;
    }
    .canvas {
      position: absolute;
      inset: 0;
    }
    .controls {
      position: absolute;
      top: var(--map-controls-top, auto);
      right: var(--app-space-4);
      bottom: var(--map-controls-bottom, auto);
      z-index: var(--app-z-map-controls);
      display: grid;
      gap: var(--app-space-2);
      transition: bottom var(--app-transition-base);
    }
    button {
      display: grid;
      place-items: center;
      width: var(--app-tap-target);
      height: var(--app-tap-target);
      border: 1px solid var(--app-color-border);
      border-radius: var(--app-radius-full);
      background: var(--app-color-surface);
      box-shadow: var(--app-shadow-md);
      color: var(--app-color-text);
      cursor: pointer;
    }
    button:hover:not(:disabled) {
      background: var(--app-color-surface-muted);
    }
    button:disabled {
      color: var(--app-color-text-muted);
      cursor: default;
    }
    .locate {
      margin-top: var(--app-space-2);
      color: var(--app-color-primary);
    }
  `,
  template: `
    <div #canvas class="canvas" role="region" aria-label="Карта мастеров"></div>
    <div class="controls">
      <button type="button" aria-label="Приблизить" [disabled]="zoom() >= maxZoom" (click)="zoomBy(1)">
        <app-icon name="plus" />
      </button>
      <button type="button" aria-label="Отдалить" [disabled]="zoom() <= minZoom" (click)="zoomBy(-1)">
        <app-icon name="minus" />
      </button>
      <button type="button" class="locate" aria-label="Моё местоположение" (click)="locate.emit()">
        <app-icon name="locate" />
      </button>
    </div>
  `
})
export class MastersMap {
  readonly pins = input.required<readonly MapPin[]>();
  readonly names = input<ReadonlyMap<string, string>>(new Map());
  readonly selectedId = input<string | null>(null);
  readonly highlightedId = input<string | null>(null);
  readonly userLocation = input<LatLng | null>(null);
  readonly pinSelect = output<string>();
  readonly backgroundTap = output();
  readonly locate = output();

  protected readonly minZoom = minZoom;
  protected readonly maxZoom = maxZoom;
  protected readonly zoom = signal(startZoom);

  private readonly canvas = viewChild.required<ElementRef<HTMLElement>>('canvas');
  private readonly map = signal<L.Map | null>(null);
  private readonly view = signal(0);
  private readonly markers = L.layerGroup();
  private userMarker: L.Marker | null = null;
  private fittedPins: readonly MapPin[] | null = null;

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const element = this.canvas().nativeElement;
      const map = L.map(element, { zoomControl: false, minZoom, maxZoom, attributionControl: false }).setView(
        minskCenter,
        startZoom
      );
      L.control.attribution({ prefix: false, position: 'bottomright' }).addTo(map);
      L.tileLayer(tileUrl, { attribution: tileAttribution, maxZoom }).addTo(map);
      this.markers.addTo(map);
      map.on('moveend zoomend', () => {
        this.zoom.set(map.getZoom());
        this.view.update((value) => value + 1);
      });
      map.on('click', () => this.backgroundTap.emit());
      const resize = new ResizeObserver(() => map.invalidateSize());
      resize.observe(element);
      destroyRef.onDestroy(() => {
        resize.disconnect();
        map.remove();
      });
      this.map.set(map);
    });

    effect(() => {
      const map = this.map();
      const pins = this.pins();
      if (map && pins !== this.fittedPins) {
        this.fittedPins = pins;
        untracked(() => this.fitIfHidden(map, pins));
      }
    });

    effect(() => {
      const map = this.map();
      if (!map) {
        return;
      }
      this.view();
      this.render(map, this.pins(), this.names(), this.selectedId(), this.highlightedId());
    });

    effect(() => {
      const map = this.map();
      const location = this.userLocation();
      if (!map || !location) {
        return;
      }
      this.userMarker?.remove();
      this.userMarker = L.marker([location.lat, location.lng], {
        icon: L.divIcon({
          className: 'map-marker',
          html: '<div class="map-user"><span class="map-user__pulse"></span></div>',
          iconSize: [0, 0]
        }),
        keyboard: false,
        interactive: false
      }).addTo(map);
      untracked(() => map.setView([location.lat, location.lng], Math.max(map.getZoom(), locatedZoom)));
    });
  }

  protected zoomBy(delta: number): void {
    const map = this.map();
    map?.setZoom(map.getZoom() + delta);
  }

  private fitIfHidden(map: L.Map, pins: readonly MapPin[]): void {
    if (pins.length === 0) {
      return;
    }
    const bounds = map.getBounds();
    if (pins.some((pin) => bounds.contains([pin.lat, pin.lng]))) {
      return;
    }
    map.fitBounds(L.latLngBounds(pins.map((pin): L.LatLngTuple => [pin.lat, pin.lng])), {
      padding: fitPadding,
      maxZoom: fitMaxZoom
    });
  }

  private render(
    map: L.Map,
    pins: readonly MapPin[],
    names: ReadonlyMap<string, string>,
    selectedId: string | null,
    highlightedId: string | null
  ): void {
    this.markers.clearLayers();
    const size = map.getSize();
    const byId = new Map(pins.map((pin) => [pin.id, pin]));
    const visible = pins
      .map((pin) => {
        const point = map.latLngToContainerPoint([pin.lat, pin.lng]);
        return { id: pin.id, x: point.x, y: point.y };
      })
      .filter(
        (point) =>
          point.x >= -viewportMarginPx &&
          point.y >= -viewportMarginPx &&
          point.x <= size.x + viewportMarginPx &&
          point.y <= size.y + viewportMarginPx
      );

    for (const group of clusterPoints(visible, map.getZoom(), selectedId)) {
      const position = map.containerPointToLatLng([group.x, group.y]);
      if (group.ids.length > 1) {
        this.markers.addLayer(this.clusterMarker(map, group, position, byId));
        continue;
      }
      const [id] = group.ids;
      const pin = id === undefined ? undefined : byId.get(id);
      if (pin) {
        this.markers.addLayer(
          this.pinMarker(pin, names.get(pin.id) ?? pin.specialty, pin.id === selectedId || pin.id === highlightedId)
        );
      }
    }
  }

  private pinMarker(pin: MapPin, name: string, active: boolean): L.Marker {
    const element = document.createElement('div');
    element.className = `map-pin${active ? ' map-pin--active' : ''}${pin.online ? ' map-pin--online' : ''}`;
    element.textContent = pin.price ? formatPrice(pin.price, true) : pin.specialty;
    const label = [name, pin.price ? formatPrice(pin.price) : null, pin.online ? 'онлайн' : null]
      .filter(Boolean)
      .join(', ');
    const marker = L.marker([pin.lat, pin.lng], {
      icon: L.divIcon({ className: 'map-marker', html: element, iconSize: [0, 0] }),
      zIndexOffset: active ? 1000 : 0,
      riseOnHover: true
    });
    marker.on('add', () => marker.getElement()?.setAttribute('aria-label', label));
    marker.on('click', () => this.pinSelect.emit(pin.id));
    marker.on('keypress', (event: L.LeafletKeyboardEvent) => {
      if (event.originalEvent.key === 'Enter' || event.originalEvent.key === ' ') {
        this.pinSelect.emit(pin.id);
      }
    });
    return marker;
  }

  private clusterMarker(
    map: L.Map,
    group: PointGroup,
    position: L.LatLng,
    byId: ReadonlyMap<string, MapPin>
  ): L.Marker {
    const element = document.createElement('div');
    element.className = `map-cluster${group.ids.length >= bigCluster ? ' map-cluster--big' : ''}`;
    element.textContent = String(group.ids.length);
    const marker = L.marker(position, {
      icon: L.divIcon({ className: 'map-marker', html: element, iconSize: [0, 0] })
    });
    marker.on('add', () =>
      marker.getElement()?.setAttribute('aria-label', `${plural(group.ids.length, masterForms)} рядом, приблизить`)
    );
    const open = () => {
      const bounds = L.latLngBounds(
        group.ids.flatMap((id) => {
          const pin = byId.get(id);
          return pin ? [[pin.lat, pin.lng] as L.LatLngTuple] : [];
        })
      );
      const zoom = Math.min(
        maxZoom,
        Math.max(map.getBoundsZoom(bounds, false, L.point(fitPadding)), map.getZoom() + clusterZoomStep)
      );
      map.setView(bounds.getCenter(), zoom);
    };
    marker.on('click', open);
    marker.on('keypress', (event: L.LeafletKeyboardEvent) => {
      if (event.originalEvent.key === 'Enter' || event.originalEvent.key === ' ') {
        open();
      }
    });
    return marker;
  }
}
