<script>
import { createEventDispatcher } from "svelte";

import Reset from "carbon-icons-svelte/lib/Reset.svelte";
import {TooltipIcon, TooltipDefinition, Button, Slider, Modal, ToastNotification} from "carbon-components-svelte";
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
        <h4>Settings</h4>
        <div class="leading-none flex-grow text-right">
            <TooltipIcon
                tooltipText="Reset settings"
                icon={Reset}
                on:click={ () => settings = copySettings(defaultSettings) }
            >
            </TooltipIcon>
        </div>
    </div>
    <div slot="content">

        <h5>Visualization</h5>
        <TooltipDefinition
            tooltipText="You can disable visualization, with just dimension calculation. This is useful when you have large dimensions that your browser can't visualize them."
            align="start"
        >
            <Switch
                bind:value={settings.visual}
                class="w-32"
                labelA="Disabled"
                labelB="Enabled"
            />
        </TooltipDefinition>

        {#if settings.visual}
        <Switch
            bind:value={settings.showData}
            on:change={() => setTimeout(resetView, 100)}
            labelA="Data hidden"
            labelB="Data shown"
        />
        {/if}

        {#if settings.dimty === 3}
        <br />
        <Switch
            bind:value={controlStart}
            class="w-32"
            labelA="No control"
            labelB="Controling"
        />
        <Button
            kind="primary"
            size="small"
            on:click={resetView}>
            Reset View
        </Button>
        {/if}

        <h5>Dimensionality: {settings.dimty}</h5>
        <div on:mousedown|stopPropagation={() => {settings.autoWalker = false}}>
            <Slider
                min={1}
                max={3}
                hideTextInput
                bind:value={settings.dimty} />
        </div>

        <h5>Input</h5>
        <h6>Dimension</h6>
        <SettingsDimension min={1} bind:value={settings.dims[settings.dimty].input.size} />
        <h6>Padding</h6>
        <SettingsDimension
            bind:value={settings.dims[settings.dimty].input.padding} />
        {#if settings.showData}
        <h6>Data</h6>
        <Button
            kind="primary"
            size="small"
            on:click={ () => {dataType = 'input'; randomDataUpdate();} }>
            Random
        </Button>
        <Button
            kind="primary"
            size="small"
            on:click={() => {dataType = 'input'; showDataDialog = true;}}>
            Paste
        </Button>
        <Modal
            bind:open={showDataDialog}
            preventCloseOnClickOutside
            size="lg"
            modalHeading={`Paste your ${dataType} data:`}
            primaryButtonText="Apply"
            secondaryButtons={[{ text: "Cancel" }, { text: "Random" }]}
            on:click:button--secondary={({ detail }) => {
                if (detail.text === "Cancel") {
                    showDataDialog = false;
                    dataInput.value = '';
                } else if (detail.text === "Random") {
                    randomDataToTextarea(dataInput)
                }
            }}
            on:click:button--primary={() => saveData(dataInput)}
            >
            <p>Whitespace (tab/space) delimited. </p>
            <p>For 3D data, use <code class="border">---</code> to separate at dim 0.</p>
            <p>Only integers from 0 to 10 allowed.</p>
            <textarea class="border w-full h-64" bind:this={dataInput}></textarea>
        </Modal>
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
            minLabel="conv"
            maxLabel="avgpool"
            hideTextInput
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
            kind="primary"
            size="small"
            on:click={ () => {dataType = 'kernel'; randomDataUpdate();} }>
            Random
        </Button>
        <Button
            kind="primary"
            size="small"
            on:click={() => {dataType = 'kernel'; showDataDialog = true;}}>
            Paste
        </Button>
        {/if}

        <h5>AutoWalker</h5>

        <Switch
            bind:value={settings.autoWalker}
            disabled={!settings.visual}
            class="w-32"
            on:tobble={ (e) => settings.autoWalker = e.detail }
        />

    </div>
</Container>

{#if dataError}
<ToastNotification
    lowContrast
    hideCloseButton
    kind="warning"
    timeout={2000}
    on:close={() => dataError = false}
    title={dataErrorMsg}
    caption={new Date().toLocaleString()}
    class="fixed bottom-0 left-2" />
{/if}

<style>
h5 {
    margin-top: 0.5rem;
    margin-bottom: -0.1rem;
    border-bottom: 1px dashed #ccc;
}
h6 {
    margin-top: 0.3rem;
    margin-bottom: 0.1rem;
}
:global(.bx--tooltip__trigger.bx--tooltip__trigger--definition) {
    border-bottom: 0;
}

:global(.bx--tooltip--definition .bx--tooltip__trigger) {
    border-bottom: 0;
}
</style>
