import {Char} from "./Char";

export const CHAR_WIDTH = 8;
export const CHAR_HEIGHT = 16;
export const WORLD_WIDTH = 400;
export const WORLD_HEIGHT = 300;
export const SCALE = 2;
export const PLAYER_SPEED = 5;
export const BULLET_SPEED = 7;
export const ANGULAR_SPEED = Math.PI / 16;

export function randint(max: number) {
    return Math.floor(Math.random() * max);
}

export type Rect = [
    x: number,
    y: number,
    width: number,
    height: number,
];
export function isColliding(r1: Rect, r2: Rect) {
    return (
        r1[0] < r2[0] + r2[2] &&
        r1[0] + r1[2] > r2[0] &&
        r1[1] < r2[1] + r2[3] &&
        r1[1] + r1[3] > r2[1]
    );
}

export interface Drawable {
    getChar: () => Char,
}

export interface Positionable {
    setPosition: (x: number, y: number) => void,
    getPosition: () => [x: number, y: number],
    addX: (value: number) => void,
    addY: (value: number) => void,
}