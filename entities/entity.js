import asteroid from './asteroid';
import ship from './ship';

const reducers = { asteroid, ship };

const MAX_WIDTH = 1280;
const MAX_HEIGHT = 960;

export default (state, action) => {
    switch(action.type) {
        case 'UPDATE_PHYSICS':
            const pps = action.dt / 1000;

            let velx = state.accx * pps + state.velx;
            let vely = state.accy * pps + state.vely;

            let x = state.velx * (state.speed || 1) * pps + state.x;
            if (x < 0) x = MAX_WIDTH - x;
            else if (x > MAX_WIDTH) x = x - MAX_WIDTH;

            let y = state.vely * (state.speed || 1) * pps + state.y;
            if (y < 0) y = MAX_HEIGHT - y;
            else if (y > MAX_HEIGHT) y = y - MAX_HEIGHT;

            const rotation = (state.rotationVel || 0) * action.dt + state.rotation;

            return { ...state, velx, vely, x, y, rotation };

        default:
            if (reducers[state.entityType]) {
                return reducers[state.entityType](state, action);
            } else {
                return state;
            }
    }
}
