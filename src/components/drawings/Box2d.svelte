<script>
import { createEventDispatcher } from 'svelte';

export let irow;
export let icol;
export let type;
export let size;
export let isPadding;
export let isActive;

$: sizeClasses = size === 'small' ? 'h-1 w-1' : (
    size === 'medium' ? 'h-2 w-2' : 'h-3 w-3'
);

$: typeClasses = isPadding ? 'bg-gray-500' : (
    type === 'kernel' ? 'bg-primary-900' : (
        type === 'input' ? 'bg-secondary-900' : 'bg-blue-900'
    )
);

$: activeClasses = isActive ? 'bg-opacity-100' : 'bg-opacity-50';

const dispatcher = createEventDispatcher();

const activate = () => {
    dispatcher('activate', {
        coord: [irow, icol]
    });
};

const deactivate = () => {
    dispatcher('deactivate');
}
</script>

<div
    class="inline-box {sizeClasses} {typeClasses} {activeClasses}"
    on:mouseenter={activate}
    on:mouseleave={deactivate} />
