import { CubeColorValues, CubeColors } from "./CubeColors.js";
import { Game } from "./Game.js";

export class GameMatcher {
    constructor(private maxColorCounts: Map<CubeColors, number>, private games: Game[] = []) {

    }

    private parseGameInput(gameInput: string): Game {
        const [prefixMatch, gameId, handfulsInput] = gameInput.match(/^Game (\d+):([\sa-z\d;,]+)$/);
        if (!prefixMatch) {
            throw 'Game prefix did not match the expected format';
        }
        const game = new Game(parseInt(gameId));
        const handfuls = handfulsInput.split(';');
        if (handfuls.length < 1) {
            throw 'Expected one or more handful of cubes per game';
        }
        for (const handful of handfuls) {
            const cubeSets = handful.split(',');
            if (cubeSets.length < 1) {
                throw 'Expected one or more sets of cubes per handful';
            }
            const randomCubeHandful = new Map<CubeColors, number>();
            for (const cubes of cubeSets) {
                const  [matchCube, count, color] = cubes.match(/^\s(\d+)\s(red|green|blue)$/);
                if (!matchCube) {
                    throw 'Unexpected format for color cube set';
                }
                if (randomCubeHandful.has(color as CubeColors)) {
                    throw 'Cannot have the same color twice in a single handful';
                }
                randomCubeHandful.set(color as CubeColors, parseInt(count));
            }
            game.randomCubeHandful(randomCubeHandful);
        }
        return game;
    }

    public addGame(gameInput: string): void {
        this.games.push(this.parseGameInput(gameInput));
    }

    public sumPossible(): number {
        let sum = 0;
        for (const game of this.games) {
            const gameMaxColorCubes = game.acquireMaxColorCubes();
            let possible = true;
            for (const color of Object.keys(CubeColorValues) as CubeColors[]) {
                const gameMaxColorCube = gameMaxColorCubes.get(color);
                const maxColorCountCube = this.maxColorCounts.get(color);
                if (gameMaxColorCube > maxColorCountCube) {
                    possible = false;
                    break;
                }
            }
            if (possible) {
                sum += game.gameId;
            }
        }
        return sum;
    }

    public powerOfCubes(): number {
        let powerTotal = 0;
        for (const game of this.games) {
            const gameMaxColorCubes = game.acquireMaxColorCubes();
            let powerOfGame = 1;
            let powerOfGameChanged = false;
            for (const color of Object.keys(CubeColorValues) as CubeColors[]) {
                const gameMaxColorCube = gameMaxColorCubes.get(color);
                if (gameMaxColorCube > 0) {
                    powerOfGame *= gameMaxColorCube;
                    powerOfGameChanged = true;
                }
            }
            if (powerOfGameChanged) {
                powerTotal += powerOfGame;
            }
        }        
        return powerTotal;
    }
}