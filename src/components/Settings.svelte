<script>
import { createEventDispatcher } from "svelte";

import {Tooltip, Button, Slider, Switch, Icon} from "smelte";
import Container from './Container.svelte';
import SettingsDimension from './settings/SettingsDimension.svelte';
import defaultSettings from '../defaults.js';

export let settings;
export let controlStart;

let isConvKernel = true;

$: settings.dims[settings.dimty].kernel.type = isConvKernel ? "conv" : "pool";

const dispatcher = createEventDispatcher();
const resetView = () => {
    dispatcher('viewReset');
};

</script>

<Container>
    <div slot="title" class="flex flex-row" style="align-items: center;">
        <div>Settings</div>
        <div class="leading-none flex-grow text-right">
            <Tooltip>
                <div slot="activator">
                    <Icon
                        on:click={() => settings = JSON.parse(JSON.stringify(defaultSettings))}
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
                <Button
                    small
                    flat
                    light={!settings.visual}
                    on:click = {() => settings.visual = !settings.visual}>
                    {settings.visual ? 'Disable' : 'Enable'}
                </Button>
            </div>
            You can disable visualization, with just dimension calculation. <br />
            This is useful when you have large dimensions that your browser can't visualize them.
        </Tooltip>
        {#if settings.dimty === 3}
        <Button
            small
            flat
            light={!controlStart}
            on:click = {() => controlStart = !controlStart}>
            {controlStart ? 'Stop Control' : 'Start Control'}
        </Button>
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
        <Slider
            min={Math.min(...Object.keys(settings.dims))}
            max={Math.max(...Object.keys(settings.dims))}
            bind:value={settings.dimty} />

        <div class="subtitle-1 font-medium mb-1 mt-3">
            Input Dimension
        </div>
        <SettingsDimension bind:value={settings.dims[settings.dimty].input} />

        <div class="subtitle-1 font-medium mb-1 mt-3">
            Kernel
        </div>

        <!-- <div class="body-2">
            Type: {settings.dims[settings.dimty].kernel.type}
        </div>
        <Tooltip>
            <div slot="activator">
                <Switch bind:value={isConvKernel} />
            </div>
            It makes no difference for kernel type until input and kernel data loading is implemented.
        </Tooltip> -->

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

        <div class="body-2">Padding</div>
        <SettingsDimension
            bind:value={settings.dims[settings.dimty].kernel.padding} />

        <div class="body-2">Dilation</div>
        <SettingsDimension
            bind:value={settings.dims[settings.dimty].kernel.dilation}
            min={1}
            errorMsg="Dilation must be a natural number." />

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

<style>
:global(.tooltip) {
    left: 110% !important;
    top: -10px !important;
    transform: none !important;
}
</style>
