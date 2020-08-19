<script>
import { Matrix } from '../../math.js';
import SettingsOneDim from "./SettingsOneDim.svelte";

export let value;
export let errorMsg;
export let min;

</script>

<SettingsOneDim
    bind:value={value[value.length-3]}
    bindVal={value[value.length-3]}
    min={min}
    errorMsg={errorMsg} />
<span class="px-1">x</span>
<SettingsOneDim
    bind:value={value[value.length-2]}
    bindVal={value[value.length-2]}
    min={min}
    errorMsg={errorMsg} />
<span class="px-1">x</span>
<SettingsOneDim
    bind:value={value[value.length-1]}
    bindVal={value[value.length-1]}
    min={min}
    errorMsg={errorMsg} />
