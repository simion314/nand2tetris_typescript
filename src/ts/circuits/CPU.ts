class CPU {
    constructor(instructionsRAM:RAM, dataRAM:RAM) {
        this._instructions_RAM = instructionsRAM;
        this._data_RAM = dataRAM;
        this._clock = new Clock(10, this._onTick.bind(this));
    }
    max_cycles = 4000;
    private _count = 0;

    private _onTick() {
        this.tick();
        this._count++;
        if (this._count > this.max_cycles) {
            console.log("ENDING main loop");
            this._clock.stop();
        }
    }

    get M():Word {
        let address = this.A;
        return this._data_RAM.run(undefined, false, address);
    }

    set M(value:Word) {
        let address = this.A;
        this._data_RAM.run(value, true, address);
        Logger.logger.log("stored value " + value.value + " in RAM at address " + address.value);
    }

    get D():Word {
        return this._D;
    }

    set D(value:Word) {
        this._D = value;
    }

    private _counter:Counter = new Counter();
    private _instructions_RAM:RAM;
    private _data_RAM:RAM;
    private _A:Word = Word.Zero;//register A
    private _D:Word = Word.Zero;//register D

    private alu:ALU = new ALU();

    set A(w:Word) {
        this._A = w;
    }

    get A():Word {
        return this._A;
    }

    A_instruction(w:Word) {//used to set 15 bit value in A register
        if (w.isNegative) {//it starts with 0
            throw new Error("A instructions accepts only positive values");
        }
        this.A = w;
        Logger.logger.log("A instruction runned, stored " + w.value);
        return undefined;
    }

    static _a_bit = 12;

    C_instruction(instruction:Word) {
        if (!instruction.isNegative) {//it starts with 1
            throw new Error("C instructions accepts only negative values");
        }
        let w1 = this.D;
        let w2 = instruction.nThBit(CPU._a_bit) ? this.M : this.A;

        let out = this.alu.compute(w1, w2, CPU.aluFlagsFromBits(instruction));
        Logger.logger.log(`c instruction run alu on ${w1.value} and ${w2.value} out is ${out.output.value}`);
        this._storeOutput(out.output, instruction);
        return this._jumpAddress(out.output, instruction);
    }


    tick() {
        let address = this._counter.address;
        let instruction = this._instructions_RAM.run(undefined, false, address);
        Logger.logger.log(`Preparing to execute instruction ${instruction} from address ${address.value}`);
        let nextInstructionAddress = this._runInstruction(instruction);
        if (nextInstructionAddress) {
            Logger.logger.log("Store jump address " + nextInstructionAddress.value);
            this._counter.storeAddress(nextInstructionAddress);
        }
        else {
            Logger.logger.log("increment counter address");
            this._counter.increment();
        }
    }

    private _clock:Clock;

    stop() {
        this._clock.stop();
    }

    start() {
        this._clock.start();
    }

    loadProgram(text:string) {
        this._instructions_RAM.loadFromText(text);
    }

    static
    _j1_bit = 2;
    static
    _j2_bit = 1;
    static
    _j3_bit = 0;

    private
    _jumpAddress(out:Word, instruction:Word):Word {
        let address = this.A;
        if (instruction.nThBit(CPU._j1_bit)) {//JGT
            if (out.isNegative) {
                return address;
            }
        }
        if (instruction.nThBit(CPU._j2_bit)) {//JEQ
            if (out.isZero) {
                return address;
            }
        }
        if (instruction.nThBit(CPU._j3_bit)) {//JEQ
            if (out.isStrictPositive) {
                return address;
            }
        }
        return undefined;
    }

    static
    _d1_bit = 5;
    static
    _d2_bit = 4;
    static
    _d3_bit = 3;

    private
    _storeOutput(out:Word, instruction:Word) {
        if (instruction.nThBit(CPU._d1_bit)) {
            this.A = out;
        }
        if (instruction.nThBit(CPU._d2_bit)) {
            this.D = out;
        }
        if (instruction.nThBit(CPU._d3_bit)) {
            this.M = out;
        }
    }

    private
    _runInstruction(instruction:Word) {
        var goto:Word;
        if (!instruction.isNegative) {
            goto = this.A_instruction(instruction);
        }
        else {
            goto = this.C_instruction(instruction);
        }
        return goto;
    }

    static
    _c1_bit = 11;
    static
    _c2_bit = 10;
    static
    _c3_bit = 9;
    static
    _c4_bit = 8;
    static
    _c5_bit = 7;
    static
    _c6_bit = 6;

    private static
    aluFlagsFromBits(instruction:Word):ALU_InputFlags {
        let res = new ALU_InputFlags();
        if (instruction.nThBit(CPU._c1_bit)) {
            res.zeroX = true;
        }
        if (instruction.nThBit(CPU._c2_bit)) {
            res.negateX = true;
        }
        if (instruction.nThBit(CPU._c3_bit)) {
            res.zeroY = true;
        }
        if (instruction.nThBit(CPU._c4_bit)) {
            res.negateY = true;
        }
        if (instruction.nThBit(CPU._c5_bit)) {
            res.functionCode = ALU_FUNCTIONS.ADD;
        }
        else {
            res.functionCode = ALU_FUNCTIONS.AND;
        }
        if (instruction.nThBit(CPU._c6_bit)) {
            res.negateOutput = true;
        }
        return res;
    }

    test() {
        console.log("start");
        var goto = this._runInstruction(Word.fromString("0000000000000111"));
        assertEquals(goto, undefined);
        assertEquals(this.A.value, 7);
        this.M = new Word(314);
        goto = this._runInstruction(Word.fromString("1111110111011000"));
        assertEquals(goto, undefined);
        assertEquals(this.M.value, 315);
        assertEquals(this.D.value, 315);

        function assertEquals(v1:any, v2:any) {
            if (v1 != v2) throw new Error("Not equal " + v1 + "~" + v2);
        }

        console.log("done");
    }

    static jumpTest() {
        let cpu = new CPU(new RAM(Word.MAX_INT), new RAM(Word.MAX_INT));
        cpu.A = new Word(314);
        cpu.M = new Word(12345);
        cpu.D = new Word(315);
        let out = cpu._runInstruction(Word.fromString("1110001100000010"));
        assertEquals(out.value, cpu.M.value);

        function assertEquals(v1:any, v2:any) {
            if (v1 != v2) throw new Error("Not equal " + v1 + "~" + v2);
        }

    }

    static
    programTest() {
        let pText = `0000000000000000
1111110000010000
0000000000000001
1111010011010000
0000000000001010
1110001100000001
0000000000000001
1111110000010000
0000000000001100
1110101010000111
0000000000000000
1111110000010000
0000000000000010
1110001100001000
0000000000001110
1110101010000111`;
        let cpu = new CPU(new RAM(Word.MAX_INT), new RAM(Word.MAX_INT));
        cpu._data_RAM.loadFromText("11\n1111111111111111");
        cpu.loadProgram(pText);
        cpu.start();
    }
}

class Clock {
    private _frequency:number = 1;
    private _interval:number = 0;
    private _callback;

    constructor(frequency:number, callback:any) {
        this._frequency = frequency;
        if (!callback) {
            throw new Error("Callback is undefined");
        }
        this._callback = callback;
    }

    set frequency(value:number){
        if(this._frequency==value){
            return;
        }
        this._frequency = value;
        this.restart();
    }

    restart(){
        this.stop();
        this.start();
    }
    start() {
        this._interval = setInterval(this.tick.bind(this), this._frequency);
    }

    stop() {
        clearInterval(this._interval);
    }

    tick() {
        this._callback();
    }
}