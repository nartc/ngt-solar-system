import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { extend, NgtArgs } from 'angular-three';
import { NgtsOrbitControls } from 'angular-three-soba/controls';
import { Color } from 'three';
import { EarthDetails } from './earth-details.component';
import { Planet } from './planet.component';
import { planetNames } from './planets';
import { StarField } from './star-field.component';
import { Sun } from './sun.component';

@Component({
	standalone: true,
	template: `
		<ngt-color *args="['black']" attach="background" />

		<app-star-field />
		<app-sun />

		@for (planet of planets; track planet) {
			<app-planet [planet]="planet">
				@if (planet === 'earth') {
					<app-earth-details />
				}
			</app-planet>
		}

		<ngts-orbit-controls
			[options]="{
				minDistance: 10,
				maxDistance: 60,
				zoomSpeed: 0.3,
				enablePan: false,
				autoRotate: true,
				autoRotateSpeed: -0.2,
			}"
		/>
	`,
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [NgtsOrbitControls, StarField, NgtArgs, Sun, Planet, EarthDetails],
})
export class SolarSystem {
	protected readonly planets = planetNames;

	constructor() {
		extend({ Color });
	}
}
