import {Actor} from "./Actor";
import {Char} from "./Char";
import {BULLET_SPEED, COLORS} from "./globals";

export class Bullet {
    public actor: Actor;
    private direction: number;

    constructor(x: number, y: number, direction: number) {
        this.actor = new Actor(x, y, new Char([7, 0], COLORS.YELLOW));
        this.direction = direction;
    }

    public travel() {
        const [x, y] = this.actor.getPosition();
        const [dx, dy] = [BULLET_SPEED * Math.cos(this.direction), BULLET_SPEED * Math.sin(this.direction)];
        this.actor.setPosition(x + dx, y - dy);
    }
}
