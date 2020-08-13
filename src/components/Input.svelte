<script>
import Image from 'smelte/src/components/Image';
import Container from './Container.svelte';
import MatrixDrawer from './drawings/MatrixDrawer.svelte';

export let input;
export let padding;
export let visual;
export let actives;
export let scene
</script>

<Container>
    <div slot="title">
        Input [{input}]
    </div>
    <div slot="content" class="text-center">
    {#if visual}
        <MatrixDrawer
            dim={input}
            padding={padding}
            actives={actives}
            bind:scene={scene}
            on:activate
            on:deactivate
            on:mousedown
            on:mount
            type="input" />
    {:else}
        <Image
            src="https://via.placeholder.com/300x300.png?text=Visualization+disabled."
            alt="Visualization disabled." />
    {/if}
    </div>
</Container>
