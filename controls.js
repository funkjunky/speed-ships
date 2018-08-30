import { put } from 'redux-yield-effect/lib/effects';
import { addTick } from 'effect-tick';

import { createEntity, removeEntity } from './entities';
import { DIRECTIONS } from './entities/ship';
//TODO: randomInt in createAsteroid
const randomInt = max => Math.floor(Math.random() * max);

const sleep = ms =>
    addTick(function* (dt) {
        return (ms -= dt) < 0;
    });

const nearly2PI = Math.PI * 7 / 4;
// a linear tween.
const tween = (model, props, duration, updateAction, onEnd) => {
    let elapsed = 0;
    let closingAction = 'FULL_DURATION';
    let promiseResolve;
    let promise = new Promise(resolve => promiseResolve = resolve);
    return {
        rollback: () => interrupt = 'ROLLBACK',
        finishImmediately: () => interrupt = 'FINISH_IMMEDIATELY',
        promise,
        action: addTick(function*(dt) {
            elapsed += dt;
            const nextProps = {};
            Object.keys(props).map(k => {
                let difference = props[k] - model[k];
                // Special case for rotating between 2pi for circles.
                if (props[k] === nearly2PI && model[k] === 0)         difference = -Math.PI / 4;
                else if (model[k] === nearly2PI && props[k] === 0)    difference = Math.PI / 4;
                nextProps[k] = model[k] + difference * (elapsed / duration);
            });

            // TODO: refactor this.
            if (closingAction === 'ROLLBACK') {
                // create an object with the original values, but only for the props keys.
                let modelProps = {};
                Object.keys(props).forEach(k => modelProps[k] = model[k]);

                // TODO: same three lines as the else statement.
                yield put(updateAction(modelProps, duration, duration));
                promiseResolve(closingAction);
                return true;
            } else if (elapsed <= duration && closingAction !== 'FINISH_IMMEDIATELY') {
                yield put(updateAction(nextProps, elapsed, duration));
            } else {
                // when we've went over the duration, set the tween ending to exactly where we wanted it to be.
                yield put(updateAction(props, duration, duration));
                promiseResolve(closingAction);
                return true;
            }
        }),
    };
};

const turnCW = function*(ship) {
    yield put(tween(
        ship,
        DIRECTIONS[(ship.direction + 1) % 8],
        150,
        props => ({
            meta: { tick: true },
            type: 'TURN_SHIP',
            id: ship.id,
            ...props,
        }),
    ).action);
    yield put({ type: 'SET_DIRECTION', id: ship.id, direction: (ship.direction + 1) % 8 });
};

const turnCCW = function*(ship) {
    yield put(tween(
        ship,
        DIRECTIONS[(7 + ship.direction) % 8],
        150,
        props => ({
            meta: { tick: true },
            type: 'TURN_SHIP',
            id: ship.id,
            ...props,
        }),
    ).action);
    yield put({ type: 'SET_DIRECTION', id: ship.id, direction: (7 + ship.direction) % 8 });
};

// TODO: is there a nice way to do these temporary state changes?
//          It's similar to casting in an MMO
const ram = function* () {
    yield put({ type: 'SET_RAMMING', ramming: true, id: 0 });
    yield put(sleep(1000));
    yield put({ type: 'SET_RAMMING', ramming: false, id: 0 });
};

const boost = function* () {
    yield put({ type: 'SET_BOOSTING', boosting: true, id: 0 });
    yield put(sleep(2000));
    yield put({ type: 'SET_BOOSTING', boosting: false, id: 0 });
};

const getBulletShape = () => [
    [ randomInt(4) - 6, randomInt(4) - 6 ],
    [ randomInt(4) + 6, randomInt(4) - 6 ],
    [ randomInt(4) + 6, randomInt(4) + 6 ],
    [ randomInt(4) - 6, randomInt(4) + 6 ],
];

const createBullet = (x, y, velx, vely, rotation) => ({
    entityType: 'bullet',
    shape: getBulletShape(),
    x, y,
    velx: Math.cos(rotation - Math.PI / 2) * 300 + velx,
    vely: Math.sin(rotation - Math.PI / 2) * 300 + vely,
    scale: 0.5,
    rotationVel: 0.005,
});

//TODO: create collision test based on shape
const getRadiansFromVector = (x, y) => 0.5 * Math.PI + Math.atan2(y || 0.1, x || 0.1);
export default store => {

    if (!mobileAndTabletcheck()) {
        document.addEventListener('keyup', e => {
            // console.log('code: ', e.code);
            if (e.keyCode === 37)   store.dispatch(turnCCW(store.getState().entities[0]));
            if (e.keyCode === 39)   store.dispatch(turnCW(store.getState().entities[0]));
            if (e.keyCode === 32)   store.dispatch(ram());
            if (e.code === 'KeyB')  store.dispatch(boost());
        });
    } else {
        const ratioX = window.screen.availWidth / 640;  //TODO: replace 640 and 480 with canvas.width height
        const ratioY = window.screen.availHeight / 480;  //TODO: replace 640 and 480 with canvas.width height
        let dirTouch;
        document.addEventListener('touchstart', e => {
            if (dirTouch) return;
            // The first touch we find with the left half of the screen.
            // Well be our control.
            const foundTouch = Array.prototype.find.call(e.changedTouches, t => {
                // TODO: wtf find? return true doesnt work. Returns empty obj
                if(t.screenX / ratioX < 320) {
                    dirTouch = {
                        identifier: t.identifier,
                        screenX: t.screenX,
                        screenY: t.screenY,
                    };
                }
            })
        });
        document.addEventListener('touchmove', e => {
            if (dirTouch) {
                let newDirTouch;
                Array.prototype.find.call(e.changedTouches, t => {
                   if(t.identifier === dirTouch.identifier) {
                       newDirTouch = t;
                   }
                });

                if (newDirTouch) {
                    dirTouch = {
                        ...dirTouch,
                        _newX: newDirTouch.screenX,
                        _newY: newDirTouch.screenY,
                    };
                    const deltaX = newDirTouch.screenX - dirTouch.screenX;
                    const scaledDeltaX = deltaX / ratioX;
                    const scaledDeltaXScreenRatio = scaledDeltaX / 640;
                    const deltaY = newDirTouch.screenY - dirTouch.screenY;
                    const scaledDeltaY = deltaY / ratioY;
                    const scaledDeltaYScreenRatio = scaledDeltaY / 480;
                    store.dispatch({
                        type: 'DEBUG',
                        line: scaledDeltaXScreenRatio + ' , ' + scaledDeltaYScreenRatio,
                    });
                    store.dispatch({
                        type: 'ADD_ACC',
                        id: 0,
                        accx: scaledDeltaXScreenRatio * 1600,
                        accy: scaledDeltaYScreenRatio * 1600,
                    });
                }
            }
        });

        const handleEnd = e => {
            let dirTouchRemoved;
            if (dirTouch) {
                Array.prototype.find.call(e.changedTouches, t => {
                    if(t.identifier === dirTouch.identifier) {
                        dirTouchRemoved = t;
                    }
                });
                if (dirTouchRemoved) {
                    dirTouch = null;

                    store.dispatch({
                        type: 'ADD_ACC',
                        id: 0,
                        accx: 0.0001,
                        accy: 0.0001,
                    });
                }
            }
            if (!dirTouchRemoved) {
                const scaledX = e.changedTouches[0].screenX / ratioX;
                const scaledY = e.changedTouches[0].screenY / ratioY;
                const rotation = getRadiansFromVector(scaledX - 360, scaledY - 240);

                store.dispatch({
                    type: 'FACE',
                    id: 0,
                    rotation,
                });
            }
        };
        document.addEventListener('touchend', handleEnd);
        document.addEventListener('touchcancel', handleEnd);
    }
};
