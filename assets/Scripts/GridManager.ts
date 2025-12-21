import { _decorator, Component, Node, Prefab,instantiate, EventTouch,SpriteFrame, Sprite, Input,Script, FogInfo} from 'cc';
import { GameManager } from './GameManager';
import { Level,getLevel } from './Levels';
const { ccclass, property } = _decorator;

export enum TileType {
    on=1,
    off=0,
}

@ccclass('GridManager')
export class GridManager extends Component {
    @property({ type: GameManager }) 
    public GameManager: GameManager | null = null;
    @property({type:Prefab})
    public Tile_On:Prefab;
    @property({type:Prefab})
    public Tile_Off:Prefab;
    @property({type:SpriteFrame})
    public SF_Tile_On:SpriteFrame;
    @property({type:SpriteFrame})
    public SF_Tile_Off:SpriteFrame;

    public grid:TileType[][]=[];
    private _StartingGrid:TileType[][]=[];
    private _moved:[number,number][]=[];
    public levelFinished:boolean=false;
    public gridSize:number;

    private _row:TileType[]=[];
    searchInMoved(val1:number,val2:number){
        for(let temp=0;temp<this._moved.length;temp++){
            if(this._moved[temp][0]===val1&&this._moved[temp][1]===val2){
                return true;
            }
        }
        return false;
    }
    public generateRandomGrid(size:number,moves:number/*cols:number,rows:number*/){
        this.gridSize=size;
        console.log('[_] Generating grid, Size: '+size)
        for(let i=0;i<size;i++){
            this._row=[];
            for(let j=0;j<size;j++){
                this._row.push(TileType.on);
            }
            this.grid.push(this._row);
        }
        for(let i=0;i<moves;i++){
            let targetRow=Math.floor(Math.random()*100)%size;
            let targetCol=Math.floor(Math.random()*100)%size;
            if(this.searchInMoved(targetRow,targetCol)){
                i--;
                continue;
            }
            this._moved.push([targetRow,targetCol]);
            console.log('[:] Toggled while generating grid: '+targetRow+' '+targetCol);
            this.toggleTilesAround(targetRow,targetCol,true)
        }
        this.spawnTilesByGrid(size,true);
        console.log('[#] Grid generated')
    }
    public generateGrid(levelIndex:number){
        let level:Level = getLevel(levelIndex);
        let size = this.gridSize
        if(level.size!=size){
            for(let i=0;i<size;i++){
                for(let j=0;j<size;j++){
                    let tileNodeToDelete:Node=this.node.getChildByName(''+i+j);
                    this.node.removeChild(tileNodeToDelete);
                }
            }
            this.grid=level.grid;
            this.gridSize=level.size;
            this.spawnTilesByGrid(this.gridSize);
        } else {
            for(let i=0;i<size;i++){
                for(let j=0;j<size;j++){
                    if(this.grid[i][j]!=level.grid[i][j]){
                        this.toggleTile(i,j);
                    }
                }
            }
        }
        this.copyGridIntoStartingGrid();
    }
    copyGridIntoStartingGrid(){
        this._StartingGrid=[];
        for(let i=0;i<this.gridSize;i++){
            this._row=[]
            for(let j=0;j<this.gridSize;j++){
                this._row.push(this.grid[i][j]);
            }
            this._StartingGrid.push(this._row);
        }
    }
    spawnTilesByGrid(size:number,resetStaringrid?:boolean){
        if(resetStaringrid){
            this._StartingGrid=[];
        }
        for(let i=0;i<size;i++){
            if(resetStaringrid){    
                this._row=[];
            }
            for(let j=0;j<size;j++){
                let newTileNode:Node=this.spawnTileByType(this.grid[i][j]);
                newTileNode.setPosition((-size/2+i)*80,(-size/2+j)*80,0)
                newTileNode.name=''+i+j;
                newTileNode.on(Input.EventType.TOUCH_END,this.onTileCLicked,newTileNode);
                this.node.addChild(newTileNode);
                this._row.push(this.grid[i][j]);
            }
            if(resetStaringrid){ 
                this._StartingGrid.push(this._row);
            }
        }
    }
    spawnTileByType(type: TileType) {
        let tile: Node|null = null;
        switch(type) {
            case TileType.on:
                tile = instantiate(this.Tile_On);
                break;
            case TileType.off:
                tile = instantiate(this.Tile_Off);
                break;
        }
        return tile;
    }

    onTileCLicked(event:EventTouch){
        console.log('[!] Clicked: Tile: '+ this.name);
        let row = Number(this.name[0]);
        let col = Number(this.name[1]);
        //NO PROBLEMS HERE, IT'S JUST THE COMPUTER ISN'T COMPUTERING
        let gm = this.parent.getComponent(GridManager);
        if(gm.levelFinished){
            return;
        }
        console.log('[!>] Emit increaseMoves');
        this.parent.emit('increaseMoves',1);
        //Toggling all 8 tiles around it and itself(9 tiles in total)
        gm.toggleTilesAround(row,col);
    }

    public toggleTile(row:number,col:number,gridOnly?:boolean){
        let tileNode = this.node.getChildByName(''+row+col);
        if(row<0||col<0||row>this.gridSize-1||col>this.gridSize-1){
            return;
        }
        switch(this.grid[row][col]){
            case(TileType.on):
                this.grid[row][col]=TileType.off;
                if(!gridOnly){
                    tileNode.getComponent(Sprite).spriteFrame=this.SF_Tile_Off;
                }
                break;
            case(TileType.off):
                this.grid[row][col]=TileType.on;
                if(!gridOnly){
                    tileNode.getComponent(Sprite).spriteFrame=this.SF_Tile_On;
                }
                break;
        }
    }

    public toggleTilesAround(row:number,col:number,gridOnly?:boolean){
        this.toggleTile(row,col,gridOnly);
        this.toggleTile(row+1,col,gridOnly);
        this.toggleTile(row-1,col,gridOnly);
        this.toggleTile(row+1,col+1,gridOnly);
        this.toggleTile(row+1,col-1,gridOnly);
        this.toggleTile(row-1,col+1,gridOnly);
        this.toggleTile(row-1,col-1,gridOnly);
        this.toggleTile(row,col+1,gridOnly);
        this.toggleTile(row,col-1,gridOnly);
        if(this.checkIfLevelFinished()){
            console.log('[!>] Emit finishedLevel');
            this.node.emit('finishedLevel');
        }
    }

    resetGrid(){
        console.log('[!] ResetGrid button pressed');
        console.log('[_] Reseting grid');
        console.log('[!>] Emit setMoves');
        this.node.emit('setMoves',0);
        for(let i=0;i<this.gridSize;i++){
            for(let j=0;j<this.gridSize;j++){
                if(this.grid[i][j]!=this._StartingGrid[i][j]){
                    this.toggleTile(i,j);
                }
                this.grid[i][j]=this._StartingGrid[i][j];
            }
        }
        this.levelFinished=false;
        console.log('[#] Grid reseted')
    }

    checkIfLevelFinished(){
        for(let i=0;i<this.gridSize;i++){
            for(let j=0;j<this.gridSize;j++){
                switch(this.grid[i][j]){
                    case TileType.off:
                        return false;
                }
            }
        }
        return true;
    }

    start() {
        
    }

    update(deltaTime: number) {
        
    }
}



