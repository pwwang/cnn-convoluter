<script>
import { createEventDispatcher } from 'svelte';
import { Toggle } from "carbon-components-svelte";

export let value = false;
export let labelA = "Off";
export let labelB = "On";
export let disabled = false;
// export let color = "primary";
// export let classes = 'inline-flex mb-1 items-center cursor-pointer z-10';

const dispatcher = createEventDispatcher();

const change = () => {
    value = !value;
    dispatcher('change', {value: value});
}

</script>

<div class="inline-block {$$props.class}" on:click|capture|stopPropagation={change}>
    <Toggle
        bind:toggled={value}
        size="sm"
        disabled={disabled}
        labelA={labelA}
        labelB={labelB}
        on:toggle
    />
</div>
