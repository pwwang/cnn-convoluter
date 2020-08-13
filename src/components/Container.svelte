<div class="container p-4">
    <h6 class="mb-2 text-lg">
        <!-- see: https://github.com/sveltejs/svelte/issues/4546#issuecomment-627357929 -->
        <slot name="title"></slot>
        {#if false}<slot></slot>{/if}
    </h6>
    <div class="content">
        <slot name="content"></slot>
        {#if false}<slot></slot>{/if}
    </div>
</div>
