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

export default (state, { type, id, velx = 0, vely = 0, ramming, boosting, rotation, direction }) => {
    switch(type) {
        case 'TURN_CCW':
            return {
                ...state,
                ...DIRECTIONS[state.direction === 0 ? (DIRECTIONS.length - 1) : (state.direction - 1)],
            };

        case 'TURN_CW':
            return {
                ...state,
                ...DIRECTIONS[DIRECTIONS.length - 1 === state.direction ? 0 : state.direction + 1],
            };

        case 'SET_RAMMING':
            return {
                ...state,
                ramming,
            };

        case 'SET_BOOSTING':
            return {
                ...state,
                boosting,
            };

        case 'SET_DIRECTION':
            return {
                ...state,
                direction,
            };

        default:
            return state;
    }
};
