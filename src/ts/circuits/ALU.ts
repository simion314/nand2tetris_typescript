enum ALU_FUNCTIONS{ADD, AND}
class ALU_InputFlags {
    zeroX:boolean = false;
    negateX:boolean = false;
    zeroY:boolean = false;
    negateY:boolean = false;
    functionCode:ALU_FUNCTIONS = ALU_FUNCTIONS.ADD;
    negateOutput:boolean = false;
}
class ALU_Output {
    output:Word;
    isZero:boolean;
    isNegative:boolean;

    constructor(out:Word) {
        this.output = out;
        this.isZero = out.isZero;
        this.isNegative = out.isNegative;
    }
}
class ALU {
    private _sumator:ISumator = new Sumator();
    private _and:I_AND = new AND();

    compute(w1:Word, w2:Word, flags:ALU_InputFlags):ALU_Output {
        if (flags.zeroX) {
            w1 = Word.Zero;
        }
        if (flags.zeroY) {
            w2 = Word.Zero;
        }
        if (flags.negateX) {
            w1 = Word.getNegate(w1);
        }
        if (flags.negateY) {
            w2 = Word.getNegate(w2);
        }
        var out:Word;
        if (flags.functionCode == ALU_FUNCTIONS.ADD) {
            out = this._sumator.sum(w1, w2);
        }
        else if (flags.functionCode == ALU_FUNCTIONS.AND) {
            out = this._and.and(w1, w2);
        }
        else {
            throw new Error("Unsupported operation");
        }
        if (flags.negateOutput) {
            out = Word.getNegate(out);
        }
        return new ALU_Output(out);
    }

    test(w1:Word, w2:Word) {
        var flags:ALU_InputFlags = new ALU_InputFlags();
        flags.zeroX = true;
        flags.zeroY = true;
        var out = this.compute(w1, w2, flags);
        assertEquals(out.isZero, true);

        flags.negateX = flags.negateY = flags.negateOutput = true;
        out = this.compute(w1, w2, flags);
        assertEquals(out.output.value, 1);

        flags = new ALU_InputFlags();
        flags.zeroX = flags.negateX = flags.zeroY = true;
        out = this.compute(w1, w2, flags);
        assertEquals(out.output.value, -1);

        flags = new ALU_InputFlags();
        flags.zeroY = flags.negateY = true;
        flags.functionCode = ALU_FUNCTIONS.AND;
        out = this.compute(w1, w2, flags);
        assertEquals(out.output.value, w1.value);

        flags = new ALU_InputFlags();
        flags.zeroX = flags.negateX = true;
        flags.functionCode = ALU_FUNCTIONS.AND;
        out = this.compute(w1, w2, flags);
        assertEquals(out.output.value, w2.value);

        flags = new ALU_InputFlags();
        flags.zeroY = flags.negateY = flags.negateOutput = true;
        flags.functionCode = ALU_FUNCTIONS.AND;
        out = this.compute(w1, w2, flags);
        assertEquals(out.output.value, Word.getNegate(w1).value);

        flags = new ALU_InputFlags();
        flags.zeroX = flags.negateX = flags.negateOutput = true;
        flags.functionCode = ALU_FUNCTIONS.AND;
        out = this.compute(w1, w2, flags);
        assertEquals(out.output.value, Word.getNegate(w2).value);

        flags = new ALU_InputFlags();
        flags.zeroY = flags.negateY = flags.negateOutput = true;
        out = this.compute(w1, w2, flags);
        assertEquals(out.output.value, -w1.value);

        flags = new ALU_InputFlags();
        flags.zeroX = flags.negateX = flags.negateOutput = true;
        out = this.compute(w1, w2, flags);
        assertEquals(out.output.value, -w2.value);

        flags = new ALU_InputFlags();
        flags.negateX = flags.zeroY = flags.negateY = flags.negateOutput = true;
        out = this.compute(w1, w2, flags);
        assertEquals(out.output.value, w1.value + 1);

        flags = new ALU_InputFlags();
        flags.negateX = flags.zeroX = flags.negateY = flags.negateOutput = true;
        out = this.compute(w1, w2, flags);
        assertEquals(out.output.value, w2.value + 1);

        flags = new ALU_InputFlags();
        flags.zeroY = flags.negateY = true;
        out = this.compute(w1, w2, flags);
        assertEquals(out.output.value, w1.value - 1);

        flags = new ALU_InputFlags();
        flags.negateX = flags.zeroX = true;
        out = this.compute(w1, w2, flags);
        assertEquals(out.output.value, w2.value - 1);

        flags = new ALU_InputFlags();
        out = this.compute(w1, w2, flags);
        assertEquals(out.output.value, w1.value + w2.value);

        flags = new ALU_InputFlags();
        flags.negateX = flags.negateOutput = true;
        out = this.compute(w1, w2, flags);
        assertEquals(out.output.value, w1.value - w2.value);

        flags = new ALU_InputFlags();
        flags.negateY = flags.negateOutput = true;
        out = this.compute(w1, w2, flags);
        assertEquals(out.output.value, w2.value - w1.value);

        flags = new ALU_InputFlags();
        flags.functionCode = ALU_FUNCTIONS.AND;
        out = this.compute(w1, w2, flags);
        assertEquals(out.output.value, w1.value & w2.value);

        flags = new ALU_InputFlags();
        flags.negateOutput = flags.negateX = flags.negateY = true;
        flags.functionCode = ALU_FUNCTIONS.AND;
        out = this.compute(w1, w2, flags);
        assertEquals(out.output.value, w1.value | w2.value);

        console.log("done7");
        function assertEquals(v1:any, v2:any) {
            if (v1 != v2) throw new Error("Not equal " + v1 + "~" + v2);
        }
    }
}