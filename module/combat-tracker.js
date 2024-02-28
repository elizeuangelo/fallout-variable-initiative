import { getSetting } from './settings.js';

function findHookFnIdByCode(hook, code) {
	return Hooks.events[hook].find((h) => h.fn.toString().includes(code)).id;
}

/**
 * Removes the initiative attachments by unregistering the associated hooks.
 */
function removeInitiativeAttachments() {
	if (!getSetting('variableInitiative')) return;
	const ids = [
		findHookFnIdByCode('createCombatant', 'combatant.combat.setInitiative'),
		findHookFnIdByCode('updateActor', 'combatant.combat.setInitiative'),
	];
	ids.forEach((id) => Hooks.off(undefined, id));
}

Hooks.once('init', removeInitiativeAttachments);
