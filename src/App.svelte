<script>
import { Snackbar } from 'smelte';
import Header from "./components/Header.svelte";
import Settings from "./components/Settings.svelte";
import Kernel from "./components/Kernel.svelte";
import Input from "./components/Input.svelte";
import Output from "./components/Output.svelte";
import defaultSettings from "./defaults.js";

let settings = JSON.parse(JSON.stringify(defaultSettings));
// The default angle for the cube view
const defaultAngle = 30;

//// helper functions
// calculate the real kernel size with dilation
const getRealKernelSize = (kernelSize, dialtion) => {
	return kernelSize.map((ks, i) => dialtion[i] * (ks - 1) + 1)
};

// get the chunks by the stride at idim dimension
// the chunks only has the start
// The indexes of the elements in chunks should be corresponding to
// the output
const getChunks = (input, padding, realKS, stride) => {
	const totalLen = input + 2 * padding;
	const ret = [];
	let cur = 1;
	while (cur <= totalLen - realKS + 1) {
		// make it 0-based for searching
		ret.push(cur - 1);
		cur += stride
	}
	return ret;
};

// find the chunk by given index
const findChunk = (chunks, i) => {
	// i should be 0-based
	// return the right-most chunk
	for (let index = chunks.length - 1; index >= 0; index--) {
		if (i >= chunks[index]) {
			return index
		}
	}
	return null;
};

// expand the chunks with size and dialtion
// so that the indexes in it will be highlighted
const expandChunk = (start, size, dilation=1) => {
    const ret = [];
    let i = 0;
    while (i < size) {
        ret.push(i + start);
        i += dilation;
    }
    return ret;
}

$: realKernelSize = getRealKernelSize(
	settings.dims[settings.dimty].kernel.size,
	settings.dims[settings.dimty].kernel.dilation
);

$: allChunks = settings.dims[settings.dimty].input.map((inp, i) => getChunks(
	inp,
	settings.dims[settings.dimty].kernel.padding[i],
	realKernelSize[i],
	settings.dims[settings.dimty].kernel.stride[i]
));

$: output = allChunks.map(chunks => chunks.length);

let inActives;
let outAcitves;

$: activateOutput = (coord) => {
	outAcitves = coord.map(co => [co]);
	inActives = coord.map((co, i) => expandChunk(
		allChunks[i][co],
		realKernelSize[i],
		settings.dims[settings.dimty].kernel.dilation[i]
	));
};

$: activateInput = (coord) => {
	const outCoord = coord.map((co, i) => findChunk(allChunks[i], co));
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
	outAcitves = undefined;
};

// autoWalker
let interval;

// get the x, y, z from output dimension by an auto-increment index
const getCoordByWalkIndex = (walkIdx, outputDim) => {
	const coord = [];
	const prod = (array) => array.reduce((x, y) => x * y, 1);
	walkIdx = walkIdx % prod(outputDim);

	let rest = walkIdx;
	for (let i = 0; i < outputDim.length; i++) {
		if (i === outputDim.length - 1) {
			coord.push(rest);
		} else {
			const restDim = prod(outputDim.slice(i+1));
			coord.push(Math.floor(rest / restDim));
			rest = rest % restDim;
		}
	}
	return coord;
};

// $ runs twice
// see: https://github.com/sveltejs/svelte/issues/4265
let autoWalkerChangeCount = 0;
$: {
	++autoWalkerChangeCount;
	if (autoWalkerChangeCount % 2 === 1) {
		if (settings.autoWalker && !!!interval) {
			let walkIndex = 0;
			interval = setInterval(() => {
				const coord = getCoordByWalkIndex(walkIndex, output);
				activateOutput(coord);
				walkIndex ++;
			}, 400);
		} else if (!settings.autoWalker && interval > 0) {
			clearInterval(interval);
			interval = undefined;
			deactivate();
		}
	}
}

// 3d view controls
let sceneKernel;
let sceneInput;
let sceneOutput;
let controlStart = false;
let winHeight;
let winWidth;

const rotateScene = (newX, newY) => {
    sceneKernel.style.transform =
        'rotateY('+ newY +'deg) rotateX('+ newX +'deg)';
    sceneInput.style.transform =
        'rotateY('+ newY +'deg) rotateX('+ newX +'deg)';
    sceneOutput.style.transform =
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

const resetControl = () => {
	rotateScene(defaultAngle, 90 + defaultAngle);
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
				kernel={settings.dims[settings.dimty].kernel}
				visual={settings.visual}
				bind:scene={sceneKernel}
				on:mount={resetControl}
				on:mousedown={() => controlStart = true} />
		</div>
		<div class="input-cell bg-white border border-gray-300 mb-3">
			<Input
				input={settings.dims[settings.dimty].input}
				padding={settings.dims[settings.dimty].kernel.padding}
				visual={settings.visual}
				actives={inActives}
				on:activate={activateInputBox}
				on:deactivate={deactivate}
				bind:scene={sceneInput}
				on:mount={resetControl}
				on:mousedown={() => controlStart = true} />
		</div>
		<div class="output-cell bg-white border rounded-br-md border-gray-300 mr-3 mb-3">
			<Output
				output={output}
				visual={settings.visual}
				actives={outAcitves}
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