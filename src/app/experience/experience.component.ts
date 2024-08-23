import { CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionStrategy, Component, ElementRef, viewChild } from '@angular/core';
import { extend, injectBeforeRender } from 'angular-three';
import { NgtsOrbitControls } from 'angular-three-soba/controls';
import { BoxGeometry, Mesh, MeshBasicMaterial } from 'three';

extend({ Mesh, BoxGeometry, MeshBasicMaterial });

@Component({
	standalone: true,
	template: `
		<ngt-mesh #mesh>
			<ngt-box-geometry />
			<ngt-mesh-basic-material color="hotpink" />
		</ngt-mesh>

		<ngts-orbit-controls />
	`,
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [NgtsOrbitControls],
})
export class Experience {
	meshRef = viewChild.required<ElementRef<Mesh>>('mesh');

	constructor() {
		injectBeforeRender(({ delta }) => {
			const mesh = this.meshRef().nativeElement;
			mesh.rotation.x += delta;
			mesh.rotation.y += delta;
		});
	}
}
