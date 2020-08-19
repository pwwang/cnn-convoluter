<script>
import { createEventDispatcher } from "svelte";

import {Tooltip, Button, Slider, Icon, Dialog, Snackbar} from "smelte";
import Container from './Container.svelte';
import SettingsDimension from './settings/SettingsDimension.svelte';
import Switch from './settings/Switch.svelte';
import { prod, Matrix } from '../math.js';
import { defaultSettings, copySettings } from '../settings.js';

export let settings;
export let controlStart;

let kernelType = 1;

$: settings.dims[settings.dimty].kernel.type = kernelType === 1 ? 'conv' : (
    kernelType === 2 ? 'maxpool' : 'avgpool'
)
$: if (!settings.visual) {
    settings.showData = false;
}

let showDataDialog = false;
let dataInput;
let dataType;
let dataError = false;
let dataErrorMsg;

const dispatcher = createEventDispatcher();
const resetView = () => {
    dispatcher('viewReset');
};

$: randomDataUpdate = () => {
    if (dataType === 'kernel') {
        settings.dims[settings.dimty].kernel.data = Matrix.random(
            settings.dims[settings.dimty].kernel.data.size, -1, 1
        );
    } else {
        settings.dims[settings.dimty].input.data = Matrix.random(
            settings.dims[settings.dimty].input.data.size
        );
    }
};

$: randomDataToTextarea = (textarea) => {
    textarea.value = dataType === 'kernel' ?
        Matrix.random(settings.dims[settings.dimty].kernel.data.size, -1, 1).stringify() :
        Matrix.random(settings.dims[settings.dimty].input.data.size).stringify();
};

$: saveData = (textarea) => {
    if (dataError) {dataError = false;}
    try {
        const data = Matrix.fromString(textarea.value);
        const total = prod(
            dataType === 'kernel' ?
                settings.dims[settings.dimty].kernel.data.size :
                settings.dims[settings.dimty].input.data.size
        );
        if (total !== prod(data.size)) {
            throw `Dimension mismatch. Expected total ${total} elements,
                but got ${prod(data.size)}`;
        }

        if (dataType === 'kernel') {
            data.reshape(settings.dims[settings.dimty].kernel.data.size);
            settings.dims[settings.dimty].kernel.data = data;
        } else {
            data.reshape(settings.dims[settings.dimty].input.data.size);
            settings.dims[settings.dimty].input.data = data;
        }
        showDataDialog = false;
    } catch(e) {
        dataError = true;
        dataErrorMsg = e;
    }
};

$: settings.dims[settings.dimty].input.data.resize(
    settings.dims[settings.dimty].input.size,
    {fill: 'random', min: 0, max: 9}
);

$: settings.dims[settings.dimty].kernel.data.resize(
    settings.dims[settings.dimty].kernel.size,
    {fill: 'random', min: -1, max: 1}
);

</script>

<Container>
    <div slot="title" class="flex flex-row" style="align-items: center;">
        <div>Settings</div>
        <div class="leading-none flex-grow text-right">
            <Tooltip>
                <div slot="activator">
                    <Icon
                        on:click={() => settings = copySettings(defaultSettings)}
                        class="cursor-pointer">
                        settings_backup_restore
                    </Icon>
                </div>
                Reset settings
            </Tooltip>
        </div>
    </div>
    <div slot="content">

        <div class="subtitle-1 font-medium mb-1">Visualization</div>
        <Tooltip>
            <div slot="activator">
                <Switch
                    bind:value={settings.visual}
                    class="w-32"
                    label={settings.visual ? 'Disable' : 'Enable'}
                />
            </div>
            You can disable visualization, with just dimension calculation. <br />
            This is useful when you have large dimensions that your browser can't visualize them.
        </Tooltip>

        {#if settings.visual}
        <Switch
            bind:value={settings.showData}
            label={settings.showData ? 'Hide Data' : 'Show Data'}
        />
        {/if}

        {#if settings.dimty === 3}
        <Switch
            bind:value={controlStart}
            class="w-32"
            label={controlStart ? 'Stop Control' : 'Start Control'}
        />
        <Button
            small
            flat
            color="blue"
            on:click = {resetView}>
            Reset View
        </Button>
        {/if}

        <div class="subtitle-1 font-medium mb-1 mt-3">
            Dimensionality: {settings.dimty}
        </div>
        <div on:mousedown|stopPropagation={() => {settings.autoWalker = false}}>
            <Slider
                min={1}
                max={3}
                bind:value={settings.dimty} />
        </div>

        <div class="subtitle-1 font-medium mb-1 mt-3">
            Input
        </div>
        <div class="body-2">Dimension</div>
        <SettingsDimension min={1} bind:value={settings.dims[settings.dimty].input.size} />
        <div class="body-2">Padding</div>
        <SettingsDimension
            bind:value={settings.dims[settings.dimty].input.padding} />
        {#if settings.showData}
        <div class="body-2">Data</div>
        <Button
            small
            flat
            on:click = { () => {dataType = 'input'; randomDataUpdate();} }>
            Random
        </Button>
        <Button
            small
            flat
            on:click = {() => {dataType = 'input'; showDataDialog = true;}}>
            Paste
        </Button>
        <Dialog bind:value={showDataDialog} class="w-1/2 h-auto" persistent>
            <h5 slot="title">Paste your {dataType} data:</h5>
            <div class="text-gray-700">Whitespace (tab/space) delimited. </div>
            <div class="text-gray-700">For 3D data, use <code class="border">---</code> to separate at dim 0.</div>
            <div class="text-gray-700 mb-1">Only integers from 0 to 10 allowed.</div>
            <textarea class="border w-full h-64" bind:this={dataInput}></textarea>
            <div slot="actions">
                <Button text
                    on:click={() => randomDataToTextarea(dataInput)}>
                    Random
                </Button>
                <Button text
                    on:click={() => saveData(dataInput)}>
                    Apply
                </Button>
                <Button text color="alert"
                    on:click={() => {showDataDialog = false; dataInput.value = ''}}>Cancel
                </Button>
            </div>
        </Dialog>
        {/if}

        <div class="subtitle-1 font-medium mb-1 mt-3">
            Kernel
        </div>

        {#if settings.showData}
        <div class="body-2">
            Type: {settings.dims[settings.dimty].kernel.type}
        </div>
        <Slider
            min={1}
            max={3}
            bind:value={kernelType} />
        {/if}

        <div class="body-2">
            Size
        </div>
        <SettingsDimension
            bind:value={settings.dims[settings.dimty].kernel.size}
            min={1}
            errorMsg="Kernel size must be a natural number." />

        <div class="body-2">Stride</div>
        <SettingsDimension
            bind:value={settings.dims[settings.dimty].kernel.stride}
            min={1}
            errorMsg="Stride must be a natural number." />


        <div class="body-2">Dilation</div>
        <SettingsDimension
            bind:value={settings.dims[settings.dimty].kernel.dilation}
            min={1}
            errorMsg="Dilation must be a natural number." />

        {#if settings.showData && kernelType === 1}
        <div class="body-2">Data</div>
        <Button
            small
            flat
            on:click = { () => {dataType = 'kernel'; randomDataUpdate();} }>
            Random
        </Button>
        <Button
            small
            flat
            on:click = {() => {dataType = 'kernel'; showDataDialog = true;}}>
            Paste
        </Button>
        {/if}

        <div class="subtitle-1 font-medium mb-1 mt-3">AutoWalker</div>
        <Tooltip>
            <div slot="activator">
                <Button
                    small
                    flat
                    light={!settings.autoWalker}
                    disabled={!settings.visual}
                    on:click = {() => settings.autoWalker = !settings.autoWalker}
                    value={settings.autoWalker}>
                    {settings.autoWalker ? 'Stop' : 'Start'}
                </Button>
            </div>
            autoWalker will be automatically stopped while you hover on the input or output.
        </Tooltip>

    </div>
</Container>

<Snackbar
  noAction
  color="alert"
  hash="dataerror"
  timeout={2000}
  class="pointer-events-auto flex absolute py-2 text-sm
         px-4 z-30 mb-4 content-between mx-auto
         rounded items-center elevation-2"
  left
  value={dataError}>
  <div>{dataErrorMsg}</div>
</Snackbar>

<style>
:global(.tooltip) {
    left: 110% !important;
    top: -10px !important;
    transform: none !important;
}
</style>
