import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { extend } from 'angular-three';
import { injectTexture } from 'angular-three-soba/loaders';
import { AdditiveBlending, Mesh, MeshBasicMaterial, MeshStandardMaterial } from 'three';
import { Planet } from './planet.component';

@Component({
	selector: 'app-earth-details',
	standalone: true,
	template: `
		<ngt-mesh [geometry]="planet.planetGeometry()">
			<ngt-mesh-basic-material [map]="textures()?.lights" [blending]="AdditiveBlending" />
		</ngt-mesh>

		<ngt-mesh [geometry]="planet.planetGeometry()" [scale]="1.003">
			<ngt-mesh-standard-material
				[transparent]="true"
				[opacity]="0.8"
				[blending]="AdditiveBlending"
				[map]="textures()?.clouds"
				[alphaMap]="textures()?.cloudsAlpha"
			/>
		</ngt-mesh>
	`,
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EarthDetails {
	protected readonly AdditiveBlending = AdditiveBlending;

	protected planet = inject(Planet);
	protected textures = injectTexture(() => ({
		lights: './earth-map-2.jpg',
		clouds: './earth-map-3.jpg',
		cloudsAlpha: './earth-map-4.jpg',
	}));

	constructor() {
		extend({ Mesh, MeshBasicMaterial, MeshStandardMaterial });
	}
}
