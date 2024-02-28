export const MODULE_ID = 'fallout-variable-initiative';

const settings = {
	variableInitiative: {
		name: 'Use Variable Initiative Rule',
		scope: 'world',
		config: true,
		type: Boolean,
		default: true,
		requiresReload: true,
	},
};

/**
 * Retrieves the value of a setting.
 * @param {string} name - The name of the setting.
 * @returns {*} - The value of the setting.
 */
export function getSetting(name) {
	return game.settings.get(MODULE_ID, name);
}

/**
 * Sets a module setting with the specified name and value.
 * @param {string} name - The name of the setting.
 * @param {*} value - The value to set for the setting.
 * @returns {Promise} A Promise that resolves when the setting is successfully set.
 */
export function setSetting(name, value) {
	return game.settings.set(MODULE_ID, name, value);
}

Hooks.once('init', () => {
	for (const [key, setting] of Object.entries(settings)) {
		game.settings.register(MODULE_ID, key, setting);
	}
});
