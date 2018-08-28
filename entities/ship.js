const qPI = Math.PI / 4;
export const DIRECTIONS = [
    { velx: 0, vely: -70, rotation: 0 },
    { velx: 50, vely: -50, rotation: qPI * 1 },
    { velx: 70, vely: 0, rotation: qPI * 2 },
    { velx: 50, vely: 50, rotation: qPI * 3 },
    { velx: 0, vely: 70, rotation: qPI * 4 },
    { velx: -50, vely: 50, rotation: qPI * 5 },
    { velx: -70, vely: 0, rotation: qPI * 6 },
    { velx: -50, vely: -50, rotation: qPI * 7 },
];

export default (state, { type, id, accx = 0, accy = 0, ramming, boosting, ...status }) => {
    switch(type) {
        case 'TURN_CCW':
            if (id !== state.id) return state;
            return {
                ...state,
                ...DIRECTIONS[state.direction === 0 ? (DIRECTIONS.length - 1) : (state.direction - 1)],
            };

        case 'TURN_CW':
            if (id !== state.id) return state;
            return {
                ...state,
                ...DIRECTIONS[DIRECTIONS.length - 1 === state.direction ? 0 : state.direction + 1],
            };

        case 'SET_RAMMING':
            if (id !== state.id) return state;
            return {
                ...state,
                ramming,
            };

        case 'SET_BOOSTING':
            if (id !== state.id) return state;
            return {
                ...state,
                boosting,
            };

        // TODO: what is this?
        case 'STATUS':
            console.log('staus: ', status.rotation, status);
            if (id !== state.id) return state;
            return {
                ...state,
                ...status,
            };

        default:
            return state;
    }
};
