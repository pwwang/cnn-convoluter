<script>

import MatrixDrawer2d from './MatrixDrawer2d.svelte';
import MatrixDrawer3d from './MatrixDrawer3d.svelte';

// The type: kernel/input/output
export let type;
// The active boxes
export let actives;

export let showData;

export let data; // input/kernel
export let inputData;
export let outputData;

export let scene;
export let scene2;
export let scene3;
</script>

{#if data.size.length < 3}
<MatrixDrawer2d {...$$props}
    bind:scene={scene}
    on:activate
    on:deactivate />
{:else}
<MatrixDrawer3d
    showData={showData}
    type={type}
    actives={actives}
    data={data}
    inputData={inputData}
    outputData={outputData}
    bind:scene={scene}
    bind:scene2={scene2}
    bind:scene3={scene3}
    on:mousedown
    on:mount
    on:activate
    on:deactivate />
{/if}
