import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, viewChild } from '@angular/core';
import { extend, injectBeforeRender, NgtArgs } from 'angular-three';
import { injectTexture } from 'angular-three-soba/loaders';
import {
	AdditiveBlending,
	BackSide,
	BufferAttribute,
	Color,
	DynamicDrawUsage,
	Group,
	IcosahedronGeometry,
	Mesh,
	MeshBasicMaterial,
	PointLight,
	ShaderMaterial,
	Vector3,
} from 'three';
import { ImprovedNoise } from 'three-stdlib';
import fragmentShader from './shaders/fragment.glsl';
import vertexShader from './shaders/vertex.glsl';

@Component({
	selector: 'app-sun',
	standalone: true,
	template: `
		<ngt-group #group>
			<!-- sun -->
			<ngt-mesh [geometry]="icosahedronGeometry">
				<ngt-mesh-basic-material [map]="sunTexture()" />
			</ngt-mesh>

			<!-- sun light -->
			<ngt-point-light [intensity]="1000" color="#ffff99" [position]="[0, 0, 0]" />

			<!-- rim -->
			<ngt-mesh [scale]="1.01" [geometry]="icosahedronGeometry">
				<ngt-shader-material
					[uniforms]="rimUniforms"
					[vertexShader]="vertexShader"
					[fragmentShader]="fragmentShader"
					[transparent]="true"
					[blending]="AdditiveBlending"
				/>
			</ngt-mesh>

			<!-- corona -->
			<ngt-mesh>
				<ngt-icosahedron-geometry #coronaGeometry *args="[4.9, 12]" />
				<ngt-mesh-basic-material color="#ff0000" [side]="BackSide" />
			</ngt-mesh>

			<!-- glow -->
			<ngt-mesh [scale]="1.1" [geometry]="icosahedronGeometry">
				<ngt-shader-material
					[uniforms]="glowUniforms"
					[vertexShader]="vertexShader"
					[fragmentShader]="fragmentShader"
					[transparent]="true"
					[blending]="AdditiveBlending"
				/>
			</ngt-mesh>
		</ngt-group>
	`,
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [NgtArgs],
})
export class Sun {
	protected readonly AdditiveBlending = AdditiveBlending;
	protected readonly BackSide = BackSide;

	protected sunTexture = injectTexture(() => './sun-map.jpg');

	private groupRef = viewChild.required<ElementRef<Group>>('group');
	private coronaGeometryRef = viewChild<ElementRef<IcosahedronGeometry>>('coronaGeometry');

	// we can share the geometry with a simple component property
	protected icosahedronGeometry = new IcosahedronGeometry(5, 12);

	protected rimUniforms = {
		color1: { value: new Color(0xffff99) },
		color2: { value: new Color(0x000000) },
		fresnelBias: { value: 0.2 },
		fresnelScale: { value: 1.5 },
		fresnelPower: { value: 4.0 },
	};

	protected glowUniforms = {
		color1: { value: new Color(0x000000) },
		color2: { value: new Color(0xff0000) },
		fresnelBias: { value: 0.2 },
		fresnelScale: { value: 1.5 },
		fresnelPower: { value: 4.0 },
	};

	protected vertexShader = vertexShader;
	protected fragmentShader = fragmentShader;

	constructor() {
		extend({ Group, Mesh, IcosahedronGeometry, MeshBasicMaterial, ShaderMaterial, PointLight });

		const v3 = new Vector3();
		const p = new Vector3();
		const coronaNoise = new ImprovedNoise();

		injectBeforeRender(({ clock }) => {
			const time = clock.getElapsedTime();
			const [group, coronaGeometry] = [this.groupRef().nativeElement, this.coronaGeometryRef()?.nativeElement];
			if (!coronaGeometry) return;

			const position = coronaGeometry.attributes['position'] as BufferAttribute;
			if (!position) return;

			if (position.usage !== DynamicDrawUsage) {
				position.usage = DynamicDrawUsage;
			}

			const length = position.count;

			for (let i = 0; i < length; i++) {
				p.fromBufferAttribute(position, i).normalize();
				v3.copy(p).multiplyScalar(5);
				let ns = coronaNoise.noise(v3.x + Math.cos(time), v3.y + Math.sin(time), v3.z + time);
				v3.copy(p)
					.setLength(5)
					.addScaledVector(p, ns * 0.4);
				position.setXYZ(i, v3.x, v3.y, v3.z);
			}

			position.needsUpdate = true;
			group.rotation.y = -time / 5;
		});
	}
}
