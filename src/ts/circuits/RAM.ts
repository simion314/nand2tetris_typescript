interface I_RAM{
    run(input:Word,load:boolean,address:Word):Word;
}
class RAM implements I_RAM{
    private _memory:Int16Array;
    constructor(length:number){
        this._memory = new Int16Array(length);
    }
    run(input:Word, load:boolean,address:Word):Word {
        let res = new Word(this._memory[address.value]);
        if(load){
            this._memory[address.value] = input.value;
        }
        return res;
    }
    loadFromText(text:string){
        let lines:Array<string> = text.split("\n");
        let start = 0;
        for(var i:number = 0;i<lines.length;i++){
            this._memory[start+i] = Word.fromString(lines[i]).value;
        }
    }
}