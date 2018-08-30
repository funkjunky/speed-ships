import { metaEntitiesSelector } from './metaEntitySelector';

import asteroidTickReducer from './asteroid/tick';
import shipTickReducer from './ship/tick';

import ship from './ship/reducer';

const typedTickReducer = {
    asteroid: asteroidTickReducer,
    ship: shipTickReducer,
};

const typedReducer = {
    ship,
};

let _id = 0;
export const createEntity = props => ({
    type: 'CREATE_ENTITY',
    entity: {
        id: ++_id,
        ...props
    },
    meta: metaEntitiesSelector
});

export const removeEntity = entity => ({
    type: 'REMOVE_ENTITY',
    entity: entity()
});

export default (state={}, action) => {
    switch(action.type) {
        case 'CREATE_ENTITY':
            return {
                ...state,
                [action.entity.id]: {
                    x: 0,
                    y: 0,
                    velx: 0,
                    vely: 0,
                    accx: 0,
                    accy: 0,
                    rotation: 0,
                    // rotationVel: 0, optional
                    ...action.entity,
                }
            };

        case 'REMOVE_ENTITY':
            const newState = { ...state };
            delete newState[action.entity.id];
            return newState;

        // Per entity actions. Stored in the reducer and tick files.
        default:
            for(const k in state) {
                // { condition: state => touching(state, effectedArea), ... }
                // OR { id: 1 }
                const isApplicableEntity = entity =>
                    (!action.id || action.id === entity.id)
                    && (!action.condition || action.condition(entity));

                // if this doesn't apply to this entity, then move on.
                if (!isApplicableEntity(k)) continue;

                if (action.meta.tick) {
                    state[k] = entityTickReducer(state[k], action);
                    if (typedTickReducer[state[k].entityType]) {
                        state[k] = typedTickReducer[state[k].entityType](state[k], action);
                    }
                } else {
                    if (typedReducer[state.entityType]) {
                        state[k] = typedReducer[state.entityType](state[k], action);
                    }
                }
            }

            return state;
    }
};
