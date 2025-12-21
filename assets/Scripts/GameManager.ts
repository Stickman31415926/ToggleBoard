import { _decorator, Component, Node ,Label, Sprite} from 'cc';
import { GridManager } from './GridManager';
import { Level,getLevel } from './Levels';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    @property({ type: GridManager }) 
    public GridManager: GridManager | null = null;
    @property({type:Label})
    public StdMovesNeeded:Label;
    @property({type:Label})
    public MovesMade:Label;
    @property({type:Sprite})
    public ResetButton:Sprite;
    @property({type:Sprite})
    public NextLevelButton:Sprite;

    private _moves:number=0;
    private _hardness:number=1;
    private _level:number=0;

    increaseMoves(val:number){
        console.log('[!] Recieved signal of increaseMoves');
        this._moves+=val;
        this.MovesMade.string='Number of Moves made: '+this._moves;
    }
    setMoves(val:number){
        console.log('[!] Recieved signal of setMoves');
        this._moves=val;
        this.MovesMade.string='Number of Moves made: '+this._moves;
    }

    preNextLevel(){
        console.log('[!] Recieved signal of finishedLevel');
        this.GridManager.levelFinished=true;
        this.NextLevelButton.node.setPosition(460,-190);
    }

    nextLevel(){
        console.log('[!] Clicked: Button: NextLevel');
        console.log('[!>] Call setMoves');
        this.GridManager.levelFinished=false;
        this.setMoves(0);
        this._level+=1;
        this._hardness=getLevel(this._level).stdMoves;
        this.StdMovesNeeded.string='Standard number of Moves needed: '+this._hardness;
        this.GridManager.generateGrid(this._level);
        this.NextLevelButton.node.setPosition(460*2,-190);
    }

    start() {
        this.NextLevelButton.node.setPosition(460*2,-190);
        this.StdMovesNeeded.string='Standard number of Moves needed: '+this._hardness;
        this.MovesMade.string='Number of Moves made: '+this._moves;
        this.GridManager.generateGrid(this._level);
        this.GridManager.node.on('increaseMoves',this.increaseMoves,this)
        this.GridManager.node.on('setMoves',this.setMoves,this)
        this.GridManager.node.on('finishedLevel',this.preNextLevel,this)
    }

    update(deltaTime: number) {
        
    }
}