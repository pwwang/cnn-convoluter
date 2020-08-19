<script>
import { Snackbar } from 'smelte';
import { incrToCoords } from './math.js';
import Header from "./components/Header.svelte";
import Settings from "./components/Settings.svelte";
import Kernel from "./components/Kernel.svelte";
import Input from "./components/Input.svelte";
import Output from "./components/Output.svelte";
import {
	defaultSettings,
	copySettings
} from "./settings.js";

let settings = 	copySettings(defaultSettings);

$: dims = settings.dims[settings.dimty];

$: convoluted = dims.input.data.conv(
	dims.input.padding,
	dims.kernel.data,
	dims.kernel.dilation,
	dims.kernel.stride,
	dims.kernel.type
);

let inActives;
let outActives;

$: activateOutput = (coord) => {
	outActives = coord.map(co => [co]);
	inActives = convoluted.inCoordsToBlockIndexes(
		convoluted.outCoordsToIn(coord), false
	);
};

$: activateInput = (coord) => {
	const outCoord = convoluted.inCoordsToOut(coord);
	outActives = outCoord.map(co => [co]);
	activateOutput(outCoord);
};

const activateInputBox = (event) => {
	activateInput(event.detail.coord);
	if (settings.autoWalker) {
		// this triggers autoWalker to be changed.
		// even when it is already false
		settings.autoWalker = false;
	}
};

const activateOutputBox = (event) => {
	activateOutput(event.detail.coord);
	if (settings.autoWalker) {
		settings.autoWalker = false;
	}
}

const deactivate = () => {
	inActives = undefined;
	outActives = undefined;
};

// autoWalker
let interval;

// $ runs twice
// see: https://github.com/sveltejs/svelte/issues/4265
let autoWalkerChangeCount = 1;
$: {
	//++autoWalkerChangeCount;
	if (autoWalkerChangeCount % 2 === 1) {
		if (settings.autoWalker && !!!interval) {
			let walkIndex = -1;
			interval = setInterval(() => {
				const coord = incrToCoords(walkIndex, convoluted.output.size);
				activateOutput(coord);
				walkIndex ++;
			}, 600);
		} else if (!settings.autoWalker && interval > 0) {
			clearInterval(interval);
			interval = undefined;
			deactivate();
		}
	}
}

// 3d view controls
let sceneKernel;
let sceneKernelInput;
let sceneKernelOutput;
let sceneInput;
let sceneOutput;
let controlStart = false;
let winHeight;
let winWidth;

$: rotateScene = (newX, newY) => {
	if (sceneKernel)
		sceneKernel.style.transform =
			'rotateY('+ newY +'deg) rotateX('+ newX +'deg)';

	if (sceneInput)
		sceneInput.style.transform =
			'rotateY('+ newY +'deg) rotateX('+ newX +'deg)';

	if (sceneOutput)
		sceneOutput.style.transform =
			'rotateY('+ newY +'deg) rotateX('+ newX +'deg)';

	if (sceneKernelInput)
		sceneKernelInput.style.transform =
			'rotateY('+ newY +'deg) rotateX('+ newX +'deg)';
	if (sceneKernelOutput)
		sceneKernelOutput.style.transform =
			'rotateY('+ newY +'deg) rotateX('+ newX +'deg)';
};

// if winHeight/winWidth changes
$: sceneControl = (event) => {
	if (!controlStart) return;

	const cursorX = event.pageX,
		cursorY = event.pageY,
		newRotationX = 180 - 360*cursorY / winHeight,
		newRotationY = -(180 - 360*cursorX / winWidth);

	rotateScene(newRotationX, newRotationY);
};

$: resetControl = () => {
	rotateScene(-20, 45);
};

</script>

<svelte:window
	on:mouseup={() => controlStart = false}
    on:mousemove={sceneControl}
	bind:innerWidth={winWidth}
	bind:innerHeight={winHeight}
	/>

<main class="bg-gray-200">
	<div class="grid-container">
		<div class="header-cell mb-3 bg-primary-900">
			<Header />
		</div>
		<div class="settings-cell bg-white border rounded-l-md border-gray-300 ml-3 mb-3 mr-1">
			<Settings
				bind:settings={settings}
				bind:controlStart={controlStart}
				on:viewReset={resetControl} />
		</div>
		<div class="kernel-cell bg-white border rounded-tr-md border-gray-300 mr-3">
			<Kernel
				kernel={dims.kernel}
				visual={settings.visual}
				showData={settings.showData}
				inputData={inActives && dims.input.data.pad(dims.input.padding).subset(inActives)}
				outputData={outActives && convoluted.output.subset(outActives).first()}
				bind:scene={sceneKernel}
				bind:scene2={sceneKernelInput}
				bind:scene3={sceneKernelOutput}
				on:mount={resetControl}
				on:mousedown={() => controlStart = true} />
		</div>
		<div class="input-cell bg-white border border-gray-300 mb-3">
			<Input
				input={dims.input}
				visual={settings.visual}
				showData={settings.showData}
				actives={inActives}
				on:activate={activateInputBox}
				on:deactivate={deactivate}
				bind:scene={sceneInput}
				on:mount={resetControl}
				on:mousedown={() => controlStart = true} />
		</div>
		<div class="output-cell bg-white border rounded-br-md border-gray-300 mr-3 mb-3">
			<Output
				output={{data: convoluted.output, size: convoluted.output.size}}
				visual={settings.visual}
				showData={settings.showData}
				actives={outActives}
				on:activate={activateOutputBox}
				on:deactivate={deactivate}
				bind:scene={sceneOutput}
				on:mount={resetControl}
				on:mousedown={() => controlStart = true} />
		</div>
	</div>
</main>
<Snackbar
  noAction
  color="alert"
  hash="autoWalker"
  timeout={2000}
  class="pointer-events-auto flex absolute py-2 text-sm
         px-4 z-30 mb-4 content-between mx-auto
         rounded items-center elevation-2"
  left
  value={!settings.autoWalker}>
  <div>autoWalker stopped!</div>
</Snackbar>

<style>
.grid-container {
	display: grid;
	height: 100vh;
	grid-gap: 2px;
	grid-template-columns: 360px 1fr 1fr;
	grid-template-rows: max-content max-content auto;
	grid-template-areas:
		"header-cell header-cell header-cell"
		"settings-cell kernel-cell kernel-cell"
		"settings-cell input-cell output-cell";
}


.grid-container > .header-cell {
	grid-area: header-cell;
}

.grid-container > .settings-cell {
	grid-area: settings-cell;
}

.grid-container > .kernel-cell {
	grid-area: kernel-cell;
}

.grid-container > .input-cell {
	grid-area: input-cell;
}

.grid-container > .output-cell {
	grid-area: output-cell;
}
</style>