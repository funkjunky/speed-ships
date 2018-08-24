const qPI = Math.PI / 4;
const DIRECTIONS = [
    { direction: 0, velx: 0, vely: -70, rotation: 0 },
    { direction: 1, velx: 50, vely: -50, rotation: qPI * 1 },
    { direction: 2, velx: 70, vely: 0, rotation: qPI * 2 },
    { direction: 3, velx: 50, vely: 50, rotation: qPI * 3 },
    { direction: 4, velx: 0, vely: 70, rotation: qPI * 4 },
    { direction: 5, velx: -50, vely: 50, rotation: qPI * 5 },
    { direction: 6, velx: -70, vely: 0, rotation: qPI * 6 },
    { direction: 7, velx: -50, vely: -50, rotation: qPI * 7 },
];

export default (state, { type, id, accx = 0, accy = 0, rotation, ...status }) => {
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

        // TODO: this is old
        case 'FACE':
            if (id !== state.id) return state;
            return {
                ...state,
                rotation,
            };

        case 'ADD_ACC':
            if (id !== state.id) return state;
            return {
                ...state,
                accx: accx || state.accx,
                accy: accy || state.accy,
            };

        case 'STATUS':
            if (id !== state.id) return state;
            return {
                ...state,
                ...status,
            };

        default:
            return state;
    }
};
