declare const __VERSION__: string;
global.__VERSION__ = '0.5.0';

declare function deref(ref: string): RoomObject | null;

global.deref = function (ref: string): RoomObject | null { // dereference any object from identifier; see ref in RoomObjects
	return Game.getObjectById(ref) || Game.flags[ref] || Game.creeps[ref] || Game.spawns[ref] || null;
};

declare function derefRoomPosition(protoPos: protoPos): RoomPosition;

global.derefRoomPosition = function (protoPos: protoPos): RoomPosition {
	return new RoomPosition(protoPos.x, protoPos.y, protoPos.roomName);
};
