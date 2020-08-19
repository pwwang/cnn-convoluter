<script>
import Image from 'smelte/src/components/Image';
import Container from './Container.svelte';
import MatrixDrawer from './drawings/MatrixDrawer.svelte';

export let kernel;
export let visual;
export let showData;
export let scene;
export let scene2;
export let scene3;
export let inputData;
export let outputData;

</script>

<Container>
    <div slot="title">
        Kernel [{kernel.size}]
    </div>
    <div slot="content" class="text-center">
        <div class="inline-flex align-items-center">
        {#if visual}
            <MatrixDrawer
                showData={showData}
                type="kernel"
                data={kernel}
                inputData={inputData}
                outputData={outputData}
                bind:scene={scene}
                bind:scene2={scene2}
                bind:scene3={scene3}
                on:mount
                on:mousedown />
        {:else}
                <Image
                    src="https://via.placeholder.com/400x100.png?text=Visualization+disabled."
                    alt="Visualization disabled." />
        {/if}
        </div>
    </div>
</Container>

<style>
.align-items-center {
    align-items: center;
}
</style>
