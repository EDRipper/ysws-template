<script lang="ts">
	// Decorative sticker field for the hero: a curated set of Hack Club
	// stickers scattered edge/corner-biased around the page, each "peelable"
	// via the reference peel-demo's page-curl shader on hover/click.
	//
	// Adapted from /peel-demo/index.html. Ported: the vertex+fragment
	// page-curl shaders, the curl/spread two-phase animation state machine,
	// and texture loading via three.js TextureLoader. Deliberately NOT
	// ported: the sidebar catalog/checklist + search box, the theme toggle,
	// the fake custom cursor + pointer-lock system, and full drag-around
	// interaction — none of that applies to a decorative hero background.
	// Peeling here is a self-contained "peek up, hold briefly, settle back
	// down" animation triggered per-sticker by hover/click, not a
	// pick-up-and-drag toy, and (unlike the demo, which only ever animates
	// one globally "active" sticker at a time) multiple stickers can be
	// peeling independently since there's no shared cursor/drag state.
	//
	// three.js is dynamically imported client-side only (see initCanvasField)
	// so this component is fully SSR-safe and doesn't add to the initial JS
	// payload on prerendered/mobile-static loads.
	import { onMount, tick } from 'svelte';
	import { browser } from '$app/environment';
	import { CURATED_STICKERS, type StickerDef } from '$lib/stickers/data';

	type ThreeModule = typeof import('three');
	type Tier = 'canvas' | 'static';

	// `style` is accepted separately from `class` because Svelte's per-component
	// CSS scoping means a plain class rule written in a *parent* component
	// cannot reliably out-specificity this component's own scoped `.sticker-field`
	// rule (both end up as two-class selectors after scoping, so which one wins
	// is cascade-order-fragile). An inline style always wins, so callers that
	// need to reposition/resize the field (e.g. to cover a specific section)
	// should use `style`, not just `class`.
	let { class: className = '', style: styleProp = '' }: { class?: string; style?: string } =
		$props();

	// Below this viewport width we skip three.js/WebGL entirely and render a
	// handful of plain <img> stickers positioned with CSS instead — cheaper
	// to boot, no WebGL context, no shader compilation, friendlier to mobile
	// Lighthouse scores.
	const MOBILE_BREAKPOINT = 700;
	const STATIC_STICKER_COUNT = 6;
	const CANVAS_SEGMENTS = 20; // tessellation per sticker plane (reference demo used 140; with up to ~22 simultaneous stickers × 2 meshes that's excessive here)
	const CURL_MAX = 0.62;

	interface Placement {
		x: number;
		y: number;
		scale: number;
		opacity: number;
		rot: number;
		hingeDir: [number, number];
	}

	interface StaticPlacement {
		def: StickerDef;
		leftPct: number;
		topPct: number;
		widthPct: number;
		rotDeg: number;
		opacity: number;
	}

	interface AnimState {
		from: number;
		to: number;
		start: number;
		duration: number;
	}

	interface StickerInstance {
		mesh: InstanceType<ThreeModule['Mesh']>;
		backMesh: InstanceType<ThreeModule['Mesh']>;
		geometry: InstanceType<ThreeModule['PlaneGeometry']>;
		frontMaterial: InstanceType<ThreeModule['ShaderMaterial']>;
		backMaterial: InstanceType<ThreeModule['ShaderMaterial']>;
		texture: InstanceType<ThreeModule['Texture']>;
		frontUniforms: { uCurl: { value: number }; uSpread: { value: number } };
		backUniforms: { uCurl: { value: number }; uSpread: { value: number } };
		curl: number;
		spread: number;
		phase: 'idle' | 'peeling' | 'held' | 'putting-down';
		curlAnim: AnimState;
		spreadAnim: AnimState;
		heldSince: number;
		holdMs: number;
	}

	let containerEl: HTMLDivElement;
	let canvasEl: HTMLCanvasElement | undefined = $state();
	let tier = $state<Tier | null>(null);
	let staticPlacements = $state<StaticPlacement[]>([]);

	let THREE: ThreeModule;
	let renderer: InstanceType<ThreeModule['WebGLRenderer']> | null = null;
	let scene: InstanceType<ThreeModule['Scene']> | null = null;
	let camera: InstanceType<ThreeModule['OrthographicCamera']> | null = null;
	let raycaster: InstanceType<ThreeModule['Raycaster']> | null = null;
	let ndc: InstanceType<ThreeModule['Vector2']> | null = null;
	let instances: StickerInstance[] = [];
	let rafId: number | null = null;
	let running = false;
	let reducedMotion = false;
	let destroyed = false;
	let resizeTimer: ReturnType<typeof setTimeout> | undefined;

	// --- page-curl shaders (ported near-verbatim from the reference demo) ---
	const VERT_SHADER = `
		uniform float uCurl;
		uniform float uSpread;
		uniform float uRadius;
		uniform vec2  uHingeDir;
		uniform float uPlaneHalf;
		uniform float uTargetZ;
		uniform float uThickness;

		varying vec2  vUv;
		varying float vSide;
		varying vec3  vNormalW;

		void main() {
			vUv = uv;
			vec3 p = position;
			vec3 n = vec3(0.0, 0.0, 1.0);

			float hingeX = mix(uPlaneHalf, -uPlaneHalf, uCurl);
			float along  = dot(p.xy, uHingeDir) - hingeX;

			if (along > 0.0) {
				float theta = along / uRadius;
				float sinT = sin(theta);
				float cosT = cos(theta);

				float newAlong = hingeX + uRadius * sinT;
				float newZ     = uRadius - uRadius * cosT;

				vec2 perp = p.xy - dot(p.xy, uHingeDir) * uHingeDir;
				vec2 xy   = perp + newAlong * uHingeDir;
				p = vec3(xy, newZ);

				n = vec3(-sinT * uHingeDir.x, -sinT * uHingeDir.y, cosT);
			}

			float isWrapped = step(0.0, along);

			float uAlong = (dot(position.xy, uHingeDir) / uPlaneHalf + 1.0) * 0.5;
			float blendStart = (1.0 - uAlong) * 0.6;
			float blend = smoothstep(blendStart, blendStart + 0.4, uSpread);

			vec3 flatP      = vec3(position.xy, uTargetZ);
			vec3 unwrappedP = mix(p, flatP, blend);
			vec3 wrappedP   = p + vec3(0.0, 0.0, blend * uTargetZ);
			p = mix(unwrappedP, wrappedP, isWrapped);

			vSide = n.z > 0.0 ? 1.0 : -1.0;
			vNormalW = normalize((modelMatrix * vec4(n, 0.0)).xyz);

			p -= n * uThickness;
			p.y += p.z * 0.45;

			gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
		}
	`;

	const FRAG_SHADER = `
		uniform sampler2D uMap;
		uniform vec3  uLightDir;
		uniform float uOpacity;

		varying vec2  vUv;
		varying float vSide;
		varying vec3  vNormalW;

		void main() {
			if (vSide < 0.0) discard;
			vec4 front = texture2D(uMap, vUv);
			vec3 col = front.rgb;
			float a  = front.a * uOpacity;

			vec3 N = normalize(vNormalW);
			if (vSide < 0.0) N = -N;
			float ndl = clamp(dot(N, normalize(uLightDir)), 0.0, 1.0);
			col *= 0.45 + 0.65 * ndl;

			gl_FragColor = vec4(col, a);
		}
	`;

	const BACK_FRAG_SHADER = `
		uniform sampler2D uMap;
		uniform vec3  uLightDir;
		uniform float uOpacity;

		varying vec2 vUv;
		varying vec3 vNormalW;

		void main() {
			float a = texture2D(uMap, vUv).a * uOpacity;
			if (a < 0.01) discard;
			vec3 N = -normalize(vNormalW);
			float ndl = clamp(dot(N, normalize(uLightDir)), 0.0, 1.0);
			float lighting = 0.5 + 0.45 * ndl;
			gl_FragColor = vec4(vec3(0.86) * lighting, a);
		}
	`;

	// --- animation helpers (ported from the reference demo) ---
	function easeInOutCubic(t: number) {
		return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
	}
	function startAnim(anim: AnimState, from: number, to: number, duration: number, delay = 0) {
		anim.from = from;
		anim.to = to;
		anim.duration = duration;
		anim.start = Math.abs(from - to) < 0.0005 ? -1 : performance.now() + delay;
	}
	function stepAnim(anim: AnimState, now: number, current: number) {
		if (anim.start < 0 || now < anim.start) return current;
		const t = Math.max(0, Math.min(1, (now - anim.start) / anim.duration));
		const v = anim.from + (anim.to - anim.from) * easeInOutCubic(t);
		if (t >= 1) anim.start = -1;
		return v;
	}

	// --- placement: edge/corner-biased scatter, fading toward the center ---
	// Independently biases each axis toward the extremes (via a power curve
	// on a uniform sample) and keeps a rectangular exclusion zone clear in
	// the middle for the sign-up modal. Corners end up denser than straight
	// edges because both axes have to land far from center simultaneously.
	function shuffle<T>(arr: T[]): T[] {
		const a = arr.slice();
		for (let i = a.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[a[i], a[j]] = [a[j], a[i]];
		}
		return a;
	}

	function pickPlacement(aspect: number): Placement {
		const CENTER_EXCLUSION = 0.4;
		const EDGE_BIAS = 2.4;
		const EDGE_INSET = 0.93;

		const bx = Math.pow(Math.random(), 1 / EDGE_BIAS);
		const by = Math.pow(Math.random(), 1 / EDGE_BIAS);
		const fx = CENTER_EXCLUSION + (1 - CENTER_EXCLUSION) * bx;
		const fy = CENTER_EXCLUSION + (1 - CENTER_EXCLUSION) * by;
		const sx = Math.random() < 0.5 ? -1 : 1;
		const sy = Math.random() < 0.5 ? -1 : 1;

		const closeness = Math.min(fx, fy); // 0 near the modal, 1 at the far edge
		// peel from the corner pointing away from center — reads as peeling
		// toward the viewer rather than toward the sign-up modal
		const hingeDir: [number, number] = [sx * (0.6 + Math.random() * 0.4), sy * (0.6 + Math.random() * 0.4)];

		return {
			x: sx * fx * aspect * EDGE_INSET,
			y: sy * fy * EDGE_INSET,
			scale: 0.75 + 0.5 * closeness,
			opacity: 0.55 + 0.45 * closeness,
			rot: (Math.random() - 0.5) * 0.62,
			hingeDir
		};
	}

	function buildStaticPlacements(): StaticPlacement[] {
		return shuffle(CURATED_STICKERS)
			.slice(0, STATIC_STICKER_COUNT)
			.map((def) => {
				const CENTER_EXCLUSION = 0.4;
				const EDGE_BIAS = 2.1;
				const bx = Math.pow(Math.random(), 1 / EDGE_BIAS);
				const by = Math.pow(Math.random(), 1 / EDGE_BIAS);
				const fx = CENTER_EXCLUSION + (1 - CENTER_EXCLUSION) * bx;
				const fy = CENTER_EXCLUSION + (1 - CENTER_EXCLUSION) * by;
				const sx = Math.random() < 0.5 ? -1 : 1;
				const sy = Math.random() < 0.5 ? -1 : 1;
				const closeness = Math.min(fx, fy);
				return {
					def,
					leftPct: 50 + sx * fx * 47,
					topPct: 50 + sy * fy * 44,
					widthPct: 9 + Math.random() * 7,
					rotDeg: (Math.random() - 0.5) * 30,
					opacity: 0.65 + 0.35 * closeness
				};
			});
	}

	function countForWidth(width: number): number {
		if (width < 1000) return 10;
		if (width < 1400) return 16;
		return Math.min(22, CURATED_STICKERS.length);
	}

	function proxiedUrl(remote: string): string {
		// cdn.hackclub.com sometimes double-sends Access-Control-Allow-Origin,
		// which browsers reject — route texture loads through our proxy route,
		// which refetches server-side and re-emits a single clean header.
		return '/api/stickers/proxy?url=' + encodeURIComponent(remote);
	}

	function createSticker(
		tex: InstanceType<ThreeModule['Texture']>,
		baseH: number,
		placement: Placement
	): StickerInstance {
		tex.colorSpace = THREE.SRGBColorSpace;
		tex.generateMipmaps = true;
		tex.minFilter = THREE.LinearMipmapLinearFilter;
		tex.magFilter = THREE.LinearFilter;

		const img = tex.image as { width?: number; height?: number };
		const aspect = img.width && img.height ? img.width / img.height : 1;
		const h = baseH;
		const w = h * aspect;

		const geometry = new THREE.PlaneGeometry(w, h, CANVAS_SEGMENTS, CANVAS_SEGMENTS);
		const hingeDir = new THREE.Vector2(placement.hingeDir[0], placement.hingeDir[1]).normalize();
		const planeHalf = (w + h) / (2 * Math.SQRT2);
		const radius = Math.hypot(w, h) * 0.22;
		const targetZ = Math.max(w, h) * 0.4;
		const lightDir = new THREE.Vector3(0.25, 0.55, 1.0);

		const frontUniforms = {
			uMap: { value: tex },
			uCurl: { value: 0 },
			uSpread: { value: 0 },
			uRadius: { value: radius },
			uHingeDir: { value: hingeDir },
			uPlaneHalf: { value: planeHalf },
			uTargetZ: { value: targetZ },
			uThickness: { value: 0 },
			uLightDir: { value: lightDir },
			uOpacity: { value: placement.opacity }
		};
		const frontMaterial = new THREE.ShaderMaterial({
			uniforms: frontUniforms,
			vertexShader: VERT_SHADER,
			fragmentShader: FRAG_SHADER,
			side: THREE.DoubleSide,
			transparent: true
		});
		const mesh = new THREE.Mesh(geometry, frontMaterial);

		const backUniforms = {
			uMap: { value: tex },
			uCurl: { value: 0 },
			uSpread: { value: 0 },
			uRadius: { value: radius },
			uHingeDir: { value: hingeDir.clone() },
			uPlaneHalf: { value: planeHalf },
			uTargetZ: { value: targetZ },
			uThickness: { value: Math.max(w, h) * 0.025 },
			uLightDir: { value: lightDir.clone() },
			uOpacity: { value: placement.opacity }
		};
		const backMaterial = new THREE.ShaderMaterial({
			uniforms: backUniforms,
			vertexShader: VERT_SHADER,
			fragmentShader: BACK_FRAG_SHADER,
			side: THREE.DoubleSide,
			transparent: true
		});
		const backMesh = new THREE.Mesh(geometry, backMaterial);
		backMesh.renderOrder = -1;

		mesh.position.set(placement.x, placement.y, 0);
		backMesh.position.set(placement.x, placement.y, 0);
		mesh.rotation.z = placement.rot;
		backMesh.rotation.z = placement.rot;

		return {
			mesh,
			backMesh,
			geometry,
			frontMaterial,
			backMaterial,
			texture: tex,
			frontUniforms,
			backUniforms,
			curl: 0,
			spread: 0,
			phase: 'idle',
			curlAnim: { from: 0, to: 0, start: -1, duration: 480 },
			spreadAnim: { from: 0, to: 0, start: -1, duration: 620 },
			heldSince: -1,
			holdMs: 550 + Math.random() * 350
		};
	}

	function triggerPeel(inst: StickerInstance) {
		if (reducedMotion) return;
		if (inst.phase === 'idle') {
			inst.phase = 'peeling';
			startAnim(inst.curlAnim, inst.curl, CURL_MAX, 480);
			startAnim(inst.spreadAnim, inst.spread, 1, 620, 140);
			wake();
		} else if (inst.phase === 'held') {
			// re-hovering while peeled extends the hold instead of restarting it
			inst.heldSince = performance.now();
		}
	}

	function beginPutDown(inst: StickerInstance) {
		inst.phase = 'putting-down';
		startAnim(inst.spreadAnim, inst.spread, 0, 560);
		startAnim(inst.curlAnim, inst.curl, 0, 420, 160);
	}

	function raycastAt(clientX: number, clientY: number): StickerInstance | null {
		if (!canvasEl || !camera || !raycaster || !ndc || instances.length === 0) return null;
		const rect = canvasEl.getBoundingClientRect();
		if (rect.width === 0 || rect.height === 0) return null;
		ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
		ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
		raycaster.setFromCamera(ndc, camera);
		const meshes = instances.map((s) => s.mesh);
		const hits = raycaster.intersectObjects(meshes, false);
		if (hits.length === 0) return null;
		hits.sort((a, b) => (b.object.renderOrder ?? 0) - (a.object.renderOrder ?? 0));
		const hitMesh = hits[0].object;
		return instances.find((s) => s.mesh === hitMesh) ?? null;
	}

	// Canvas is pointer-events:none in CSS so it never blocks clicks on real
	// page content; these listeners raycast manually (independent of CSS
	// pointer-events) and only swallow the event when it actually lands on a
	// sticker mesh.
	function onPointerMove(e: PointerEvent) {
		const inst = raycastAt(e.clientX, e.clientY);
		if (inst) triggerPeel(inst);
	}
	function onPointerDown(e: PointerEvent) {
		const inst = raycastAt(e.clientX, e.clientY);
		if (!inst) return;
		e.preventDefault();
		e.stopPropagation();
		triggerPeel(inst);
	}

	function renderLoop() {
		if (!renderer || !scene || !camera) {
			running = false;
			rafId = null;
			return;
		}
		const now = performance.now();
		let anyActive = false;
		for (const inst of instances) {
			if (inst.phase === 'idle') continue;
			anyActive = true;
			inst.curl = stepAnim(inst.curlAnim, now, inst.curl);
			inst.spread = stepAnim(inst.spreadAnim, now, inst.spread);
			inst.frontUniforms.uCurl.value = inst.curl;
			inst.frontUniforms.uSpread.value = inst.spread;
			inst.backUniforms.uCurl.value = inst.curl;
			inst.backUniforms.uSpread.value = inst.spread;

			if (inst.phase === 'peeling' && inst.curlAnim.start < 0 && inst.spreadAnim.start < 0) {
				inst.phase = 'held';
				inst.heldSince = now;
			} else if (inst.phase === 'held' && now - inst.heldSince > inst.holdMs) {
				beginPutDown(inst);
			} else if (
				inst.phase === 'putting-down' &&
				inst.curlAnim.start < 0 &&
				inst.spreadAnim.start < 0
			) {
				inst.phase = 'idle';
			}
		}
		renderer.render(scene, camera);
		if (anyActive) {
			rafId = requestAnimationFrame(renderLoop);
		} else {
			rafId = null;
			running = false;
		}
	}

	// Render-on-demand: idle stickers cost nothing, the rAF loop only spins
	// while at least one sticker is mid-peel and sleeps the rest of the time.
	function wake() {
		if (running) return;
		running = true;
		renderLoop();
	}

	function resizeRenderer() {
		if (!containerEl || !renderer || !camera) return;
		const rect = containerEl.getBoundingClientRect();
		const w = Math.max(1, Math.round(rect.width));
		const h = Math.max(1, Math.round(rect.height));
		renderer.setSize(w, h, false);
		const aspect = w / h;
		camera.left = -aspect;
		camera.right = aspect;
		camera.top = 1;
		camera.bottom = -1;
		camera.updateProjectionMatrix();
	}

	async function initCanvasField() {
		if (!canvasEl || !containerEl || destroyed) return;

		let mod: ThreeModule;
		try {
			mod = await import('three');
		} catch (err) {
			console.warn('[StickerField] failed to load three.js', err);
			tier = 'static';
			staticPlacements = buildStaticPlacements();
			return;
		}
		if (destroyed || !canvasEl) return;
		THREE = mod;

		try {
			renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true, alpha: true });
		} catch (err) {
			console.warn('[StickerField] WebGL unavailable', err);
			renderer = null;
			tier = 'static';
			staticPlacements = buildStaticPlacements();
			return;
		}

		renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
		scene = new THREE.Scene();
		camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
		camera.position.z = 5;
		raycaster = new THREE.Raycaster();
		ndc = new THREE.Vector2();

		resizeRenderer();

		reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		const count = countForWidth(window.innerWidth);
		const chosen = shuffle(CURATED_STICKERS).slice(0, count);
		const aspect = camera.right;

		const loader = new THREE.TextureLoader();
		loader.crossOrigin = 'anonymous';

		for (const def of chosen) {
			const placement = pickPlacement(aspect);
			loader.load(
				proxiedUrl(def.image),
				(tex) => {
					if (destroyed || !scene) {
						tex.dispose();
						return;
					}
					const baseH = (0.15 + Math.random() * 0.15) * placement.scale;
					const inst = createSticker(tex, baseH, placement);
					scene.add(inst.mesh);
					scene.add(inst.backMesh);
					instances.push(inst);
					wake();
				},
				undefined,
				(err) => console.warn('[StickerField] failed to load sticker', def.name, err)
			);
		}

		if (!reducedMotion) {
			window.addEventListener('pointermove', onPointerMove);
		}
		window.addEventListener('pointerdown', onPointerDown, true);

		wake();
	}

	function disposeInstance(inst: StickerInstance) {
		scene?.remove(inst.mesh);
		scene?.remove(inst.backMesh);
		inst.geometry.dispose();
		inst.frontMaterial.dispose();
		inst.backMaterial.dispose();
		inst.texture.dispose();
	}

	function teardown() {
		if (rafId !== null) cancelAnimationFrame(rafId);
		rafId = null;
		running = false;
		window.removeEventListener('pointermove', onPointerMove);
		window.removeEventListener('pointerdown', onPointerDown, true);
		for (const inst of instances) disposeInstance(inst);
		instances = [];
		if (renderer) {
			renderer.dispose();
			renderer.forceContextLoss();
		}
		renderer = null;
		scene = null;
		camera = null;
		raycaster = null;
		ndc = null;
	}

	function scheduleResize() {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(handleResize, 220);
	}

	async function handleResize() {
		if (destroyed) return;
		const width = window.innerWidth;
		const nextTier: Tier = width < MOBILE_BREAKPOINT ? 'static' : 'canvas';
		if (nextTier !== tier) {
			teardown();
			tier = nextTier;
			if (tier === 'static') {
				staticPlacements = buildStaticPlacements();
			} else {
				await tick();
				if (!destroyed) await initCanvasField();
			}
			return;
		}
		if (tier === 'canvas' && renderer) {
			resizeRenderer();
			wake();
		}
	}

	onMount(() => {
		if (!browser) return;
		destroyed = false;

		(async () => {
			const width = window.innerWidth;
			if (width < MOBILE_BREAKPOINT) {
				tier = 'static';
				staticPlacements = buildStaticPlacements();
				return;
			}
			tier = 'canvas';
			await tick();
			if (!destroyed) await initCanvasField();
		})();

		window.addEventListener('resize', scheduleResize);

		return () => {
			destroyed = true;
			clearTimeout(resizeTimer);
			window.removeEventListener('resize', scheduleResize);
			teardown();
		};
	});
</script>

<div
	class="sticker-field {className}"
	style={styleProp}
	bind:this={containerEl}
	aria-hidden="true"
>
	{#if tier === 'canvas'}
		<canvas bind:this={canvasEl}></canvas>
	{:else if tier === 'static'}
		<div class="sticker-field-static">
			{#each staticPlacements as p (p.def.id)}
				<img
					src={p.def.image}
					alt=""
					loading="lazy"
					decoding="async"
					style="left:{p.leftPct}%; top:{p.topPct}%; width:{p.widthPct}%; opacity:{p.opacity}; transform: translate(-50%, -50%) rotate({p.rotDeg}deg);"
				/>
			{/each}
		</div>
	{/if}
</div>

<style>
	.sticker-field {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 1;
	}

	.sticker-field canvas {
		display: block;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}

	.sticker-field-static {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.sticker-field-static img {
		position: absolute;
		height: auto;
		pointer-events: none;
		filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.35));
		user-select: none;
	}
</style>
