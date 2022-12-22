<script lang="ts">
import { setVolume } from "./playMusic";
import { defineComponent } from "vue";
const defaultVolume = -24
setVolume(defaultVolume);

export default defineComponent({
    data() {
        return { defaultVolume }
    },
    methods: {
        setVolume,
    }
});

</script>

<template>
    <label for="volumeSlider">Volume</label><br />
    <input @input="(event: any) => setVolume(event.target.value)" type="range" min="-50" max="10" :value="defaultVolume"
        class="slider" id="volumeSlider" />
</template>