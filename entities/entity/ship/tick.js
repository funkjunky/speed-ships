import { applyPhysics } = '../tick';

export default (state, action) => {
    switch(action.type) {
        case 'UPDATE_PHYSICS':
            let { x, y } = state;

            // if boosting, then apply +50% velocity to x and y.
            if (state.boosting) { x, y } = applyPhysics(state, 0.5);

            // if ramming, then apply +100% more velocity to x and y.
            if (state.boosting) { x, y } = applyPhysics(state, 1);

            return { ...state, x, y };

        case 'TURN_SHIP':
            return {
                ...state,
                velx,
                vely,
                rotation,
            };

        default:
            return state;
    }
};
