// Sandbox code: lets you try out random stuff at the end of main loop

import {log} from './console/log';

export function sandbox() {
	try {
		//_.forEach(Game.constructionSites, s => s.remove());
		//Memory.constructionSites = {};
	} catch (e) {
		log.error(e);
	}
}