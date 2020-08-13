<script>
import Image from 'smelte/src/components/Image';
import Container from './Container.svelte';
import MatrixDrawer from './drawings/MatrixDrawer.svelte';

export let kernel;
export let visual;
export let scene;
</script>

<Container>
    <div slot="title">
        Kernel [{kernel.size}]
    </div>
    <div slot="content" class="text-center">
    {#if visual}
        <MatrixDrawer
            dim={kernel.size}
            type="kernel"
            bind:scene={scene}
            on:mount
            on:mousedown />
    {:else}
            <Image
                src="https://via.placeholder.com/400x100.png?text=Visualization+disabled."
                alt="Visualization disabled." />
    {/if}
    </div>
</Container>
