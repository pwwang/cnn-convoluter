<script>
import { ImageLoader } from "carbon-components-svelte";
import Container from './Container.svelte';
import MatrixDrawer from './drawings/MatrixDrawer.svelte';

export let input;
export let visual;
export let showData;
export let actives;
export let scene
</script>

<Container>
    <div slot="title">
        Input [{input.size}]
    </div>
    <div slot="content" class="text-center">
    {#if visual}
        <MatrixDrawer
            showData={showData}
            actives={actives}
            bind:scene={scene}
            data={input}
            on:activate
            on:deactivate
            on:mousedown
            on:mount
            type="input" />
    {:else}
        <ImageLoader
            src="https://via.placeholder.com/300x300.png?text=Visualization+disabled."
            alt="Visualization disabled." />
    {/if}
    </div>
</Container>
