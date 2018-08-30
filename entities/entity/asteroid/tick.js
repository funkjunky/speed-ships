export default (state, action) => {
    switch(action.type) {
        case 'UPDATE_PHYSICS':
            return {
                ...state,
                rotation: state.rotationVel * action.dt + state.rotation,
            };

        default:
            return state;
    }
};
