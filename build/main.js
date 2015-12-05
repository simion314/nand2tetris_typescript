var Greeter = (function () {
    function Greeter() {
    }
    Greeter.test = function () {
        //var s:Sumator = new Sumator();
        var w = Word.fromString("1111111111111111");
        alert(w.value);
    };
    return Greeter;
})();
var Logger = (function () {
    function Logger() {
        this.logToConsole = true;
    }
    Logger.prototype.log = function (message) {
        if (this.logToConsole) {
            console.log(message);
        }
    };
    Logger.logger = new Logger();
    return Logger;
})();
var Sumator = (function () {
    function Sumator() {
    }
    Sumator.prototype.sum = function (word1, word2) {
        var v1 = word1.value;
        var v2 = word2.value;
        return new Word(v1 + v2);
    };
    return Sumator;
})();
var Word = (function () {
    function Word(val) {
        this._value = new Int16Array(1);
        this._value[0] = val;
    }
    Object.defineProperty(Word, "Zero", {
        get: function () {
            return Word._zero;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Word, "MAX_UINT", {
        get: function () {
            return 65535;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Word, "MAX_INT", {
        get: function () {
            return 32767;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Word, "MIN_INT", {
        get: function () {
            return -32768;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Word.prototype, "isZero", {
        get: function () {
            return this._value[0] == 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Word.prototype, "isNegative", {
        get: function () {
            return this._value[0] < 0;
        },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(Word.prototype, "isStrictPositive", {
        get: function () {
            return this._value[0] > 0;
        },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(Word.prototype, "value", {
        get: function () {
            return this._value[0];
        },
        enumerable: true,
        configurable: true
    });
    ;
    Word.getNegate = function (w) {
        var val = Word.trimExtraBits(~w.value);
        return new Word(val);
    };
    Word.trimExtraBits = function (val) {
        if (val > Word.MAX_INT) {
            val = val & Word.MAX_UINT;
        }
        return val;
    };
    Word.fromString = function (val) {
        var val_n = parseInt(val, 2);
        return new Word(val_n);
    };
    Word.prototype.toString = function () {
        var res = (Math.pow(2, 16) + this._value[0]).toString(2);
        if (res.length == 17) {
            res = res.substr(1, 16);
        }
        return res;
    };
    Word.prototype.nThBit = function (i) {
        if (i < 0 || i >= 16) {
            throw new RangeError("Invalid bit position");
        }
        return (this.value & Math.pow(2, i)) != 0;
    };
    Word._zero = new Word(0);
    return Word;
})();
var AND = (function () {
    function AND() {
    }
    AND.prototype.and = function (w1, w2) {
        var val = w1.value & w2.value;
        val = Word.trimExtraBits(val);
        return new Word(val);
    };
    return AND;
})();
var ALU_FUNCTIONS;
(function (ALU_FUNCTIONS) {
    ALU_FUNCTIONS[ALU_FUNCTIONS["ADD"] = 0] = "ADD";
    ALU_FUNCTIONS[ALU_FUNCTIONS["AND"] = 1] = "AND";
})(ALU_FUNCTIONS || (ALU_FUNCTIONS = {}));
var ALU_InputFlags = (function () {
    function ALU_InputFlags() {
        this.zeroX = false;
        this.negateX = false;
        this.zeroY = false;
        this.negateY = false;
        this.functionCode = ALU_FUNCTIONS.ADD;
        this.negateOutput = false;
    }
    return ALU_InputFlags;
})();
var ALU_Output = (function () {
    function ALU_Output(out) {
        this.output = out;
        this.isZero = out.isZero;
        this.isNegative = out.isNegative;
    }
    return ALU_Output;
})();
var ALU = (function () {
    function ALU() {
        this._sumator = new Sumator();
        this._and = new AND();
    }
    ALU.prototype.compute = function (w1, w2, flags) {
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
        var out;
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
    };
    ALU.prototype.test = function (w1, w2) {
        var flags = new ALU_InputFlags();
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
        function assertEquals(v1, v2) {
            if (v1 != v2)
                throw new Error("Not equal " + v1 + "~" + v2);
        }
    };
    return ALU;
})();
var Calculator = (function () {
    function Calculator(alu) {
        this._alu = alu;
        if (!Calculator._addOpFlags) {
            Calculator.initStaticFields();
        }
    }
    Object.defineProperty(Calculator, "addOpFlags", {
        get: function () {
            return this._addOpFlags;
        },
        enumerable: true,
        configurable: true
    });
    Calculator.prototype.add = function (x, y) {
        return this._alu.compute(x, y, Calculator.addOpFlags).output;
    };
    Calculator.initStaticFields = function () {
        Calculator._addOpFlags = new ALU_InputFlags();
        Calculator._addOpFlags.functionCode = ALU_FUNCTIONS.ADD;
    };
    return Calculator;
})();
var RAM = (function () {
    function RAM(length) {
        this._memory = new Int16Array(length);
    }
    RAM.prototype.run = function (input, load, address) {
        var res = new Word(this._memory[address.value]);
        if (load) {
            this._memory[address.value] = input.value;
        }
        return res;
    };
    RAM.prototype.loadFromText = function (text) {
        var lines = text.split("\n");
        var start = 0;
        for (var i = 0; i < lines.length; i++) {
            this._memory[start + i] = Word.fromString(lines[i]).value;
        }
    };
    return RAM;
})();
var Counter = (function () {
    function Counter() {
        this._count = Word.Zero;
    }
    Counter.prototype.run = function (input, increment, load, reset) {
        var res = this._count;
        if (reset) {
            this._count = Word.Zero;
        }
        else if (load) {
            this._count = input;
        }
        else if (increment) {
            this._count = new Word(this._count.value + 1);
        }
        return res;
    };
    Counter.prototype.storeAddress = function (address) {
        this.run(address, false, true, false);
    };
    Counter.prototype.increment = function () {
        this.run(undefined, true, false, false);
    };
    Object.defineProperty(Counter.prototype, "address", {
        get: function () {
            return this.run(undefined, false, false, false);
        },
        enumerable: true,
        configurable: true
    });
    return Counter;
})();
var ScreenDisplay = (function () {
    function ScreenDisplay() {
        this.width = 512;
        this.height = 256;
        this._MEMORY_INDEX = 111;
    }
    return ScreenDisplay;
})();
var Keyboard = (function () {
    function Keyboard() {
    }
    return Keyboard;
})();
var CPU = (function () {
    function CPU(instructionsRAM, dataRAM) {
        this.max_cycles = 4000;
        this._count = 0;
        this._counter = new Counter();
        this._A = Word.Zero; //register A
        this._D = Word.Zero; //register D
        this.alu = new ALU();
        this._instructions_RAM = instructionsRAM;
        this._data_RAM = dataRAM;
        this._clock = new Clock(10, this._onTick.bind(this));
    }
    CPU.prototype._onTick = function () {
        this.tick();
        this._count++;
        if (this._count > this.max_cycles) {
            console.log("ENDING main loop");
            this._clock.stop();
        }
    };
    Object.defineProperty(CPU.prototype, "M", {
        get: function () {
            var address = this.A;
            return this._data_RAM.run(undefined, false, address);
        },
        set: function (value) {
            var address = this.A;
            this._data_RAM.run(value, true, address);
            Logger.logger.log("stored value " + value.value + " in RAM at address " + address.value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CPU.prototype, "D", {
        get: function () {
            return this._D;
        },
        set: function (value) {
            this._D = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CPU.prototype, "A", {
        get: function () {
            return this._A;
        },
        set: function (w) {
            this._A = w;
        },
        enumerable: true,
        configurable: true
    });
    CPU.prototype.A_instruction = function (w) {
        if (w.isNegative) {
            throw new Error("A instructions accepts only positive values");
        }
        this.A = w;
        Logger.logger.log("A instruction runned, stored " + w.value);
        return undefined;
    };
    CPU.prototype.C_instruction = function (instruction) {
        if (!instruction.isNegative) {
            throw new Error("C instructions accepts only negative values");
        }
        var w1 = this.D;
        var w2 = instruction.nThBit(CPU._a_bit) ? this.M : this.A;
        var out = this.alu.compute(w1, w2, CPU.aluFlagsFromBits(instruction));
        Logger.logger.log("c instruction run alu on " + w1.value + " and " + w2.value + " out is " + out.output.value);
        this._storeOutput(out.output, instruction);
        return this._jumpAddress(out.output, instruction);
    };
    CPU.prototype.tick = function () {
        var address = this._counter.address;
        var instruction = this._instructions_RAM.run(undefined, false, address);
        Logger.logger.log("Preparing to execute instruction " + instruction + " from address " + address.value);
        var nextInstructionAddress = this._runInstruction(instruction);
        if (nextInstructionAddress) {
            Logger.logger.log("Store jump address " + nextInstructionAddress.value);
            this._counter.storeAddress(nextInstructionAddress);
        }
        else {
            Logger.logger.log("increment counter address");
            this._counter.increment();
        }
    };
    CPU.prototype.stop = function () {
        this._clock.stop();
    };
    CPU.prototype.start = function () {
        this._clock.start();
    };
    CPU.prototype.loadProgram = function (text) {
        this._instructions_RAM.loadFromText(text);
    };
    CPU.prototype._jumpAddress = function (out, instruction) {
        var address = this.A;
        if (instruction.nThBit(CPU._j1_bit)) {
            if (out.isNegative) {
                return address;
            }
        }
        if (instruction.nThBit(CPU._j2_bit)) {
            if (out.isZero) {
                return address;
            }
        }
        if (instruction.nThBit(CPU._j3_bit)) {
            if (out.isStrictPositive) {
                return address;
            }
        }
        return undefined;
    };
    CPU.prototype._storeOutput = function (out, instruction) {
        if (instruction.nThBit(CPU._d1_bit)) {
            this.A = out;
        }
        if (instruction.nThBit(CPU._d2_bit)) {
            this.D = out;
        }
        if (instruction.nThBit(CPU._d3_bit)) {
            this.M = out;
        }
    };
    CPU.prototype._runInstruction = function (instruction) {
        var goto;
        if (!instruction.isNegative) {
            goto = this.A_instruction(instruction);
        }
        else {
            goto = this.C_instruction(instruction);
        }
        return goto;
    };
    CPU.aluFlagsFromBits = function (instruction) {
        var res = new ALU_InputFlags();
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
    };
    CPU.prototype.test = function () {
        console.log("start");
        var goto = this._runInstruction(Word.fromString("0000000000000111"));
        assertEquals(goto, undefined);
        assertEquals(this.A.value, 7);
        this.M = new Word(314);
        goto = this._runInstruction(Word.fromString("1111110111011000"));
        assertEquals(goto, undefined);
        assertEquals(this.M.value, 315);
        assertEquals(this.D.value, 315);
        function assertEquals(v1, v2) {
            if (v1 != v2)
                throw new Error("Not equal " + v1 + "~" + v2);
        }
        console.log("done");
    };
    CPU.jumpTest = function () {
        var cpu = new CPU(new RAM(Word.MAX_INT), new RAM(Word.MAX_INT));
        cpu.A = new Word(314);
        cpu.M = new Word(12345);
        cpu.D = new Word(315);
        var out = cpu._runInstruction(Word.fromString("1110001100000010"));
        assertEquals(out.value, cpu.M.value);
        function assertEquals(v1, v2) {
            if (v1 != v2)
                throw new Error("Not equal " + v1 + "~" + v2);
        }
    };
    CPU.programTest = function () {
        var pText = "0000000000000000\n1111110000010000\n0000000000000001\n1111010011010000\n0000000000001010\n1110001100000001\n0000000000000001\n1111110000010000\n0000000000001100\n1110101010000111\n0000000000000000\n1111110000010000\n0000000000000010\n1110001100001000\n0000000000001110\n1110101010000111";
        var cpu = new CPU(new RAM(Word.MAX_INT), new RAM(Word.MAX_INT));
        cpu._data_RAM.loadFromText("11\n1111111111111111");
        cpu.loadProgram(pText);
        cpu.start();
    };
    CPU._a_bit = 12;
    CPU._j1_bit = 2;
    CPU._j2_bit = 1;
    CPU._j3_bit = 0;
    CPU._d1_bit = 5;
    CPU._d2_bit = 4;
    CPU._d3_bit = 3;
    CPU._c1_bit = 11;
    CPU._c2_bit = 10;
    CPU._c3_bit = 9;
    CPU._c4_bit = 8;
    CPU._c5_bit = 7;
    CPU._c6_bit = 6;
    return CPU;
})();
var Clock = (function () {
    function Clock(frequency, callback) {
        this._frequency = 1;
        this._interval = 0;
        this._frequency = frequency;
        if (!callback) {
            throw new Error("Callback is undefined");
        }
        this._callback = callback;
    }
    Object.defineProperty(Clock.prototype, "frequency", {
        set: function (value) {
            if (this._frequency == value) {
                return;
            }
            this._frequency = value;
            this.restart();
        },
        enumerable: true,
        configurable: true
    });
    Clock.prototype.restart = function () {
        this.stop();
        this.start();
    };
    Clock.prototype.start = function () {
        this._interval = setInterval(this.tick.bind(this), this._frequency);
    };
    Clock.prototype.stop = function () {
        clearInterval(this._interval);
    };
    Clock.prototype.tick = function () {
        this._callback();
    };
    return Clock;
})();
var Assembler = (function () {
    function Assembler() {
    }
    Assembler.compile = function (text) {
        var lines = text.split("\n")
            .map(Assembler.stripComments)
            .filter(function (line) { return line != null && line != undefined && line != ""; });
        var instructions = lines.map(Assembler.parseInstruction);
        var symbols = Assembler.buildSymbolTable(instructions);
        var res = "";
        for (var i = 0; i < instructions.length; i++) {
            var instr = instructions[i];
            if (!instr) {
                throw new Error("no valid instruction!");
            }
            if (instr.type == InstrType.LABEL) {
                continue;
            }
            var word = Assembler.instructionToWord(instr, symbols);
            if (!word) {
                throw new Error("Invalid word");
            }
            res += word.toString() + "\n";
        }
        return res.trim();
    };
    Assembler.buildSymbolTable = function (instructions) {
        var symbols = {};
        var memory_count = 16;
        var line_count = 0;
        //we need to find and put all labels in the table,
        //the values for them is computed later but we do it like this because a label can be used before it is defined
        var labelInstructions = instructions.filter(function (i) { return i.type == InstrType.LABEL; });
        labelInstructions.forEach(function (i) {
            symbols[i.symbol] = 0;
        });
        for (var i = 0; i < instructions.length; i++) {
            var instr = instructions[i];
            if (instr.type == InstrType.C) {
                line_count++;
            }
            else if (instr.type == InstrType.A) {
                if (instr.symbol) {
                    var v = symbols[instr.symbol];
                    if (!v) {
                        v = memory_count;
                        memory_count++;
                        symbols[instr.symbol] = v;
                    }
                }
                line_count++;
            }
            else if (instr.type == InstrType.LABEL) {
                var v = symbols[instr.symbol];
                symbols[instr.symbol] = line_count;
            }
        }
        return symbols;
    };
    Assembler.instructionToWord = function (i, symbolTable) {
        if (i.type == InstrType.A) {
            return Assembler.aInstructionToMachineCode(i, symbolTable);
        }
        else if (i.type == InstrType.C) {
            return Assembler.cInstructionToMachineCode(i);
        }
    };
    Assembler.parseInstruction = function (line) {
        if (line.indexOf("@") == 0) {
            return Assembler.parseA_Instruction(line);
        }
        else if (line.indexOf("(") == 0) {
            var i = new Instruction();
            i.type = InstrType.LABEL;
            i.symbol = line.split("(").join("").split(")").join("");
            return i;
        }
        else {
            return Assembler.parseC_Instruction(line);
        }
    };
    Assembler.parseA_Instruction = function (line) {
        var value = line.substr(1);
        var num = parseInt(value);
        var i = new Instruction();
        i.type = InstrType.A;
        if (isNaN(num)) {
            i.symbol = value;
        }
        else {
            i.constant = num;
        }
        return i;
    };
    Assembler.aInstructionToMachineCode = function (i, symbolTable) {
        var value = 0;
        if (i.symbol) {
            value = symbolTable[i.symbol];
        }
        else {
            value = i.constant;
        }
        return new Word(value & Assembler._a_aux);
    };
    Assembler.test = function () {
        //        let p = `@2
        //D=A
        //@3
        //D=D+A
        //@0
        //M=D`;
        //
        //        let out = `0000000000000010
        //1110110000010000
        //0000000000000011
        //1110000010010000
        //0000000000000000
        //1110001100001000`;
        //        let asm = Assembler.compile(p);
        //        assertEquals(asm, out);
        var p1 = "// Computes M[2] = max(M[0], M[1])  where M stands for RAM\n\n   @0\n   D=M              // D = first number\n   @1\n   D=D-M            // D = first number - second number\n   @OUTPUT_FIRST\n   D;JGT            // if D>0 (first is greater) goto output_first\n   @1\n   D=M              // D = second number\n   @OUTPUT_D\n   0;JMP            // goto output_d\n(OUTPUT_FIRST)\n   @0\n   D=M              // D = first number\n(OUTPUT_D)\n   @2\n   M=D              // M[2] = D (greatest number)\n(INFINITE_LOOP)\n   @INFINITE_LOOP\n   0;JMP   ";
        var out1 = "0000000000000000\n1111110000010000\n0000000000000001\n1111010011010000\n0000000000001010\n1110001100000001\n0000000000000001\n1111110000010000\n0000000000001100\n1110101010000111\n0000000000000000\n1111110000010000\n0000000000000010\n1110001100001000\n0000000000001110\n1110101010000111";
        var asm1 = Assembler.compile(p1);
        assertEquals(asm1, out1);
        function assertEquals(v1, v2) {
            if (v1 != v2)
                throw new Error("Not equal " + v1 + "~" + v2);
        }
    };
    Assembler.cInstructionToMachineCode = function (i) {
        var res = 0;
        if (i.jump) {
            res += Assembler.JumpValues[i.jump];
        }
        if (i.store) {
            res += Assembler.destinationValues[i.store];
        }
        res += Assembler.commandsValues[i.command];
        return new Word(res + +Assembler.c_val_aux);
    };
    Assembler.parseC_Instruction = function (line) {
        var i = new Instruction();
        i.type = InstrType.C;
        var parts = line.split("=");
        var dest = null;
        if (parts.length > 1) {
            dest = parts[0];
            line = parts[1];
        }
        var jump = null;
        parts = line.split(";");
        if (parts.length > 1) {
            jump = parts[1];
            line = parts[0];
        }
        i.jump = jump;
        i.store = dest;
        i.command = line;
        return i;
    };
    Assembler.stripComments = function (line) {
        line = line.trim();
        var index = line.indexOf("//");
        if (index < 0) {
            return line;
        }
        else if (index == 0) {
            return null;
        }
        else {
            return line.substr(0, index).trim();
        }
    };
    Assembler._a_aux = parseInt("0111111111111111", 2);
    Assembler.c_val_aux = -8192;
    Assembler.JumpValues = {
        "JMP": parseInt("111", 2),
        "JEQ": parseInt("010", 2),
        "JGT": parseInt("001", 2),
        "JLT": parseInt("100", 2),
        "JNE": parseInt("101", 2),
        "JGE": parseInt("011", 2),
        "JLE": parseInt("110", 2)
    };
    Assembler.destinationValues = {
        "D": parseInt("010000", 2),
        "A": parseInt("100000", 2),
        "M": parseInt("001000", 2),
    };
    Assembler.commandsValues = {
        "0": parseInt("0101010000000", 2),
        "1": parseInt("0111111000000", 2),
        "-1": parseInt("0111010000000", 2),
        "D": parseInt("0001100000000", 2),
        "A": parseInt("0110000000000", 2),
        "M": parseInt("1110000000000", 2),
        "!D": parseInt("0001101000000", 2),
        "!A": parseInt("0110001000000", 2),
        "!M": parseInt("1110001000000", 2),
        "-D": parseInt("0001111000000", 2),
        "-A": parseInt("0110011000000", 2),
        "-M": parseInt("1110011000000", 2),
        "D+1": parseInt("0011111000000", 2),
        "A+1": parseInt("0110111000000", 2),
        "M+1": parseInt("1110111000000", 2),
        "D-1": parseInt("0001110000000", 2),
        "A-1": parseInt("0110010000000", 2),
        "M-1": parseInt("1110010000000", 2),
        "D+A": parseInt("0000010000000", 2),
        "D+M": parseInt("1000010000000", 2),
        "D-A": parseInt("0010011000000", 2),
        "D-M": parseInt("1010011000000", 2),
        "A-D": parseInt("0000111000000", 2),
        "M-D": parseInt("1000111000000", 2),
        "D&A": parseInt("0000000000000", 2),
        "D&M": parseInt("1000000000000", 2),
        "D|A": parseInt("0010101000000", 2),
        "D|M": parseInt("1010101000000", 2)
    };
    return Assembler;
})();
var Instruction = (function () {
    function Instruction() {
    }
    return Instruction;
})();
var InstrType;
(function (InstrType) {
    InstrType[InstrType["A"] = 0] = "A";
    InstrType[InstrType["C"] = 1] = "C";
    InstrType[InstrType["LABEL"] = 2] = "LABEL";
})(InstrType || (InstrType = {}));
var Symbol = (function () {
    function Symbol() {
    }
    Object.defineProperty(Symbol, "SP", {
        get: function () {
            return 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol, "LCL", {
        get: function () {
            return 1;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol, "ARG", {
        get: function () {
            return 2;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol, "THIS", {
        get: function () {
            return 3;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol, "THAT", {
        get: function () {
            return 4;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol, "R0", {
        get: function () {
            return 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol, "R1", {
        get: function () {
            return 1;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol, "R2", {
        get: function () {
            return 2;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol, "R3", {
        get: function () {
            return 3;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol, "R4", {
        get: function () {
            return 4;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol, "R5", {
        get: function () {
            return 5;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol, "R6", {
        get: function () {
            return 6;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol, "R7", {
        get: function () {
            return 7;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol, "R8", {
        get: function () {
            return 8;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol, "R9", {
        get: function () {
            return 9;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol, "R10", {
        get: function () {
            return 10;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol, "R11", {
        get: function () {
            return 11;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol, "R12", {
        get: function () {
            return 12;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol, "R13", {
        get: function () {
            return 13;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol, "R14", {
        get: function () {
            return 14;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol, "R15", {
        get: function () {
            return 15;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol, "SCREEN", {
        get: function () {
            return 16384;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol, "KBD", {
        get: function () {
            return 24576;
        },
        enumerable: true,
        configurable: true
    });
    Symbol.builtin_symbols = {
        "SP": Symbol.SP,
        "LCL": Symbol.LCL,
        "ARG": Symbol.ARG,
        "THIS": Symbol.THIS,
        "THAT": Symbol.THAT,
        "SCREEN": Symbol.SCREEN,
        "KBD": Symbol.KBD,
        "R0": Symbol.R0,
        "R1": Symbol.R1,
        "R2": Symbol.R2,
        "R3": Symbol.R3,
        "R4": Symbol.R4,
        "R5": Symbol.R5,
        "R6": Symbol.R6,
        "R7": Symbol.R7,
        "R8": Symbol.R8,
        "R9": Symbol.R9,
        "R10": Symbol.R10,
        "R11": Symbol.R11,
        "R12": Symbol.R12,
        "R13": Symbol.R13,
        "R14": Symbol.R14,
        "R15": Symbol.R15
    };
    return Symbol;
})();
var MemorySegment = (function () {
    function MemorySegment() {
    }
    return MemorySegment;
})();
/// <reference path="../../../../typings/react/react-global.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var MemorySegmentView = (function (_super) {
    __extends(MemorySegmentView, _super);
    function MemorySegmentView() {
        _super.apply(this, arguments);
    }
    MemorySegmentView.prototype.render = function () {
        var elements = [];
        for (var i = this.props.start; i < this.props.end; i++) {
            var value = this.props.ram.run(null, false, new Word(i));
            elements.push(React.createElement("span", null, value.toString(), " / ", value.value, React.createElement("br", null)));
        }
        return React.createElement("div", {"className": "memory-segment-view"}, React.createElement("h3", null, this.props.name), elements);
    };
    MemorySegmentView.test = function (id) {
        var ram = new RAM(32);
        ReactDOM.render(React.createElement(MemorySegmentView, {"start": 0, "end": 15, "ram": ram, "name": "Upper"}), document.getElementById(id));
    };
    return MemorySegmentView;
})(React.Component);
/// <reference path="../../../../typings/react/react-global.d.ts" />
var CPU_View = (function (_super) {
    __extends(CPU_View, _super);
    function CPU_View() {
        _super.apply(this, arguments);
    }
    CPU_View.prototype.render = function () {
        var cpu = this.props.cpu;
        var A = cpu.A.toString() + " / " + cpu.A.value;
        var M = cpu.M.toString() + " / " + cpu.M.value;
        var D = cpu.D.toString() + " / " + cpu.D.value;
        return (React.createElement("div", {"className": "cpi_view"}, React.createElement("div", null, React.createElement("span", null, "Registers:"), React.createElement("br", null), React.createElement("span", null, "A:", A), React.createElement("br", null), React.createElement("span", null, "M:", M), React.createElement("br", null), React.createElement("span", null, "D:", D), React.createElement("br", null))));
    };
    return CPU_View;
})(React.Component);
/// <reference path="../../../../typings/react/react-global.d.ts" />
var EmulatorViewEvent;
(function (EmulatorViewEvent) {
})(EmulatorViewEvent || (EmulatorViewEvent = {}));
var EmulatorView = (function (_super) {
    __extends(EmulatorView, _super);
    function EmulatorView() {
        _super.apply(this, arguments);
        this.onNext = new LiteEvent();
        this.onStartStop = new LiteEvent();
        this.onRefresh = new LiteEvent();
        this.testAssembly = "// Computes M[2] = max(M[0], M[1])  where M stands for RAM\n@0\nD=M // D = first number\n@1\nD=D-M   // D = first number - second number\n@OUTPUT_FIRST\nD;JGT   // if D>0 (first is greater) goto output_first\n@1\nD=M // D = second number\n@OUTPUT_D\n0;JMP   // goto output_d\n(OUTPUT_FIRST)\n@0\nD=M // D = first number\n(OUTPUT_D)\n@2\nM=D // M[2] = D (greatest number)\n(INFINITE_LOOP)\n@INFINITE_LOOP\n0;JMP";
    }
    Object.defineProperty(EmulatorView.prototype, "NextEv", {
        get: function () {
            return this.onNext;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EmulatorView.prototype, "StartStopEv", {
        get: function () {
            return this.onStartStop;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EmulatorView.prototype, "RefreshEv", {
        get: function () {
            return this.onRefresh;
        },
        enumerable: true,
        configurable: true
    });
    EmulatorView.prototype.startStop = function () {
        var m_code = this.machineCode;
        this.onStartStop.trigger(m_code);
    };
    EmulatorView.prototype.nextStep = function () {
        this.onNext.trigger();
    };
    EmulatorView.prototype.refresh = function () {
        this.onRefresh.trigger();
    };
    EmulatorView.prototype.render = function () {
        var emulator = this.props.emulator;
        return (React.createElement("div", {"className": "emulator-view"}, React.createElement("div", {"className": "emulator-toolbar"}, React.createElement("button", {"className": "em-start-button", "onClick": this.startStop.bind(this)}, "Start/Stop"), React.createElement("button", {"className": "em-start-button", "onClick": this.nextStep.bind(this)}, "Next"), React.createElement("button", {"className": "em-start-button", "onClick": this.refresh.bind(this)}, "Refresh")), React.createElement("div", {"className": "emulator-view-center-panel"}, React.createElement(MemorySegmentView, {"start": 0, "end": 15, "ram": emulator.data_RAM, "name": "Upper memory"}), React.createElement(MemorySegmentView, {"start": 16, "end": 32, "ram": emulator.data_RAM, "name": "Variables memory"}), React.createElement(CPU_View, {"cpu": emulator.cpu}), React.createElement("div", {"className": "assembly-panel"}, React.createElement("div", {"className": "h-group gap12 height100pr"}, React.createElement("div", {"className": "code-panel"}, React.createElement("h3", null, "Assembly source"), React.createElement("textarea", {"className": "assembly-input", "id": "assembly-area"}, this.testAssembly)), React.createElement("div", {"className": "code-panel"}, React.createElement("h3", null, "Machine code"), React.createElement("textarea", {"className": "assembly-input", "id": "machine-code-area"}))), React.createElement("button", {"onClick": this.compileAssembly}, "Compile")))));
    };
    EmulatorView.prototype.compileAssembly = function () {
        var assembly = document.getElementById("assembly-area")['value'];
        var m1 = Assembler.compile(assembly);
        document.getElementById("machine-code-area")['value'] = m1;
    };
    Object.defineProperty(EmulatorView.prototype, "machineCode", {
        get: function () {
            return document.getElementById("machine-code-area")['value'];
        },
        enumerable: true,
        configurable: true
    });
    return EmulatorView;
})(React.Component);
var EmulatorState;
(function (EmulatorState) {
    EmulatorState[EmulatorState["PAUSED"] = 0] = "PAUSED";
    EmulatorState[EmulatorState["RUNNING"] = 1] = "RUNNING";
})(EmulatorState || (EmulatorState = {}));
var Emulator = (function () {
    function Emulator() {
        this._frquency = 10;
        this.state = EmulatorState.PAUSED;
        this.instructions_RAM = new RAM(Word.MAX_INT);
        this.data_RAM = new RAM(Word.MAX_INT);
        this.cpu = new CPU(this.instructions_RAM, this.data_RAM);
    }
    Emulator.prototype.start = function (machine_code) {
        this.instructions_RAM.loadFromText(machine_code);
        this.data_RAM.loadFromText("11\n1111111111111111"); //TODO
        this.cpu.start();
        this.state = EmulatorState.RUNNING;
    };
    Emulator.prototype.stop = function () {
        this.cpu.stop();
    };
    Emulator.prototype.nextStep = function () {
        this.cpu.tick();
    };
    return Emulator;
})();
/// <reference path="../../../typings/react/react-global.d.ts" />
var MainViewModel = (function () {
    function MainViewModel() {
        this.emulator = new Emulator();
    }
    MainViewModel.prototype.startStop = function (machine_code) {
        var emulator = this.emulator;
        var em_state = emulator.state;
        if (em_state == EmulatorState.RUNNING) {
            emulator.stop();
        }
        else {
            emulator.start(machine_code);
        }
    };
    MainViewModel.prototype.refreshView = function () {
        this.view.forceUpdate();
    };
    MainViewModel.prototype.nextStep = function () {
        this.emulator.nextStep();
        this.refreshView();
    };
    MainViewModel.prototype.setup = function (node_id) {
        this.node = document.getElementById(node_id);
        var emulatorViewProps = {
            emulator: this.emulator
        };
        this.view = ReactDOM.render(React.createElement(EmulatorView, emulatorViewProps), this.node);
        this.refreshView['thisObj'] = this;
        this.nextStep['thisObj'] = this;
        this.startStop['thisObj'] = this;
        this.refreshView['thisObj'] = this;
        this.view.RefreshEv.on(this.refreshView);
        this.view.NextEv.on(this.nextStep);
        this.view.StartStopEv.on(this.startStop);
    };
    return MainViewModel;
})();
var LiteEvent = (function () {
    function LiteEvent() {
        this.handlers = [];
    }
    LiteEvent.prototype.on = function (handler) {
        this.handlers.push(handler);
    };
    LiteEvent.prototype.off = function (handler) {
        this.handlers = this.handlers.filter(function (h) { return h !== handler; });
    };
    LiteEvent.prototype.trigger = function (data) {
        this.handlers.slice(0).forEach(function (h) {
            if (h.hasOwnProperty("thisObj")) {
                h.call(h['thisObj'], data);
            }
            else {
                h(data);
            }
        });
    };
    return LiteEvent;
})();
var Operators = (function () {
    function Operators() {
    }
    Object.defineProperty(Operators, "pop", {
        get: function () {
            return "pop";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Operators, "push", {
        get: function () {
            return "push";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Operators, "add", {
        get: function () {
            return "add";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Operators, "sub", {
        get: function () {
            return "sub";
        },
        enumerable: true,
        configurable: true
    });
    return Operators;
})();
var MemoryStack = (function () {
    function MemoryStack(ram, start, end) {
        this.ram = ram;
        this.start_address = start;
        this.pointer = this.start_address;
        this.end_address = end;
    }
    MemoryStack.prototype.pop = function () {
        if (this.pointer.value <= this.start_address.value) {
            throw new Error("Attempt to pop an empty stack ");
        }
        var res = this.ram.run(null, true, this.pointer);
        this.pointer = new Word(this.pointer.value);
        return res;
    };
    MemoryStack.prototype.push = function (w) {
        if (this.pointer.value >= this.end_address.value - 1) {
            throw new Error("Attempt to push on a full stack ");
        }
        this.ram.run(w, false, this.pointer);
        this.pointer = new Word(this.pointer.value + 1);
    };
    return MemoryStack;
})();
var VM = (function () {
    function VM() {
    }
    VM.prototype.initStacks = function (ram) {
        this._staticStack = new MemoryStack(ram, Word.Zero, new Word(314));
        this.myStacks = {
            "static": this._staticStack
        };
    };
    return VM;
})();
//# sourceMappingURL=main.js.map