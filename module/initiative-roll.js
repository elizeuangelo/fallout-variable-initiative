import { getSetting } from './settings.js';

export class InitiativeRoll {
	static async create(actors) {
		const advantage = await Dialog.wait(
			{
				title: `Initiative DC Roll`,
				content: '<p style="text-align: center">Roll in an advantaged position? (+1 to Effects)<p>',
				default: 'no',
				close: () => null,
				buttons: {
					yes: {
						label: 'Yes',
						icon: '<i class="fas fa-check"></i>',
						callback: () => true,
					},
					no: {
						label: 'No',
						icon: '<i class="fas fa-times"></i>',
						callback: () => false,
					},
				},
			},
			{ jQuery: false }
		);
		if (advantage === null) return;
		if (!Array.isArray(actors)) actors = [actors];
		const rolls = actors.map((actor) => new this(actor, advantage));
		return rolls;
	}
	static async setInitiativeRolls(chatMessage, _options, userId) {
		if (game.user.id !== userId) return;
		const falloutRoll = chatMessage.flags.falloutroll;
		if (!falloutRoll) return;
		const { rollname, damage } = falloutRoll;
		const isInitiative = rollname.startsWith('Initiative DC Roll');
		if (!isInitiative) return;
		const actor = await fromUuid(chatMessage.flags.actor);
		if (!actor) return;
		const combatant = game.combat.combatants.find((c) => c.actor.uuid === chatMessage.flags.actor);
		if (!combatant) return;
		const isPlayer = actor.type === 'character';
		const total = damage + (isPlayer ? 0.1 : 0);
		combatant.update({ initiative: total });
	}
	static async rollInitiative(ids) {
		// Structure input data
		ids = typeof ids === 'string' ? [ids] : ids;
		if (ids.length === 0) return this;

		// Iterate over Combatants, performing an initiative roll for each
		const actors = [];
		for (let [, id] of ids.entries()) {
			// Get Combatant data (non-strictly)
			const combatant = this.combatants.get(id);
			if (!combatant?.isOwner) continue;
			actors.push(combatant.actor);
		}
		InitiativeRoll.create(actors);
		return this;
	}

	constructor(actor, advantage) {
		this.actor = actor;
		if (advantage) {
			this.weapon = mergeObject({
				name: '',
				'system.damage.damageType': {},
				'system.damage.damageEffect.vicious.value': 1,
			});
		}
		this.roll();
	}

	roll() {
		if (!getProperty(this.actor, 'system.initiative.value')) {
			const roll = new Roll('0', { async: false });
			roll.toMessage({
				flavor: 'Initiative DC Roll (Zero Initiative)',
				speaker: ChatMessage.getSpeaker({ actor: this.actor }),
				flags: {
					actor: this.actor.uuid,
					falloutroll: { rollname: 'Initiative DC Roll', damage: 0 },
					weapon: null,
				},
			});
			return roll;
		}
		return fallout.Roller2D20.rollD6({
			rollname: 'Initiative DC Roll',
			actor: this.actor.uuid,
			dicenum: this.actor.system.initiative.value,
			weapon: this.weapon,
		});
	}
}

Hooks.on('init', () => {
	if (!getSetting('variableInitiative')) return;
	Hooks.on('createChatMessage', InitiativeRoll.setInitiativeRolls);
	Hooks.on('setup', () => {
		Combat.prototype.rollInitiative = InitiativeRoll.rollInitiative;
	});
});
