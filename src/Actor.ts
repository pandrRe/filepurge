import {Drawable, Positionable} from "./globals";
import {Char} from "./Char";

export class Actor implements Drawable, Positionable {
    private char: Char;
    private x: number;
    private y: number;
    public direction: number = 0;

    constructor(x: number, y: number, char: Char) {
        this.x = x;
        this.y = y;
        this.char = char;
    }

    public getChar(): Char {
        return this.char;
    }

    public setPosition(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public getPosition(): [x: number, y: number] {
        return [this.x, this.y];
    }

    public getAngledPosition(offset: number): [x: number, y: number] {
        return [
            this.x + offset * Math.cos(this.direction),
            this.y - offset * Math.sin(this.direction)
        ];
    }

    public addX(value: number) {
        this.x += value;
    }

    public addY(value: number) {
        this.y += value;
    }
}