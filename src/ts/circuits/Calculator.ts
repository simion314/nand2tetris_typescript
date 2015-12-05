class Calculator{
    static get addOpFlags():ALU_InputFlags {
        return this._addOpFlags;
    }
    private _alu:ALU;
    constructor(alu:ALU){
        this._alu = alu;
        if(!Calculator._addOpFlags){
            Calculator.initStaticFields();
        }
    }
    add(x:Word,y:Word):Word{
        return this._alu.compute(x,y,Calculator.addOpFlags).output;
    }

    private static _addOpFlags:ALU_InputFlags;
    private static initStaticFields(){
        Calculator._addOpFlags =new ALU_InputFlags();
        Calculator._addOpFlags.functionCode = ALU_FUNCTIONS.ADD;
    }
}