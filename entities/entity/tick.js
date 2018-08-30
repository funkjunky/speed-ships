// Note: used in ship/tick.js
export const applyPhysics = (state, scale) => {
    const pps = action.dt / 1000;

    // TODO: normalize velx and vely, so `speed` makes sense for all entites.
    return {
        x: state.x + state.velx * (state.speed || 1) * scale * pps,
        y: state.y + state.vely * (state.speed || 1) * scale * pps,
    }
};

const MAX_WIDTH = 1280;
const MAX_HEIGHT = 960;

export default (state, action) => {
    switch(action.type) {
        case 'UPDATE_PHYSICS':
            let { x, y } = applyPhysics(state, 1);

            // apply circular bounds
            if (x < 0) x = MAX_WIDTH - x;
            else if (x > MAX_WIDTH) x = x - MAX_WIDTH;

            if (y < 0) y = MAX_HEIGHT - y;
            else if (y > MAX_HEIGHT) y = y - MAX_HEIGHT;
            //

            return { ...state, x, y };

        default:
            return state;
    }
};
