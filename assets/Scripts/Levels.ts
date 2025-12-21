import { _decorator, Component, Node } from 'cc';
import { TileType } from './GridManager';
const { ccclass, property } = _decorator;

export interface Level {
    level:number;
    stdMoves:number;
    size:number;
    grid:number[][];
}

const Levels:Level[] = [
    {
        level:1,
        stdMoves:1,
        size:3,
        grid:[
            [0,0,0],
            [0,0,0],
            [0,0,0]
        ]
    },
    {
        level:2,
        stdMoves:1,
        size:3,
        grid:[
            [1,1,1],
            [1,0,0],
            [1,0,0]
        ]
    },
    {
        level:3,
        stdMoves:2,
        size:3,
        grid:[
            [0,0,0],
            [0,1,1],
            [0,1,1]
        ]
    },
    {
        level:4,
        stdMoves:3,
        size:3,
        grid:[
            [1,1,0],
            [1,0,1],
            [0,1,1]
        ]
    },
    {
        level:5,
        stdMoves:1,
        size:3,
        grid:[
            [1,1,1],
            [0,0,0],
            [0,0,0]
        ]
    },
    {
        level:6,
        stdMoves:2,
        size:3,
        grid:[
            [1,1,1],
            [0,1,1],
            [0,1,1]
        ]
    },
    {
        level:7,
        stdMoves:3,
        size:3,
        grid:[
            [1,1,1],
            [1,0,1],
            [1,0,1]
        ]
    },
    {
        level:8,
        stdMoves:2,
        size:3,
        grid:[
            [0,1,0],
            [0,1,0],
            [1,0,0]
        ]
    },
]

export function getLevel(index:number) {
    return Levels[index];
}