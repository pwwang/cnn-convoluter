<script>
import Box2d from "./Box2d.svelte";

// The dimension of the matrix
export let dim;
// The paddings
export let padding;
// The type: kernel/input/output
export let type;
// The active boxes
export let actives = [[]];

// make it apply to 1d
$: dim2d = dim.length === 1 ? [1, dim[0]] : dim;
$: padding2d = padding === undefined ? [0, 0] : (
    padding.length === 1 ? [0, padding[0]] : padding
);
$: actives2d = actives === undefined ? [[], []] : (
    actives.length === 1 ? [[0], actives[0]] : actives
);
$: nrows = dim2d[0] + 2 * padding2d[0];
$: ncols = dim2d[1] + 2 * padding2d[1];
$: maxdim = Math.max(nrows, ncols);
$: boxsize = maxdim < 40 ? 'large' : (maxdim < 100 ? 'medium' : 'small');

$: isPadding = (irow, icol) => {
    return irow < padding2d[0] ||
        irow >= nrows - padding2d[0] ||
        icol < padding2d[1] ||
        icol >= ncols - padding2d[1];
};

$: isActive = (irow, icol) => {
    return actives2d[0].includes(irow) && actives2d[1].includes(icol);
}

</script>

<div
    class="matrix-wrapper mx-auto"
    style="--matrix-nrows: {nrows}; --matrix-ncols: {ncols}">
    {#each Array(nrows) as _, irow}
        {#each Array(ncols) as _, icol}
            <Box2d
                isPadding={isPadding(irow, icol)}
                isActive={isActive(irow, icol)}
                irow={dim.length === 1 ? undefined : irow}
                icol={icol}
                type={type}
                on:activate
                on:deactivate
                size={boxsize} />
        {/each}
    {/each}
</div>

<style>
.matrix-wrapper {
    display: inline-grid;
    grid-gap: 1px;
    grid-template-rows: repeat(var(--matrix-nrows), min-content);
    grid-template-columns: repeat(var(--matrix-ncols), min-content);
}
</style>
