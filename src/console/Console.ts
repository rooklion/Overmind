// Command line

import {Colony} from '../Colony';
import {toColumns} from '../utilities/utils';
import {asciiLogoSmall} from '../visuals/logos';
import {log} from './log';
import {alignedNewline, bullet} from '../utilities/stringConstants';
import {DEFAULT_OVERMIND_SIGNATURE, MY_USERNAME, USE_PROFILER} from '../~settings';
import {Pathing} from '../movement/Pathing';

export class OvermindConsole {

	static init() {
		global.help = this.help();
		global.info = this.info;
		global.debug = this.debug;
		global.stopDebug = this.stopDebug;
		global.setMode = this.setMode;
		global.setSignature = this.setSignature;
		global.print = this.print;
		global.timeit = this.timeit;
		global.setLogLevel = log.setLogLevel;
		global.openRoomPlanner = this.openRoomPlanner;
		global.closeRoomPlanner = this.closeRoomPlanner;
		global.cancelRoomPlanner = this.cancelRoomPlanner;
		global.listActiveRoomPlanners = this.listActiveRoomPlanners;
		global.destroyErrantStructures = this.destroyErrantStructures;
		global.destroyAllHostileStructures = this.destroyAllHostileStructures;
		global.destroyAllBarriers = this.destroyAllBarriers;
		global.listAllDirectives = this.listAllDirectives;
		global.listPersistentDirectives = this.listPersistentDirectives;
		global.removeAllLogisticsDirectives = this.removeAllLogisticsDirectives;
		global.removeFlagsByColor = this.removeFlagsByColor;
		global.removeErrantFlags = this.removeErrantFlags;
		global.deepCleanMemory = this.deepCleanMemory;

		//local functions
		global.clearConSites = this.clearConSites;
		global.clearFlags = this.clearFlags;
		global.getPathLength = this.getPathLength;
	}

	// Local functions =================================================================================================
	static clearConSites(room?: string) {
		if (room) {
			if (Game.rooms[room]) {
				_.forEach(Game.constructionSites, s =>
				{
					if (s.pos.roomName == room) {
						if (Memory.constructionSites[s.id])
							delete Memory.constructionSites[s.id];
						s.remove();
					}
				});
			} else {
				log.alert("No room found in memory with roomName: " + room);
			}
		} else {
			_.forEach(Game.constructionSites, s => s.remove());
			Memory.constructionSites = {};
			
		}
		return "Done."
	}

	static clearFlags(room: string) {
		_.forEach(Game.flags, f => {
			if (f.pos.roomName == room) {
				f.remove();
			}
		});
		return "Done."
	}

	static getPathLength(pos1: RoomPosition, pos2: RoomPosition, preferHighway: boolean = false) {
		let path = Pathing.findPath(pos1, pos2, {preferHighway: preferHighway});
		if (path.path) {
			return path.path.length;
		}
		return "No path found.";
	}

	// Help, information, and operational changes ======================================================================

	static help() {
		let msg = '\n<font color="#ff00ff">';
		for (let line of asciiLogoSmall) {
			msg += line + '\n';
		}
		msg += '</font>';

		let descr: { [functionName: string]: string } = {};
		descr['help'] = 'show this message';
		descr['info()'] = 'display version and operation information';
		descr['setMode(mode)'] = 'set the operational mode to "manual", "semiautomatic", or "automatic"';
		descr['setSignature(newSignature)'] = 'set your controller signature; no argument sets to default';
		descr['print(...args[])'] = 'log stringified objects to the console';
		descr['debug(thing)'] = 'enable debug logging for a game object or process';
		descr['stopDebug(thing)'] = 'disable debug logging for a game object or process';
		descr['timeit(function, repeat=1)'] = 'time the execution of a snippet of code';
		descr['setLogLevel(int)'] = 'set the logging level from 0 - 4';
		descr['openRoomPlanner(roomName)'] = 'open the room planner for a room';
		descr['closeRoomPlanner(roomName)'] = 'close the room planner and save changes';
		descr['cancelRoomPlanner(roomName)'] = 'close the room planner and discard changes';
		descr['listActiveRoomPlanners()'] = 'display a list of colonies with open room planners';
		descr['destroyErrantStructures(roomName)'] = 'destroys all misplaced structures within an owned room';
		descr['destroyAllHostileStructures(roomName)'] = 'destroys all hostile structures in an owned room';
		descr['destroyAllBarriers(roomName)'] = 'destroys all ramparts and barriers in a room';
		descr['listAllDirectives()'] = 'print type, name, pos of every directive';
		descr['listPersistentDirectives()'] = 'print type, name, pos of every persistent directive';
		descr['removeFlagsByColor(color, secondaryColor)'] = 'remove flags that match the specified colors';
		descr['removeErrantFlags()'] = 'remove all flags which don\'t match a directive';
		descr['deepCleanMemory()'] = 'deletes all non-critical portions of memory (be careful!)';
		// Console list
		let descrMsg = toColumns(descr, {justify: true, padChar: '.'});
		let maxLineLength = _.max(_.map(descrMsg, line => line.length)) + 2;
		msg += 'Console Commands: '.padRight(maxLineLength, '=') + '\n' + descrMsg.join('\n');

		msg += '\n\nRefer to the repository for more information\n';

		return msg;
	}

	static info(aligned = false): string {
		const b = bullet;
		const checksum = Assimilator.generateChecksum();
		const clearanceCode = Assimilator.getClearanceCode(MY_USERNAME);
		let baseInfo = [
			`${b}Version:        Overmind v${__VERSION__}`,
			`${b}Checksum:       ${checksum}`,
			`${b}Assimilated:    ${clearanceCode ? 'Yes' : 'No'} (clearance code: ${clearanceCode}) [WIP]`,
			`${b}Operating mode: ${Memory.settings.operationMode}`,
			// `${b}CPU bucket:     ${Game.cpu.bucket}`
		];
		// let colonyInfo = [
		// 	`${b}Colonies:`,
		// ]
		// for (let colony of getAllColonies()) {
		// 	colonyInfo.push(`    ${b}`)
		// }
		const joinChar = aligned ? alignedNewline : '\n';
		return baseInfo.join(joinChar);
	}

	static setMode(mode: operationMode): string {
		switch (mode) {
			case 'manual':
				Memory.settings.operationMode = 'manual';
				return `Operational mode set to manual. Only defensive directives will be placed automatically; ` +
					   `remove harvesting, claiming, room planning, and raiding must be done manually.`;
			case 'semiautomatic':
				Memory.settings.operationMode = 'semiautomatic';
				return `Operational mode set to semiautomatic. Claiming, room planning, and raiding must be done ` +
					   `manually; everything else is automatic.`;
			case 'automatic':
				Memory.settings.operationMode = 'automatic';
				return `Operational mode set to automatic. All actions are done automatically, but manually placed ` +
					   `directives will still be responded to.`;
			default:
				return `Invalid mode: please specify 'manual', 'semiautomatic', or 'automatic'.`;
		}
	}


	static setSignature(signature: string | undefined): string | undefined {
		let sig = signature ? signature : DEFAULT_OVERMIND_SIGNATURE;
		if (sig.toLowerCase().includes('overmind') || sig.includes(DEFAULT_OVERMIND_SIGNATURE)) {
			Memory.settings.signature = sig;
			return `Controller signature set to ${sig}`;
		} else {
			throw new Error(`Invalid signature: ${signature}; must contain the string "Overmind" or ` +
							`${DEFAULT_OVERMIND_SIGNATURE} (accessible on global with __DEFAULT_OVERMIND_SIGNATURE__)`);
		}
	}


	// Debugging methods ===============================================================================================

	static debug(thing: { name: string, memory: any }): string {
		thing.memory.debug = true;
		return `Enabled debugging for ${thing.name}.`;
	}

	static stopDebug(thing: { name: string, memory: any }): string {
		delete thing.memory.debug;
		return `Disabled debugging for ${thing.name}.`;
	}

	static print(...args: any[]): string {
		for (let arg of args) {
			let cache: any = [];
			let msg = JSON.stringify(arg, function (key, value) {
				if (typeof value === 'object' && value !== null) {
					if (cache.indexOf(value) !== -1) {
						// Duplicate reference found
						try {
							// If this value does not reference a parent it can be deduped
							return JSON.parse(JSON.stringify(value));
						} catch (error) {
							// discard key if value cannot be deduped
							return;
						}
					}
					// Store value in our collection
					cache.push(value);
				}
				return value;
			}, '\t');
			cache = null;
			log.debug(msg);
		}
		return 'Done.';
	}

	static timeit(callback: () => any, repeat = 1): string {
		let start, used, i: number;
		start = Game.cpu.getUsed();
		for (i = 0; i < repeat; i++) {
			callback();
		}
		used = Game.cpu.getUsed() - start;
		return `CPU used: ${used}. Repetitions: ${repeat} (${used / repeat} each).`;
	}


	// Room planner control ============================================================================================

	static openRoomPlanner(roomName: string): string {
		if (Overmind.colonies[roomName]) {
			if (Overmind.colonies[roomName].roomPlanner.active != true) {
				Overmind.colonies[roomName].roomPlanner.active = true;
				return '';
			} else {
				return `RoomPlanner for ${roomName} is already active!`;
			}
		} else {
			return `Error: ${roomName} is not a valid colony!`;
		}
	}

	static closeRoomPlanner(roomName: string): string {
		if (Overmind.colonies[roomName]) {
			if (Overmind.colonies[roomName].roomPlanner.active == true) {
				Overmind.colonies[roomName].roomPlanner.finalize();
				return '';
			} else {
				return `RoomPlanner for ${roomName} is not active!`;
			}
		} else {
			return `Error: ${roomName} is not a valid colony!`;
		}
	}

	static cancelRoomPlanner(roomName: string): string {
		if (Overmind.colonies[roomName]) {
			if (Overmind.colonies[roomName].roomPlanner.active == true) {
				Overmind.colonies[roomName].roomPlanner.active = false;
				return `RoomPlanner for ${roomName} has been deactivated without saving changes`;
			} else {
				return `RoomPlanner for ${roomName} is not active!`;
			}
		} else {
			return `Error: ${roomName} is not a valid colony!`;
		}
	}

	static listActiveRoomPlanners(): string {
		let coloniesWithActiveRoomPlanners: Colony[] = _.filter(
			_.map(_.keys(Overmind.colonies), colonyName => Overmind.colonies[colonyName]),
			(colony: Colony) => colony.roomPlanner.active);
		let names: string[] = _.map(coloniesWithActiveRoomPlanners, colony => colony.room.print);
		if (names.length > 0) {
			console.log('Colonies with active room planners: ' + names);
			return '';
		} else {
			return `No colonies with active room planners`;
		}
	}


	// Directive management ============================================================================================

	static listAllDirectives(): string {
		let msg = '';
		for (let i in Overmind.directives) {
			let dir = Overmind.directives[i];
			msg += `Type: ${dir.directiveName}`.padRight(20) +
				   `Name: ${dir.name}`.padRight(15) +
				   `Pos: ${dir.pos.print}\n`;
		}
		return msg;
	}

	static removeAllLogisticsDirectives(): string {
		let logisticsFlags = _.filter(Game.flags, flag => flag.color == COLOR_YELLOW &&
														  flag.secondaryColor == COLOR_YELLOW);
		for (let dir of logisticsFlags) {
			dir.remove();
		}
		return `Removed ${logisticsFlags.length} logistics directives.`;
	}

	static listPersistentDirectives(): string {
		let msg = '';
		for (let i in Overmind.directives) {
			let dir = Overmind.directives[i];
			if (dir.memory.persistent) {
				msg += `Type: ${dir.directiveName}`.padRight(20) +
					   `Name: ${dir.name}`.padRight(15) +
					   `Pos: ${dir.pos.print}\n`;
			}
		}
		return msg;
	}

	static removeFlagsByColor(color: ColorConstant, secondaryColor: ColorConstant): string {
		let removeFlags = _.filter(Game.flags, flag => flag.color == color && flag.secondaryColor == secondaryColor);
		for (let flag of removeFlags) {
			flag.remove();
		}
		return `Removed ${removeFlags.length} flags.`;
	}

	static removeErrantFlags(): string {
		// This may need to be be run several times depending on visibility
		if (USE_PROFILER) {
			return `ERROR: should not be run while profiling is enabled!`;
		}
		let count = 0;
		for (let name in Game.flags) {
			if (!Overmind.directives[name]) {
				Game.flags[name].remove();
				count += 1;
			}
		}
		return `Removed ${count} flags.`;
	}


	// Structure management ============================================================================================

	static destroyErrantStructures(roomName: string): string {
		let colony = Overmind.colonies[roomName] as Colony;
		if (!colony) return `${roomName} is not a valid colony!`;
		let room = colony.room;
		let allStructures = room.find(FIND_STRUCTURES);
		let i = 0;
		for (let s of allStructures) {
			if (s.structureType == STRUCTURE_CONTROLLER) continue;
			if (!colony.roomPlanner.structureShouldBeHere(s.structureType, s.pos)) {
				let result = s.destroy();
				if (result == OK) {
					i++;
				}
			}
		}
		return `Destroyed ${i} misplaced structures in ${roomName}.`;
	}

	static destroyAllHostileStructures(roomName: string): string {
		let room = Game.rooms[roomName];
		if (!room) return `${roomName} is undefined! (No vision?)`;
		if (!room.my) return `${roomName} is not owned by you!`;
		let hostileStructures = room.find(FIND_HOSTILE_STRUCTURES);
		for (let structure of hostileStructures) {
			structure.destroy();
		}
		return `Destroyed ${hostileStructures.length} hostile structures.`;
	}

	static destroyAllBarriers(roomName: string): string {
		let room = Game.rooms[roomName];
		if (!room) return `${roomName} is undefined! (No vision?)`;
		if (!room.my) return `${roomName} is not owned by you!`;
		for (let barrier of room.barriers) {
			barrier.destroy();
		}
		return `Destroyed ${room.barriers.length} barriers.`;
	}


	// Memory management ===============================================================================================

	static deepCleanMemory(): string {
		// Clean colony memory
		let protectedColonyKeys = ['defcon', 'roomPlanner', 'roadPlanner', 'barrierPlanner'];
		for (let colName in Memory.colonies) {
			for (let key in Memory.colonies[colName]) {
				if (!protectedColonyKeys.includes(key)) {
					delete (<any>Memory.colonies[colName])[key];
				}
			}
		}
		// Suicide any creeps which have no memory
		for (let i in Game.creeps) {
			if (<any>Game.creeps[i].memory == {}) {
				Game.creeps[i].suicide();
			}
		}
		// Remove profiler memory
		delete Memory.profiler;
		// Remove overlords memory from flags
		for (let i in Memory.flags) {
			if ((<any>Memory.flags[i]).overlords) {
				delete (<any>Memory.flags[i]).overlords;
			}
		}
		// Clean creep memory
		for (let i in Memory.creeps) {
			// Remove all creep tasks to fix memory leak in 0.3.1
			if (Memory.creeps[i].task) {
				Memory.creeps[i].task = null;
			}
		}
		return `Memory has been cleaned.`;
	}
}