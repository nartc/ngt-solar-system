import {
	ChangeDetectionStrategy,
	Component,
	computed,
	CUSTOM_ELEMENTS_SCHEMA,
	ElementRef,
	input,
	viewChild,
} from '@angular/core';
import { extend, injectBeforeRender, NgtArgs, pick } from 'angular-three';
import { injectTexture } from 'angular-three-soba/loaders';
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, Group, Points, PointsMaterial } from 'three';

@Component({
	selector: 'app-star-field',
	standalone: true,
	template: `
		<ngt-group #group>
			<ngt-points>
				<ngt-buffer-geometry>
					<ngt-buffer-attribute *args="[vertices(), 3]" attach="attributes.position" />
					<ngt-buffer-attribute *args="[colors(), 3]" attach="attributes.color" />
				</ngt-buffer-geometry>
				<ngt-points-material
					[size]="0.2"
					[alphaTest]="0.5"
					[transparent]="true"
					[vertexColors]="true"
					[blending]="AdditiveBlending"
					[map]="circleTexture()"
				/>
			</ngt-points>
		</ngt-group>
	`,
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [NgtArgs],
})
export class StarField {
	protected readonly AdditiveBlending = AdditiveBlending;

	count = input(1000);

	circleTexture = injectTexture(() => './circle.png');

	private groupRef = viewChild.required<ElementRef<Group>>('group');

	private points = computed(() => {
		const count = this.count();
		const vertices: number[] = [];
		const colors: number[] = [];

		for (let i = 0; i < count; i += 1) {
			const { x, y, z } = this.getRandomSpherePoint();
			vertices.push(x, y, z);
			const color = new Color().setHSL(0.6, 0.2, Math.random());
			colors.push(color.r, color.g, color.b);
		}

		return { vertices: new Float32Array(vertices), colors: new Float32Array(colors) };
	});
	vertices = pick(this.points, 'vertices');
	colors = pick(this.points, 'colors');

	constructor() {
		extend({ Group, Points, BufferGeometry, PointsMaterial, BufferAttribute });
		injectBeforeRender(() => {
			const group = this.groupRef().nativeElement;
			group.rotation.y += 0.00005;
		});
	}

	private getRandomSpherePoint() {
		const radius = Math.random() * 25 + 25;
		const u = Math.random();
		const v = Math.random();
		const theta = 2 * Math.PI * u;
		const phi = Math.acos(2 * v - 1);
		const x = radius * Math.sin(phi) * Math.cos(theta);
		const y = radius * Math.sin(phi) * Math.sin(theta);
		const z = radius * Math.cos(phi);
		return { x, y, z };
	}
}
