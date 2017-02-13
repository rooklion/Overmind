// Creep prototype goTask functions; wrapper for creep.task() and moveTo
// All functions return (result of moveTo or task) or ERR_NO_TARGET_FOUND = 1.
// Retargeting function can be passed in the optional parameter retargetFunc

Creep.prototype.goTask = function (actionCall,
    {
        retargetCall = null,
        retargetConditions = '(response == ERR_INVALID_TARGET || response == ERR_FULL)',
        pathColor = null
    }) {
    // Base class for general moveTo + do task + retarget function.
    // Arguments:
    //     actionCall: string literal executed with eval to do the requested action
    //     retargetCall: string literal executed with eval to handle retargeting
    //     retargetConditions: string literal evaluated to a boolean to handle retargeting conditions
    //     pathColor: string representing the roomVisual path color
    var target = Game.getObjectById(this.memory.target);
    var response = eval("this." + actionCall);
    if ((!target || eval(retargetConditions)) && retargetCall != null) {
        // Only the two errors above will trigger a retarget
        // Retarget using the retargetFunc call
        var retargetResponse = eval("this." + retargetCall);
        // console.log("2:"+retargetResponse);
        if (retargetResponse == OK) {
            return this.goTask(actionCall, {retargetCall: retargetCall, pathColor: retargetCall});
        } else {
            return retargetResponse;
        }
    } else if (response == ERR_NOT_IN_RANGE) { // If target is out of range, move to it
        if (pathColor) {
            return this.moveToVisual(target, pathColor);
        } else {
            return this.moveToVisual(target);
        }
    }
    else {
        return response;
    }
};

Creep.prototype.goAttack = function (retarget = 'targetClosestEnemy()') {
    return this.goTask('attack(target)', {retargetCall: retarget, pathColor: 'red'});
};

Creep.prototype.goTransfer = function (retarget = 'targetClosestSink()') {
    return this.goTask('transfer(target, RESOURCE_ENERGY)', {retargetCall: retarget, pathColor: 'blue'});
};

Creep.prototype.goHarvest = function (retarget = 'targetClosestUnsaturatedSource()') {
    return this.goTask('harvest(target)', {retargetCall: retarget, pathColor: 'yellow'});
};

Creep.prototype.goBuild = function (retarget = 'targetClosestJob()') {
    return this.goTask('build(target)', {retargetCall: retarget, pathColor: 'yellow'});
};

Creep.prototype.goHeal = function (retarget = 'targetClosestDamagedCreep()') {
    return this.goTask('heal(target)', {retargetCall: retarget, pathColor: 'green'});
};

Creep.prototype.goRepair = function (retarget = 'targetClosestUntargetedRepair()') {
    return this.goTask('repair(target)',
                       {
                           retargetCall: retarget,
                           retargetConditions: '(response == ERR_INVALID_TARGET || target.hits == target.hitsMax)',
                           pathColor: 'green'
                       });
};

Creep.prototype.goWithdraw = function (retarget = 'targetClosestContainerOrStorage()') {
    return this.goTask('withdraw(target, RESOURCE_ENERGY)',
                       {
                           retargetCall: retarget,
                           retargetConditions: '(response == ERR_INVALID_TARGET || ' +
                                               'target.store[RESOURCE_ENERGY] == 0 ||' +
                                               'response == ERR_NOT_ENOUGH_RESOURCES)'
                       });
};

Creep.prototype.goWithdrawFullest = function (retarget = 'targetFullestContainer()') {
    return this.goTask('withdraw(target, RESOURCE_ENERGY)',
                       {
                           retargetCall: retarget,
                           retargetConditions: '(response == ERR_INVALID_TARGET || ' +
                                               'target.store[RESOURCE_ENERGY] == 0 ||' +
                                               'response == ERR_NOT_ENOUGH_RESOURCES)'
                       });
};


Creep.prototype.goWithdrawStorage = function (retarget = 'targetFullestContainer()') {
    return this.goTask('withdraw(this.room.storage, RESOURCE_ENERGY)',
                       {
                           retargetCall: retarget,
                           retargetConditions: '(response == ERR_INVALID_TARGET || ' +
                                               'response == ERR_NOT_ENOUGH_RESOURCES)'
                       });
};