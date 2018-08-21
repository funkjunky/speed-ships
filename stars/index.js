export default (state=[], action) => {
    switch(action.type) {
        case 'CREATE_STAR':
            const { type, ...attrs } = action;
            return [ ...state, attrs ];

        case 'START_TWINKLE':
            state[action.index] = {
                ...state[action.index],
                bloom: 1,
            };
            return [ ...state ];

        case 'STEP_TWINKLE':
            const durationPerBloom = 500;
            const bloomPerMS = 2 / 500;
            state.filter(s => s.bloom).forEach((_, i) => {
                if (state[i].bloom) {
                    if (state[i].bloom > 3) {
                        state[i] = {
                            ...state[i],
                            downBloom: state[i].bloom
                        };
                        delete state[i].bloom;
                    } else {
                        state[i] = {
                            ...state[i],
                            bloom: state[i].bloom + action.dt * bloomPerMS,
                        };
                    }
                }
                if (state[i].downBloom) {
                    if (state[i].downBloom <= 1.1) {
                        delete state[i].downBloom;
                        state[i] = {
                            ...state[i],
                        };
                    } else {
                        state[i] = {
                            ...state[i],
                            downBloom: state[i].downBloom - action.dt * bloomPerMS,
                        };
                    }
                }
            i});
            return [ ...state ];

        default:
            return state;
    }
};
