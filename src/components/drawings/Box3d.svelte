<script>
import { createEventDispatcher } from 'svelte';

export let ix;
export let iy;
export let iz;
export let type;
export let size;
export let isPadding;
export let isActive;
export let posStyle;

$: typeClasses = (ix+iy+iz===0) ? 'bg-alert-900' : (isPadding ? 'bg-gray-600' : (
    type === 'kernel' ? 'bg-primary-900' : (
        type === 'input' ? 'bg-secondary-900' : 'bg-blue-900'
    )
));

$: activeClasses = isActive ? 'bg-opacity-100' : 'bg-opacity-25';

const dispatcher = createEventDispatcher();

const activate = () => {
    dispatcher('activate', {
        coord: [ix, iy, iz]
    });
};

const deactivate = () => {
    dispatcher('deactivate');
}
</script>

<div
    class="cube inline-box absolute {typeClasses} {activeClasses}"
    style="--size: {size}; {posStyle};"
    on:mouseenter={activate}
    on:mouseleave={deactivate}>
    <div class="side inline-box border border-white border-opacity-25 absolute side-abcd"></div>
    <div class="side inline-box border border-white border-opacity-25 absolute side-efgh"></div>
    <div class="side inline-box border border-white border-opacity-25 absolute side-abef"></div>
    <div class="side inline-box border border-white border-opacity-25 absolute side-cdgh"></div>
    <div class="side inline-box border border-white border-opacity-25 absolute side-aceg"></div>
    <div class="side inline-box border border-white border-opacity-25 absolute side-bdfh"></div>
</div>

<style>
.cube {
    transform-style: preserve-3d;
    transform-origin: center center;
    width: calc(var(--size) * 1px);
    height: calc(var(--size) * 1px);
}
.side {
    background: inherit;
    box-sizing: border-box;
    width: calc(var(--size) * 1px);
    height: calc(var(--size) * 1px);
}

/* e-------f
  /|      /|
 / |     / |
a--|----b  |
|  g----|--h
| /     | /
c-------d
*/
.side-abcd {
    top: 0;
    left: 0;
}
.side-efgh {
    top: 0;
    left: 0;
    transform: translateZ(calc(var(--size) * 1px));
}
.side-abef {
    top: 0;
    left: 0;
    transform-origin: top left;
    transform: rotateX(90deg);
}
.side-cdgh {
    bottom: 0;
    left: 0;
    transform-origin: bottom left;
    transform: rotateX(-90deg);
}
.side-aceg {
    top: 0;
    left: 0;
    transform-origin: top left;
    transform: rotateY(-90deg);
}
.side-bdfh {
    top: 0;
    right: 0;
    transform-origin: top right;
    transform: rotateY(90deg);
}
</style>
