import {Task} from '../Task';
import {profile} from '../../profiler/decorator';

export type getRenewedTargetType = StructureSpawn;
export const getRenewedTaskName = 'getRenewed';

@profile
export class TaskGetRenewed extends Task {
	target: getRenewedTargetType;

	constructor(target: getRenewedTargetType, options = {} as TaskOptions) {
		super(getRenewedTaskName, target, options);
	}

	isValidTask() {
		let hasClaimPart = _.filter(this.creep.body, (part: BodyPartDefinition) => part.type == CLAIM).length > 0;
		let lifetime = hasClaimPart ? CREEP_CLAIM_LIFE_TIME : CREEP_LIFE_TIME;
		return this.creep.ticksToLive != undefined && this.creep.ticksToLive < 0.9 * lifetime;
	}

	isValidTarget() {
		return this.target.my && !this.target.spawning;
	}

	work() {
		return this.target.renewCreep(this.creep.creep);
	}
}
