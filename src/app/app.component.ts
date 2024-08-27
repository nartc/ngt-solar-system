import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgtCanvas } from 'angular-three';
import { SolarSystem } from './solar-system/solar-system.component';

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [RouterOutlet, NgtCanvas],
	template: `
		<ngt-canvas
			[sceneGraph]="sceneGraph"
			[camera]="{
				position: [30 * Math.cos(Math.PI / 6), 30 * Math.sin(Math.PI / 6), 40],
				fov: 75,
				near: 0.1,
				far: 100,
			}"
		/>
	`,
	host: { class: 'block h-screen w-screen' },
})
export class AppComponent {
	protected readonly Math = Math;

	sceneGraph = SolarSystem;
}
