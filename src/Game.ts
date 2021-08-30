import {loadCharset} from "./loadCharset";
import {Actor} from "./Actor";
import {GameControl} from "./GameControl";
import {CHAR_HEIGHT, CHAR_WIDTH, isColliding, randint, WORLD_HEIGHT, WORLD_WIDTH} from "./globals";
import {Bullet} from "./Bullet";
import {Char} from "./Char";
import {Renderer} from "./Renderer";

export class Game {
    private player: Actor;
    private aim: Actor;
    private control: GameControl;
    private renderer?: Renderer;
    private enemyList: Set<Actor> = new Set();
    private bulletList: Set<Bullet> = new Set();

    private shouldGenerateEnemies = false;
    private score = 0;

    constructor() {
        this.player = new Actor(0, 0, new Char([0, 2], '#dcdcdc'));
        this.aim = new Actor(0, 0, new Char([7, 0], '#dcdcdc'));
        this.control = new GameControl(this.player);

        setInterval(() => {
            this.shouldGenerateEnemies = true;
        }, 1000)

        loadCharset().then(charset => {
            this.renderer = new Renderer(charset);
            this.gameLoop();
        });
    }

    private generateRandomEnemy() {
        const y = randint(WORLD_HEIGHT - CHAR_HEIGHT);
        const x = WORLD_WIDTH + CHAR_WIDTH;

        this.enemyList.add(new Actor(x, y, new Char([21, 0], '#dc0000')));
        this.shouldGenerateEnemies = false;
    }

    private updateEnemies() {
        for (const enemy of this.enemyList) {
            enemy.addX(-2);
            if (enemy.getPosition()[0] < 0 - CHAR_WIDTH) {
                this.enemyList.delete(enemy);
            }
        }
    }

    private updateBullets() {
        for (const bullet of this.bulletList) {
            const [x, y] = bullet.actor.getPosition();
            bullet.travel();

            if (bullet.actor.getPosition()[0] > WORLD_WIDTH) {
                this.bulletList.delete(bullet);
            }
            else {
                for (const enemy of this.enemyList) {
                    const [ex, ey] = enemy.getPosition();
                    if (isColliding(
                        [x, y, CHAR_WIDTH, CHAR_HEIGHT],
                        [ex, ey, CHAR_WIDTH, CHAR_HEIGHT]
                    )) {
                        this.enemyList.delete(enemy);
                        this.bulletList.delete(bullet);
                        this.score += 100;
                    }
                }
            }
        }
    }

    private setAimPosition(offset = 10) {
        this.aim.setPosition(...this.player.getAngledPosition(offset));
    }

    private gameLoop() {
        if (this.shouldGenerateEnemies) {
            this.generateRandomEnemy();
        }

        this.setAimPosition();
        this.control.handle((bullet) => {
            if (bullet) {
                this.bulletList.add(bullet);
                this.setAimPosition(7);
            }
        });
        this.updateEnemies();
        this.updateBullets();

        this.renderer!.render(
            this.player,
            this.aim,
            ...this.enemyList,
            ...(Array.from(this.bulletList).map(bullet => bullet.actor))
        );
        requestAnimationFrame(() => this.gameLoop());
    }
}
