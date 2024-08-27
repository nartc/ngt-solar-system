import { DOCUMENT, TitleCasePipe } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	computed,
	CUSTOM_ELEMENTS_SCHEMA,
	Directive,
	ElementRef,
	inject,
	input,
	signal,
	viewChild,
} from '@angular/core';
import { extend, getLocalState, injectBeforeRender, injectObjectEvents, NgtArgs, pick } from 'angular-three';
import { NgtsText } from 'angular-three-soba/abstractions';
import { injectTexture } from 'angular-three-soba/loaders';
import {
	AdditiveBlending,
	Color,
	DoubleSide,
	Group,
	IcosahedronGeometry,
	Mesh,
	MeshBasicMaterial,
	MeshPhongMaterial,
	Object3D,
	RingGeometry,
	ShaderMaterial,
	SRGBColorSpace,
	TorusGeometry,
} from 'three';
import { planets } from './planets';
import fragmentShader from './shaders/fragment.glsl';
import vertexShader from './shaders/vertex.glsl';

@Directive({ selector: '[cursorPointer]', standalone: true })
export class CursorPointer {
	constructor() {
		const host = inject<ElementRef<Object3D>>(ElementRef);
		const nativeElement = host.nativeElement;

		if (!nativeElement.isObject3D) return;

		const localState = getLocalState(nativeElement);
		if (!localState) return;

		const document = inject(DOCUMENT);
		injectObjectEvents(() => nativeElement, {
			pointerover: () => {
				document.body.style.cursor = 'pointer';
			},
			pointerout: () => {
				document.body.style.cursor = 'default';
			},
		});
	}
}

@Component({
	selector: 'app-planet',
	standalone: true,
	template: `
		<ngt-group #group>
			<!-- orbit -->
			<ngt-mesh [rotation]="[Math.PI / 2, 0, 0]">
				<ngt-torus-geometry *args="[orbitRadius(), 0.01, 100]" />
				<ngt-mesh-basic-material color="#add8e6" [side]="DoubleSide" />
			</ngt-mesh>

			<!-- planet group: planet and rings -->
			<ngt-group
				#planetGroup
				cursorPointer
				[position]="[orbitRadius() - size() / 9, 0, 0]"
				[rotation]="[0, 0, angle()]"
				(pointerover)="hovered.set(true)"
				(pointerout)="hovered.set(false)"
			>
				<!-- planet -->
				<ngt-mesh [geometry]="planetGeometry()">
					<ngt-mesh-phong-material [map]="planetTexture()" />
				</ngt-mesh>

				<!-- rings -->
				@if (ringsTexture(); as ringsTexture) {
					<ngt-mesh [rotation]="[Math.PI / 2, 0, 0]">
						<ngt-ring-geometry *args="[size() + 0.1, size() + 0.1 + ringsSize(), 32]" />
						<ngt-mesh-basic-material [map]="ringsTexture" [transparent]="true" [side]="DoubleSide" />
					</ngt-mesh>
				}

				<!-- glow -->
				<ngt-mesh [scale]="1.1" [geometry]="planetGeometry()">
					<ngt-shader-material
						[uniforms]="glowUniforms()"
						[vertexShader]="vertexShader"
						[fragmentShader]="fragmentShader"
						[transparent]="true"
						[blending]="AdditiveBlending"
					/>
				</ngt-mesh>

				<ng-content />
			</ngt-group>

			<ngts-text
				[text]="planet() | titlecase"
				[options]="{
					color: 'white',
					position: [$any(planetGroup).position.x, Math.max(1, size() * 2.5), 0],
					fontSize: Math.max(1, size() * 1.5),
					visible: hovered(),
				}"
			/>
		</ngt-group>
	`,
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [NgtArgs, NgtsText, CursorPointer, TitleCasePipe],
})
export class Planet {
	protected readonly AdditiveBlending = AdditiveBlending;
	protected readonly Math = Math;
	protected readonly DoubleSide = DoubleSide;

	planet = input.required<keyof typeof planets>();

	private planetConfig = computed(() => planets[this.planet()]);

	private rimHex = pick(this.planetConfig, 'rimHex');
	protected size = pick(this.planetConfig, 'planetSize');
	protected orbitRadius = pick(this.planetConfig, 'orbitRadius');
	protected angle = pick(this.planetConfig, 'planetAngle');
	protected ringsSize = pick(this.planetConfig, 'ringsSize');

	private groupRef = viewChild.required<ElementRef<Group>>('group');
	private planetGroupRef = viewChild.required<ElementRef<Group>>('planetGroup');

	protected planetTexture = injectTexture(
		() => {
			const planet = this.planet();
			if (planet === 'earth') return `${planet}-map-1.jpg`;
			return `./${planet}-map.jpg`;
		},
		{ onLoad: ([texture]) => (texture.colorSpace = SRGBColorSpace) },
	);
	protected ringsTexture = injectTexture(() => {
		const ringsSize = this.ringsSize();
		// TODO: change this to an empty string when next version of angular-three-soba is released
		if (ringsSize === 0) return 'undefined';
		return `./${this.planet()}-rings.jpg`;
	});

	protected glowUniforms = computed(() => ({
		color1: { value: new Color(this.rimHex()) },
		color2: { value: new Color(0x000000) },
		fresnelBias: { value: 0.2 },
		fresnelScale: { value: 1.5 },
		fresnelPower: { value: 4.0 },
	}));
	protected vertexShader = vertexShader;
	protected fragmentShader = fragmentShader;

	planetGeometry = computed(() => new IcosahedronGeometry(this.size(), 12));

	protected hovered = signal(false);

	constructor() {
		extend({ Group, Mesh, TorusGeometry, RingGeometry, MeshBasicMaterial, MeshPhongMaterial, ShaderMaterial });
		injectBeforeRender(() => {
			const [group, planetGroup, { orbitRotationDirection, orbitSpeed, planetRotationDirection, planetRotationSpeed }] =
				[this.groupRef().nativeElement, this.planetGroupRef().nativeElement, this.planetConfig()];

			if (orbitRotationDirection === 'clockwise') {
				group.rotation.y -= orbitSpeed;
			} else if (orbitRotationDirection === 'counterclockwise') {
				group.rotation.y += orbitSpeed;
			}

			if (planetRotationDirection === 'clockwise') {
				planetGroup.rotation.y -= planetRotationSpeed;
			} else if (planetRotationDirection === 'counterclockwise') {
				planetGroup.rotation.y += planetRotationSpeed;
			}
		});
	}
}
