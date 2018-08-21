import { combineReducers } from 'redux';

import entities from './entities';
import stars from './stars';
import game from './game';
import debug from './debugger';

export default combineReducers({
    entities,
    stars,
    game,
    debug,
});
