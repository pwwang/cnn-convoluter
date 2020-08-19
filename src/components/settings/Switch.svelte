<script>
import { createEventDispatcher } from 'svelte';
import { Switch } from "smelte";

export let value = false;
export let label = "";
export let color = "primary";
export let classes = 'inline-flex mb-1 items-center cursor-pointer z-10';

const dispatcher = createEventDispatcher();

const change = () => {
    value = !value;
    dispatcher('change', {value: value});
}

</script>

<div class="inline-block {$$props.class}" on:click|capture|stopPropagation={change}>
    <Switch
        value={value}
        label={label}
        color={color}
        labelClasses='body-2 pl-2 cursor-pointer'
        classes={classes}
    />
</div>
