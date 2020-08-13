<script>
import { onMount, createEventDispatcher } from 'svelte';
import Box3d from "./Box3d.svelte";

// The dimension of the matrix
export let dim;
// The paddings
export let padding;
// The type: kernel/input/output
export let type;
// The active boxes
export let actives = [[], [], []];

export let scene;

$: padding = padding === undefined ? [0, 0, 0] : padding;
$: actives = (actives === undefined || actives.length < 3) ? [[], [], []] : actives;
$: nx = dim[0] + 2 * padding[0];
$: ny = dim[1] + 2 * padding[1];
$: nz = dim[2] + 2 * padding[2];
$: maxdim = Math.max(nx, ny, nz);
$: boxsize = maxdim < 20 ? 30 : (maxdim < 50 ? 20 : 12);

$: isPadding = (ix, iy, iz) => {
    return ix < padding[0] ||
        ix >= nx - padding[0] ||
        iy < padding[1] ||
        iy >= ny - padding[1] ||
        iz < padding[2] ||
        iz >= nz - padding[2];
};

$: isActive = (ix, iy, iz) => {
    return actives[0].includes(ix) &&
        actives[1].includes(iy) &&
        actives[2].includes(iz);
}

const getPosStyle = (ix, iy, iz, nx, ny, nz, boxsize) => {
    const x = ix - Math.floor(nx / 2);
    const y = iy - Math.floor(ny / 2);
    const z = iz - Math.floor(nz / 2);
    return `left: ${x * boxsize}px;
        top: ${y * boxsize}px;
        transform: translateZ(${z * boxsize}px);`;
};

const dispatcher = createEventDispatcher();
onMount(() => dispatcher('mount'));
</script>

<div
    class="matrix-wrapper"
    style="--scene-size: {boxsize * maxdim + 100}">
    <div class="relative">
        <div
            on:mousedown
            bind:this={scene}
            class="scene absolute h-0 w-0">
        {#each Array(nx) as _, ix}
            {#each Array(ny) as _, iy}
                {#each Array(nz) as _, iz}
                    <Box3d
                        isPadding={isPadding(ix, iy, iz)}
                        isActive={isActive(ix, iy, iz)}
                        ix={ix}
                        iy={iy}
                        iz={iz}
                        type={type}
                        posStyle={getPosStyle(ix, iy, iz, nx, ny, nz, boxsize)}
                        on:activate
                        on:deactivate
                        size={boxsize} />
                {/each}
            {/each}
        {/each}
        </div>
    </div>
</div>

<style>
.matrix-wrapper, .relative {
    min-height: calc(var(--scene-size) * 1px);
}
.scene {
    top: 50%;
    left: 50%;
    transform-style: preserve-3d;
    transform-origin: center center;
}
</style>
