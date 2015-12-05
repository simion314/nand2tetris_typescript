class Operators {
    static get pop():string {
        return "pop";
    }

    static get push():string {
        return "push";
    }

    static get add():string {
        return "add";
    }

    static get sub():string {
        return "sub";
    }
}
class MemoryStack {
    private ram:RAM;
    private start_address:Word;
    private end_address:Word;
    private pointer:Word;

    constructor(ram:RAM,start:Word,end:Word){
        this.ram = ram;
        this.start_address =start;
        this.pointer = this.start_address;
        this.end_address = end;
    }
    pop():Word {
        if (this.pointer.value <= this.start_address.value) {
            throw new Error("Attempt to pop an empty stack ");
        }
        let res = this.ram.run(null, true, this.pointer);
        this.pointer = new Word(this.pointer.value);
        return res;
    }

    push(w:Word) {
        if (this.pointer.value >= this.end_address.value - 1) {
            throw new Error("Attempt to push on a full stack ");
        }
        this.ram.run(w, false, this.pointer);
        this.pointer = new Word(this.pointer.value + 1);
    }
}
class VM{
    _localStack:MemoryStack;
    _staticStack:MemoryStack;
    _thisStack:MemoryStack;
    _thatStack:MemoryStack;
    _argumentStack:MemoryStack;
    _pointerStack:MemoryStack;
    _constantStack:MemoryStack;
    _tempStack:MemoryStack;
    myStacks:{ [name : string]: MemoryStack; };
    initStacks(ram:RAM){
        this._staticStack = new MemoryStack(ram,Word.Zero,new Word(314));
        this.myStacks ={
            "static":this._staticStack
        }
    }

}