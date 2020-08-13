<script>

import MatrixDrawer2d from './MatrixDrawer2d.svelte';
import MatrixDrawer3d from './MatrixDrawer3d.svelte';

// The dimension of the matrix
export let dim;
// The paddings
export let padding = undefined;
// The type: kernel/input/output
export let type;
// The active boxes
export let actives = undefined;

export let scene;
</script>

{#if dim.length < 3}
<MatrixDrawer2d {...$$props} bind:scene={scene} on:activate on:deactivate />
{:else}
<MatrixDrawer3d
    dim={dim}
    padding={padding}
    type={type}
    actives={actives}
    on:mousedown
    on:mount
    bind:scene={scene} on:activate on:deactivate />
{/if}
