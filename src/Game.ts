import {loadCharset} from "./loadCharset";
import {Actor} from "./Actor";
import {GameControl} from "./GameControl";
import {CHAR_HEIGHT, CHAR_WIDTH, COLORS, isColliding, randint, randomColor, WORLD_HEIGHT, WORLD_WIDTH} from "./globals";
import {Bullet} from "./Bullet";
import {Char} from "./Char";
import {Renderer} from "./Renderer";

const FILESIZE = 250

export class Game {
    private player: Actor;
    private aim: Actor;
    private control: GameControl;
    private renderer?: Renderer;
    private enemyList: Set<Actor> = new Set();
    private bulletList: Set<Bullet> = new Set();
    private counter = 0;

    private shouldGenerateEnemies = false;
    private score = 0;
    private corrupted = 0;

    constructor() {
        this.player = new Actor(CHAR_WIDTH, WORLD_HEIGHT/2, new Char([0, 2], COLORS.WHITE));
        this.aim = new Actor(0, 0, new Char([7, 0], COLORS.WHITE));
        this.control = new GameControl(this.player);

        setInterval(() => {
            this.shouldGenerateEnemies = true;
        }, 500)

        loadCharset().then(charset => {
            this.renderer = new Renderer(charset);
            this.gameLoop();
        });
    }

    private getRandomChar(): [x: number, y: number] {
        const x = randint(31);
        const y = randint(7);

        if (x == 0 && y == 0 || x == 0 && y == 1 || x == 31 && y == 7) {
            return this.getRandomChar();
        }

        return [x, y];
    }

    private generateRandomEnemy() {
        if (this.counter < 100) {
            const y = randint(WORLD_HEIGHT - CHAR_HEIGHT);
            const x = WORLD_WIDTH + CHAR_WIDTH;

            if (randint(100) > 70) {
                const char = new Char(this.getRandomChar(), COLORS.WHITE);
                this.enemyList.add(new Actor(x, y, char));
                this.shouldGenerateEnemies = false;
            }
            else {
                const char = new Char([randint(31), randint(16)], randomColor(), COLORS.RED);
                this.enemyList.add(new Actor(x, y, char, true));
                this.shouldGenerateEnemies = false;
            }
        }
    }

    private winGame() {
        alert(`Task succeeded. Freed ${this.score}kb on disk.`)
        const hiscore = localStorage.getItem('filepurge-score')
        if (hiscore) {
            if (this.score > Number(hiscore)) {
                localStorage.setItem('filepurge-score', String(this.score))
            }
        }
        else {
            localStorage.setItem('filepurge-score', String(this.score))
        }
        location.reload()
    }

    private updateEnemies() {
        for (const enemy of this.enemyList) {
            enemy.addX(-2);
            if (enemy.getPosition()[0] < 0 - CHAR_WIDTH) {
                this.enemyList.delete(enemy);
                if (this.counter == 100) {
                    this.winGame()
                }
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
                        if (enemy.isDestroyable) {
                            this.score += FILESIZE
                            if (this.counter == 100) {
                                this.winGame()
                            }
                        }
                        else {
                            this.corrupted += FILESIZE
                            if (this.corrupted >= 5000) {
                                alert('Filesystem corrupted. Aborting...')
                                location.reload()
                            }
                        }
                    }
                }
            }
        }
    }

    private setAimPosition(offset = 10) {
        this.aim.setPosition(...this.player.getAngledPosition(offset));
    }

    private drawHUD() {
        this.renderer?.renderHUD(this.score, this.corrupted);
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
        this.drawHUD();
        requestAnimationFrame(() => this.gameLoop());
    }
}
