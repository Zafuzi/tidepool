<template>
	<div v-if="isVisible"
		 id="settings"
		 @click.stop>
		<h2>Settings</h2>
		<div class="setting-group">
			<label for="resolution">Resolution</label>
			<select id="resolution"
					v-model="selectedResolution"
					@change="onResolutionChange">
				<option value="480p">480p (854x480)</option>
				<option value="720p">720p (1280x720)</option>
				<option value="960p">960p (1280x960)</option>
				<option value="1080p">1080p (1920x1080)</option>
				<option value="1440p">1440p (2560x1440)</option>
				<option value="2160p">2160p (3840x2160)</option>
			</select>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { InputSettings } from "../core/Input";
import { resolutionMap } from "../app";

const isVisible = ref(false);
const selectedResolution = ref("720p");

const toggleSettings = () => {
	isVisible.value = !isVisible.value;
};

const onResolutionChange = () => {
	const resolution = resolutionMap[selectedResolution.value];
	if (resolution) {
		// Emit event or call a callback to update the app resolution
		window.dispatchEvent(
			new CustomEvent("resolution-change", {
				detail: resolution,
			}),
		);
	}
};

// Listen for Escape key
let escapePressed = false;

const checkEscape = () => {
	if (InputSettings.value && !escapePressed) {
		escapePressed = true;
		toggleSettings();
	} else if (!InputSettings.value && escapePressed) {
		escapePressed = false;
	}
};

let animationFrameId: number;

onMounted(() => {
	const updateLoop = () => {
		checkEscape();
		animationFrameId = requestAnimationFrame(updateLoop);
	};
	animationFrameId = requestAnimationFrame(updateLoop);
});

onUnmounted(() => {
	if (animationFrameId) {
		cancelAnimationFrame(animationFrameId);
	}
});

// Expose toggle function for external use
defineExpose({
	toggleSettings,
});
</script>

<style scoped>
#settings {
	color: #fff;
	position: absolute;
	top: 50%;
	left: 50%;
	width: 300px;
	min-height: 200px;
	background-color: #1a1a1a33;
	padding: 20px;
	border-radius: 10px;
	display: flex;
	flex-direction: column;
	gap: 15px;
	z-index: 1000;
	backdrop-filter: blur(20px);
	box-shadow: 0 0 20px 0 #1a1a1a33;
	border: 2px ridge #fafafa33;
	transform: translate(-50%, -50%);
	transition: opacity 0.3s ease-in-out;
	user-select: none;
	-webkit-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
}

#settings h2 {
	margin: 0 0 10px 0;
	font-size: 20px;
	font-weight: bold;
}

.setting-group {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.setting-group label {
	font-size: 14px;
	font-weight: 500;
}

.setting-group select {
	padding: 8px;
	border-radius: 5px;
	border: 1px solid rgba(255, 255, 255, 0.2);
	background-color: rgba(255, 255, 255, 0.1);
	color: #fff;
	font-size: 14px;
	cursor: pointer;
	transition: background-color 0.2s;
}

.setting-group select:hover {
	background-color: rgba(255, 255, 255, 0.15);
}

.setting-group select:focus {
	outline: none;
	border-color: rgba(255, 255, 255, 0.4);
	background-color: rgba(255, 255, 255, 0.15);
}

.setting-group select option {
	background-color: #1a1a1a;
	color: #fff;
}
</style>
