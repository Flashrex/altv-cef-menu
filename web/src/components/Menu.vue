<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

const sliderStep = 0.05;
const isVisible = ref(true);
const inputRefs = ref([] as any);

const header = ref({
    title: "CEF Menu",
    subtitle: "",
    color: { r: 12, g: 122, b: 55, a: 155 }
});

const position = ref({ x: 0.01, y: 0.05 });

const items = ref([] as any);

if (!('alt' in window)) {
    items.value = [
        { id: '0', type: 'item', text: 'MenuItem', description: 'MenuItem Description', icon: 'mdi-menu' },
        { id: '1', type: 'checkbox', text: 'Checkbox', description: 'Checkbox Description', icon: 'mdi-checkbox-marked', checked: true },
        { id: '2', type: 'input', text: 'Input', description: 'Input Description', icon: 'mdi-form-textbox', placeholder: 'Enter Text', value: '' },
        { id: '3', type: 'list', text: 'List', description: 'List Description', icon: 'mdi-format-list-bulleted', items: ['Item 1', 'Item 2', 'Item 3'], value: 'Item 1' },
        { id: '4', type: 'slider', text: 'Slider', description: 'Slider Description', icon: 'mdi-tune-variant', value: 0.5 },
        { id: '5', type: 'color', text: 'Color', description: 'Color Description', icon: 'mdi-format-color-fill', value: '#ff0000' }
    ];
}

const curIndex = ref(0);
const currentItem = ref(null as any);

const lighterColor = computed(() => {
    return {
        r: header.value.color.r + 50,
        g: header.value.color.g + 50,
        b: header.value.color.b + 50,
        a: header.value.color.a
    }
});

onMounted(() => {
    if (items.value.length > 0)
        currentItem.value = items.value[curIndex.value];
});

function navigateDown() {
    if (curIndex.value < items.value.length - 1) {
        curIndex.value++;
    } else {
        curIndex.value = 0;
    }

    currentItem.value = items.value[curIndex.value];
}

function navigateUp() {
    if (curIndex.value > 0) {
        curIndex.value--;
    } else {
        curIndex.value = items.value.length - 1;
    }

    currentItem.value = items.value[curIndex.value];
}

function navigateLeft() {
    switch (currentItem.value.type) {
        case 'slider':
            if (currentItem.value.value - sliderStep > 0) {
                currentItem.value.value -= sliderStep;
            } else {
                currentItem.value.value = 0;
            }
            currentItem.value.value = parseFloat(currentItem.value.value.toFixed(2));

            if ('alt' in window)
                alt.emit('view:slider-change', currentItem.value.id, currentItem.value.value);
            break;

        case 'list':
            const oldValue = currentItem.value.value;
            const index = currentItem.value.items.indexOf(currentItem.value.value);
            if (index - 1 >= 0) {
                currentItem.value.value = currentItem.value.items[index - 1];
            } else {
                currentItem.value.value = currentItem.value.items[currentItem.value.items.length - 1];
            }

            if ('alt' in window)
                alt.emit('view:list-change', currentItem.value.id, currentItem.value.value, oldValue);
            break;

        case 'color':
            break;
    }
}

function navigateRight() {
    switch (currentItem.value.type) {
        case 'slider':
            if (currentItem.value.value + sliderStep < 1.0) {
                currentItem.value.value += sliderStep;
            } else {
                currentItem.value.value = 1.0;
            }
            currentItem.value.value = parseFloat(currentItem.value.value.toFixed(2));

            if ('alt' in window)
                alt.emit('view:slider-change', currentItem.value.id, currentItem.value.value);
            break;

        case 'list':
            const oldValue = currentItem.value.value;
            const index = currentItem.value.items.indexOf(currentItem.value.value);
            if (index + 1 <= currentItem.value.items.length - 1) {
                currentItem.value.value = currentItem.value.items[index + 1];
            } else {
                currentItem.value.value = currentItem.value.items[0];
            }

            if ('alt' in window)
                alt.emit('view:list-change', currentItem.value.id, currentItem.value.value, oldValue);
            break;

        case 'color':
            break;
    }
}

function onSelect() {
    const item = items.value[curIndex.value];
    if (!item) return;

    switch (item.type) {
        case "checkbox":
            item.checked = !item.checked;
            if ('alt' in window) alt.emit('view:checkbox-change', item.id, item.checked);
            break;

        case "input":
            const input = inputRefs.value[item.id];
            if (!input) return;

            if (input === document.activeElement) {
                if ('alt' in window) {
                    alt.emit('view:input-change', item.id, item.value);
                    alt.emit('view:input-setactive', item.id, false);
                }
                input.blur();
                return;
            }
            input.focus();
            if ('alt' in window) alt.emit('view:input-setactive', item.id, true);
            break;

        case "color":
            const colorInput = inputRefs.value[item.id];
            if (!colorInput) return;

            if (colorInput === document.activeElement) {
                colorInput.blur();
                if ('alt' in window) alt.emit('view:color-setactive', item.id, false);
            } else {
                colorInput.focus();
                if ('alt' in window) alt.emit('view:color-setactive', item.id, true);
            }
            break;

        default:
            if (!('alt' in window)) return;
            alt.emit('view:select', item.id, curIndex.value);
            break;
    }
}

function onColorChange(item: any) {
    if (!('alt' in window) || currentItem.value.value !== item.value) return;

    alt.emit('view:color-change', currentItem.value.id, currentItem.value.value);
    alt.emit('view:color-setactive', item.id, false);

    const colorInput = inputRefs.value[item.id];
    if (!colorInput) return;
    colorInput.blur();
}

function addItem(item: any) {
    items.value = [...items.value, item];
    if (items.value.length === 1) currentItem.value = items.value[0];
}

function removeItem(id: number) {
    items.value = items.value.filter((item: any) => item.id !== id);
    if (items.value.length === 0) currentItem.value = null;
}

function clearItems() {
    items.value = [];
    currentItem.value = null;
    curIndex.value = 0;
}

function toggleMenu(state: boolean) {
    isVisible.value = state;
}

function selectItem(index: number) {
    curIndex.value = index;
    currentItem.value = items.value[curIndex.value];
}

function setTitle(title: string) {
    header.value.title = title;
}

function setSubtitle(subtitle: string) {
    header.value.subtitle = subtitle;
}

function setBackgroundColor(r: number, g: number, b: number, a: number) {
    header.value.color = { r, g, b, a };
}

function setPosition(x: number, y: number) {
    position.value = { x, y };
}

if ('alt' in window) {
    alt.on('view:move-down', navigateDown);
    alt.on('view:move-up', navigateUp);
    alt.on('view:move-left', navigateLeft);
    alt.on('view:move-right', navigateRight);
    alt.on('view:select', onSelect);

    alt.on('view:add-item', addItem);
    alt.on('view:remove-item', removeItem);
    alt.on('view:clear-items', clearItems);

    alt.on('view:open-menu', () => toggleMenu(true));
    alt.on('view:close-menu', () => toggleMenu(false));

    alt.on('view:set-title', setTitle);
    alt.on('view:set-description', setSubtitle);
    alt.on('view:set-bg-color', setBackgroundColor);
    alt.on('view:set-position', setPosition);
}

if (!('alt' in window)) {
    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'ArrowDown':
                navigateDown();
                break;
            case 'ArrowUp':
                navigateUp();
                break;
            case 'ArrowLeft':
                navigateLeft();
                break;
            case 'ArrowRight':
                navigateRight();
                break;
            case 'Enter':
                onSelect();
                break;
        }
    });
}
</script>

<template>
    <div v-if="isVisible" class="menu-container"
        :style="{ left: `${position.x * 100}vw`, top: `${position.y * 100}vh` }">
        <div class="header">
            <div class="header-title" :style="{
                backgroundImage: `linear-gradient(to right, rgba(${header.color.r}, ${header.color.g}, ${header.color.b}, ${header.color.a}), rgba(${lighterColor.r}, ${lighterColor.g}, ${lighterColor.b}, ${lighterColor.a}))`
            }">
                <h1>{{ header.title }}</h1>
            </div>
            <div class="header-description">
                <h3>{{ header.subtitle }}</h3>
            </div>
        </div>

        <div class="item-container">
            <div class="item" :class="curIndex === index ? 'active' : ''" v-for="(item, index) in items" :key="item.id">
                <div v-if="item.type === 'item'" @click="selectItem(index)">
                    <div class="item-header">
                        <span :class="`mdi ${item.icon}`"></span>
                        <label>{{ item.text }}</label>
                    </div>
                </div>

                <div v-else-if="item.type === 'checkbox'" @click="selectItem(index)">
                    <div class="item-header">
                        <span :class="`mdi ${item.icon}`"></span>
                        <label>{{ item.text }}</label>
                    </div>
                    <div class="checkbox-container">
                        <input type="checkbox" id="checkbox" :checked="item.checked as boolean" class="checkbox-input"
                            @change="item.checked = !item.checked" />
                        <label for="checkbox" class="checkbox-label"></label>
                    </div>
                </div>

                <div v-else-if="item.type === 'input'" @click="selectItem(index)">
                    <div class="item-header">
                        <span :class="`mdi ${item.icon}`"></span>
                        <label>{{ item.text }}</label>
                    </div>
                    <input :ref="(el) => { inputRefs[item.id] = el }" type="text"
                        :placeholder="item.placeholder as string" v-model="item.value">
                </div>

                <div v-else-if="item.type === 'list'" @click="selectItem(index)">
                    <div class="item-header">
                        <span :class="`mdi ${item.icon}`"></span>
                        <label>{{ item.text }}</label>
                    </div>
                    <select v-model="item.value">
                        <option v-for="listItem in item.items" :key="listItem">{{ listItem }}</option>
                    </select>
                </div>

                <div v-else-if="item.type === 'slider'" @click="selectItem(index)">
                    <div class="item-header">
                        <span :class="`mdi ${item.icon}`"></span>
                        <label>{{ item.text }}</label>
                    </div>
                    <div class="range-input-container" @click="selectItem(index)">
                        <input id="range" type="range" min="0" max="1" :step="sliderStep" v-model="item.value">
                        <label for="range">{{ item.value }}</label>
                    </div>
                </div>

                <div v-else-if="item.type === 'color'" @click="selectItem(index)" @change="onColorChange(item)">
                    <div class="item-header">
                        <span :class="`mdi ${item.icon}`"></span>
                        <label>{{ item.text }}</label>
                    </div>
                    <input :ref="(el) => { inputRefs[item.id] = el }" type="color" v-model="item.value">
                </div>
            </div>
        </div>

        <div v-if="currentItem" class="footer">
            <label>{{ currentItem.description }}</label>
        </div>
    </div>
</template>

<style scoped>
.menu-container {
    position: absolute;
    background-color: var(--color-background);
    width: 20vw;
    height: fit-content;
    border-radius: 5px;
    overflow: hidden;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

.header {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
}

.header-title {
    min-height: 6vh;
    width: 100%;
    padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.header-description {
    width: 100%;
    padding: 0.25rem 1rem;
    display: flex;
    align-items: left;
    background-image: linear-gradient(to right, var(--color-background-soft), var(--color-background-mute));
}

h1 {
    font-size: 1.6rem;
    font-weight: bold;
}

h3 {
    font-size: 1rem;
    font-weight: normal;
}

.item-container {
    width: 100%;
    height: fit-content;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem;
}

.item {
    width: 100%;
    height: 5vh;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 5px;
    padding: 0.5rem;
}

.item>div {
    position: relative;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    font-weight: inherit;
}

.active {
    font-weight: bold;
    background-image: linear-gradient(to right, var(--color-background-soft), var(--color-background-mute));
}

.item.active div label {
    font-weight: inherit;
}

.item-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.item-header>label {
    font-size: 1.2rem;
}

.item-header>span::before {
    font-size: 1.6rem;
}

.footer {
    width: 100%;
    padding: 1rem;
    height: fit-content;
    background-image: linear-gradient(to right, var(--color-background-soft), var(--color-background-mute));
    font-size: 1rem;
}

/* checkbox */
.checkbox-container {
    position: relative;
    margin-right: 1rem;
}

.checkbox-input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
}

.checkbox-label {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: -1rem;
    height: 20px;
    width: 20px;
    background-color: var(--color-background-soft);
    border: 2px solid var(--color-text);
    border-radius: 4px;
}

.checkbox-input:checked~.checkbox-label {
    background-color: var(--color-background-soft);
    border: 2px solid var(--color-text);
}

.checkbox-label:after,
.checkbox-label:before {
    content: "";
    position: absolute;
    display: none;
}

.checkbox-input:checked~.checkbox-label:after,
.checkbox-input:checked~.checkbox-label:before {
    display: block;
}

.checkbox-label:before {
    width: 2px;
    height: 100%;
    left: 50%;
    background-color: white;
    transform: translateX(-50%) rotate(45deg);
    transform-origin: center;
}

.checkbox-label:after {
    width: 100%;
    height: 2px;
    top: 50%;
    background-color: white;
    transform: translateY(-50%) rotate(45deg);
    transform-origin: center;
}

/* text-input */
input[type="text"] {
    background-color: var(--color-background-soft);
    border: none;
    width: 60%;
    padding: 0.5rem;
    font-size: 1rem;
    border-radius: 5px;
    /* background-color: #fff0; */
    color: var(--color-text);
}

input[type="text"]::placeholder {
    font-weight: normal;
    font-size: 1rem;
    color: var(--color-text);
}

input[type="text"]:focus {
    outline: none;
    caret-color: var(--color-text);
}

/* select input */
select {
    background-color: #fff0;
    border: none;
    color: var(--color-text);
}

/* range input */
.range-input-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: right;
    align-items: center;
    gap: 1rem;
}

.range-input-container>label {
    width: 10%;
}

input[type="range"] {
    transform: translateY(25%);
    width: 50%;
    -webkit-appearance: none;
    /* Override default appearance */
    appearance: none;
    height: 5px;
    border-radius: 5px;
    background: #d3d3d3;
    outline: none;
}

input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    /* Override default appearance */
    appearance: none;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: var(--color-text);
    cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: var(--color-text);
    cursor: pointer;
}
</style>
