import { Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { NgtCanvas } from 'angular-three';
import { map, timer } from 'rxjs';
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
		<div class="loader-container" [class.done]="doneLoading()">
			<div class="stars"></div>
			<svg
				id="logo"
				role="img"
				width="64"
				height="64"
				class="logo"
				version="1.1"
				aria-hidden="true"
				viewBox="-5 -5 210 210"
				xmlns="http://www.w3.org/2000/svg"
				xmlns:xlink="http://www.w3.org/1999/xlink"
			>
				<polygon
					class="hexagon"
					stroke-width="10"
					fill="rgb(0, 0, 0)"
					stroke="rgb(241, 22, 80)"
					points="52,16.8615612366939 148,16.8615612366939 196,100 148,183.138438763306 52,183.138438763306 4,100"
				></polygon>
				<path
					id="letter-m"
					class="letter"
					transform="translate(58, 55)"
					fill="rgb(241, 22, 80)"
					stroke="rgb(241, 22, 80)"
					d="M 11.7 91 L 0 91 L 0 0 L 17.29 0 L 42.51 57.59 L 67.34 0 L 85.02 0 L 85.02 91 L 72.67 91 L 72.67 15.73 L 48.36 70.46 L 36.14 70.46 L 11.7 15.73 L 11.7 91 Z"
				></path>
			</svg>
		</div>
	`,
	host: { class: 'block h-screen w-screen' },
	styleUrl: './app.component.css',
})
export class AppComponent {
	protected readonly Math = Math;
	protected sceneGraph = SolarSystem;
	protected doneLoading = toSignal(timer(4000).pipe(map(() => true)), { initialValue: false });
}
