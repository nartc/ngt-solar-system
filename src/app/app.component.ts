import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgtCanvas } from 'angular-three';
import { Experience } from './experience/experience.component';

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [RouterOutlet, NgtCanvas],
	template: `
		<ngt-canvas [sceneGraph]="sceneGraph" />
	`,
	host: { class: 'block h-screen w-screen' }
})
export class AppComponent {
	sceneGraph = Experience;
}
