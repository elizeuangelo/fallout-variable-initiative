import { getSetting } from './settings.js';

/**
 * Removes the initiative attachments by unregistering the associated hooks.
 */
function removeInitiativeAttachments() {
	if (!getSetting('variableInitiative')) return;
	const ids = [Hooks.events['createCombatant'][0].id, Hooks.events['updateActor'][0].id];
	ids.forEach((id) => Hooks.off(undefined, id));
}

Hooks.once('init', removeInitiativeAttachments);
