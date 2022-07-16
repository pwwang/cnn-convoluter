<script>
import { createEventDispatcher } from 'svelte';

export let irow;
export let icol;
export let type;
export let size;
export let isPadding;
export let isActive;
export let data;

$: sizeClasses = size === 'with-data' ? 'h-4 w-4' : (size === 'small' ? 'h-1 w-1' : (
    size === 'medium' ? 'h-2 w-2' : 'h-3 w-3'
));

$: typeClasses = isPadding ? 'bg-gray-500' : (
    type === 'kernel' ? 'bg-fuchsia-400' : (
        type === 'input' ? 'bg-cyan-600' : 'bg-blue-500'
    )
);

$: activeClasses = isActive ? "opacity-100" : "opacity-50";

const dispatcher = createEventDispatcher();

const activate = () => {
    dispatcher('activate', {
        coord: irow === undefined ? [icol] : [irow, icol]
    });
};

const deactivate = () => {
    dispatcher('deactivate');
}
</script>

<div
    class="text-xs {sizeClasses} {typeClasses} {activeClasses}"
    on:mouseenter={activate}
    on:mouseleave={deactivate}>
    {data === undefined || isPadding ? '' : data}
</div>
