class Counter{
    private _count:Word =Word.Zero;
    private run(input:Word,increment:boolean,load:boolean,reset:boolean):Word{
        let res:Word = this._count;
        if(reset){
            this._count = Word.Zero;
        }
        else if(load){
            this._count = input;
        }
        else if(increment){
            this._count = new Word(this._count.value+1);
        }
        return res;
    }
    storeAddress(address:Word){
        this.run(address, false, true, false);
    }
    increment(){
        this.run(undefined, true, false, false);
    }
    get address():Word{
        return this.run(undefined, false, false,false);
    }
}