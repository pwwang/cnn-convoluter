<script>
import { Icon } from 'smelte';
import { onMount, createEventDispatcher } from 'svelte';
import Box3d from "./Box3d.svelte";

// The type: kernel/input/output
export let type;
// The active boxes
export let actives;
// show data?
export let showData;

export let data;
export let inputData;
export let outputData;

export let scene;
export let scene2;
export let scene3;

$: padding = padding === undefined ? [0, 0, 0] : padding;
$: actives = (actives === undefined || actives.length < 3) ? [[], [], []] : actives;
$: dataPadded = data.padding ? data.data.pad(data.padding, 'zero') : data.data;

$: maxsize = Math.max.apply(null, dataPadded.size);
$: boxsize = maxsize < 20 ? 30 : (maxsize < 50 ? 20 : 12);

$: isPadding = (ix, iy, iz) => {
    if (!data.padding)
        return false;
    return ix < data.padding[0] ||
        ix >= dataPadded.size[0] - data.padding[0] ||
        iy < data.padding[1] ||
        iy >= dataPadded.size[1] - data.padding[1] ||
        iz < data.padding[2] ||
        iz >= dataPadded.size[2] - data.padding[2];
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
    style="--scene-size: {boxsize * maxsize + 100};">
    <div class="relative">
        <div
            on:mousedown
            bind:this={scene}
            class="scene absolute h-0 w-0">
        {#each Array(dataPadded.size[0]) as _, ix}
            {#each Array(dataPadded.size[1]) as _, iy}
                {#each Array(dataPadded.size[2]) as _, iz}
                    <Box3d
                        isPadding={isPadding(ix, iy, iz)}
                        isActive={isActive(ix, iy, iz)}
                        ix={ix}
                        iy={iy}
                        iz={iz}
                        type={type}
                        data={showData ? (
                            !data.type || data.type === 'conv' ?
                                dataPadded.data[ix][iy][iz] :
                                data.type[0]
                        ) : ''}
                        posStyle={getPosStyle(
                            ix, iy, iz,
                            dataPadded.size[0], dataPadded.size[1], dataPadded.size[2],
                            boxsize
                        )}
                        on:activate
                        on:deactivate
                        size={boxsize} />
                {/each}
            {/each}
        {/each}
        </div>
    </div>
</div>

{#if showData && type === 'kernel'}
<Icon class="cursor-pointer">clear</Icon>

<div
    class="matrix-wrapper"
    style="--scene-size: {boxsize * maxsize + 100};">
    <div class="relative">
        <div
            on:mousedown
            bind:this={scene2}
            class="scene absolute h-0 w-0">
        {#each Array(dataPadded.size[0]) as _, ix}
            {#each Array(dataPadded.size[1]) as _, iy}
                {#each Array(dataPadded.size[2]) as _, iz}
                    <Box3d
                        type="input"
                        data={inputData && inputData.data[ix][iy][iz]}
                        posStyle={getPosStyle(
                            ix, iy, iz,
                            dataPadded.size[0], dataPadded.size[1], dataPadded.size[2],
                            boxsize
                        )}
                        size={boxsize} />
                {/each}
            {/each}
        {/each}
        </div>
    </div>
</div>

<Icon class="cursor-pointer">drag_handle</Icon>

<div class="matrix-wrapper"
    style="--scene-size: {boxsize * 1 + 100};">
    <div class="relative">
        <div
            on:mousedown
            bind:this={scene3}
            class="scene absolute h-0 w-0">
            <Box3d
                type='output'
                ix={0}
                iy={0}
                iz={0}
                posStyle={getPosStyle(
                    0,0,0,1,1,1,
                    boxsize
                )}
                data={outputData}
                size={boxsize} />
        </div>
    </div>
</div>
{/if}

<style>
.matrix-wrapper, .relative {
    min-width: calc(var(--scene-size) * 1px);
    min-height: calc(var(--scene-size) * 1px);
}
.scene {
    top: 50%;
    left: 50%;
    transform-style: preserve-3d;
    transform-origin: center center;
}
</style>
