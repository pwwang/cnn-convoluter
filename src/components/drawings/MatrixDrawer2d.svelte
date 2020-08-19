<script>
import { Icon } from 'smelte';
import Box2d from "./Box2d.svelte";

// The type: kernel/input/output
export let type;
// The active boxes
export let actives;

export let showData;

export let data; // input/kernel
export let inputData;
// the convoluted data
export let outputData;

$: dataPadded = data.padding ? data.data.pad(data.padding, 'zero') : data.data;
$: dataPaddedSize = data.size.length === 1 ? [1, dataPadded.size[0]] : dataPadded.size;

$: maxsize = Math.max.apply(null, dataPaddedSize);
$: boxsize = showData ? 'with-data' : (
    maxsize < 40 ? 'large' : (maxsize < 100 ? 'medium' : 'small')
);

$: isPadding = (irow, icol) => {
    if (!data.padding)
        return false;
    if (data.size.length === 2) {
        return irow < data.padding[0] ||
            irow >= dataPaddedSize[0] - data.padding[0] ||
            icol < data.padding[1] ||
            icol >= dataPaddedSize[1] - data.padding[1];
    } else {
        return icol < data.padding[0] ||
            icol >= dataPaddedSize[1] - data.padding[0];
    }
};

$: isActive = (irow, icol) => {
    if (!actives)
        return false;
    if (data.size.length === 2) {
        return actives[0].includes(irow) && actives[1].includes(icol);
    } else {
        return actives[0].includes(icol);
    }
}

</script>

<div
    class="matrix-wrapper mx-auto"
    style="--matrix-nrows: {dataPaddedSize[0]}; --matrix-ncols: {dataPaddedSize[1]}">
    {#each Array(dataPaddedSize[0]) as _, irow}
        {#each Array(dataPaddedSize[1]) as _, icol}
            <Box2d
                isPadding={isPadding(irow, icol)}
                isActive={isActive(irow, icol)}
                irow={data.size.length === 1 ? undefined : irow}
                icol={icol}
                type={type}
                data={showData ? (data.size.length === 1 ?
                    dataPadded.data[icol] :
                    dataPadded.data[irow][icol]) : ''}
                on:activate
                on:deactivate
                size={boxsize} />
        {/each}
    {/each}
</div>

{#if showData && type === 'kernel'}
<Icon class="cursor-pointer px-2">clear</Icon>

<div
    class="matrix-wrapper mx-auto"
    style="--matrix-nrows: {dataPaddedSize[0]}; --matrix-ncols: {dataPaddedSize[1]}">
    {#each Array(dataPaddedSize[0]) as _, irow}
        {#each Array(dataPaddedSize[1]) as _, icol}
            <Box2d
                isPadding={isPadding(irow, icol)}
                isActive={isActive(irow, icol)}
                irow={data.size.length === 1 ? undefined : irow}
                icol={icol}
                type='input'
                data={inputData && (inputData.size.length === 1 ?
                    inputData.data[icol] :
                    inputData.data[irow][icol])}
                size={boxsize} />
        {/each}
    {/each}
</div>

<Icon class="cursor-pointer px-2">drag_handle</Icon>

<div class="matrix-wrapper">
    <Box2d
        isPadding={false}
        isActive={false}
        irow={0}
        icol={0}
        type='output'
        data={outputData}
        size={boxsize} />
</div>
{/if}

<style>
.matrix-wrapper {
    display: inline-grid;
    grid-gap: 1px;
    grid-template-rows: repeat(var(--matrix-nrows), min-content);
    grid-template-columns: repeat(var(--matrix-ncols), min-content);
}
</style>
