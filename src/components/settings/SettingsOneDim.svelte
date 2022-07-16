<script>
import { ToastNotification } from 'carbon-components-svelte';

// valid value
export let value;
export let min = 0;
export let errorMsg = 'Dimension must be a positive integer.';
export let bindVal;

const baseClasses = [
    "inline-box", "border", "text-xs", "py-1", "px-2", "w-1/6", "rounded", "text-black", "dark:text-gray-100", "caret-blue-500", , "dark:bg-dark-600"
];

let hovered = false;
let error = false;
// visual value in the box
let classes;

$: if (bindVal === undefined) {
    classes = [...baseClasses, "border-gray-400"];
} else if (!/^\d+$/.test(bindVal) || Number(bindVal) < min) {
    error = true;
    classes = [
        ...baseClasses,
        "border-error-500",
        hovered ? "bg-error-transDark" : "bg-error-transLight"
    ];
} else {
    error = false;
    value = Number(bindVal);
    classes = [
        ...baseClasses,
        "border-fuchsia-400",
        hovered ? "bg-primary-transDark" : "bg-primary-transLight"
    ];
}

const handleKeyup = (event) => {
    if (event.keyCode === 38) { // up arrow
        value = Number(event.target.value) + 1;
    } else if (event.keyCode === 40) { // down arrow
        const valueMinus = Number(event.target.value) - 1;
        if (valueMinus >= min) {
            value = valueMinus;
        }
    }
};

</script>

<input
    type="text"
    bind:value={bindVal}
    on:keyup={handleKeyup}
    on:mouseenter={() => hovered = !hovered}
    on:mouseleave={() => hovered = !hovered}
    on:focus={e => e.target.select()}
    disabled={value === undefined}
    class={classes.join(" ")} />

{#if error}
<ToastNotification
    lowContrast
    hideCloseButton
    kind="error"
    timeout={2000}
    title={errorMsg}
    caption={new Date().toLocaleString()}>
</ToastNotification>
{/if}
