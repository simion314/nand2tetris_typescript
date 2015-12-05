class Assembler {
    static compile(text:string):string {
        let lines = text.split("\n")
            .map(Assembler.stripComments)
            .filter(function(line:string){return line!=null&&line!=undefined&&line!="" });
        let instructions = lines.map(Assembler.parseInstruction);


        let symbols = Assembler.buildSymbolTable(instructions);
        var res = "";
        for (var i = 0; i < instructions.length; i++) {
            var instr = instructions[i];
            if(!instr){
                throw new Error("no valid instruction!");
            }
            if(instr.type==InstrType.LABEL){
                continue;
            }

            let word = Assembler.instructionToWord(instr, symbols);
            if(!word){
                throw new Error("Invalid word");
            }
            res += word.toString() + "\n";
        }
        return res.trim();
    }

    private static buildSymbolTable(instructions:Array<Instruction>):{ [name : string]: number; } {
        let symbols:{ [name : string]: number; } = {};
        var memory_count = 16;
        var line_count = 0;
        //we need to find and put all labels in the table,
        //the values for them is computed later but we do it like this because a label can be used before it is defined

        let labelInstructions = instructions.filter(function(i:Instruction){return i.type==InstrType.LABEL;});
        labelInstructions.forEach(function(i:Instruction){
            symbols[i.symbol] =0;
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
                //no line count since this line will not generate a machine code line
            }
        }
        return symbols;
    }

    static instructionToWord(i:Instruction, symbolTable:{[name:string]:number;}):Word {
        if (i.type == InstrType.A) {
            return Assembler.aInstructionToMachineCode(i, symbolTable);
        }
        else if (i.type == InstrType.C) {
            return Assembler.cInstructionToMachineCode(i);
        }
    }

    static parseInstruction(line:string):Instruction {
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
    }

    private static parseA_Instruction(line:string):Instruction {
        let value = line.substr(1);
        var num = parseInt(value);
        let i = new Instruction();
        i.type = InstrType.A;
        if (isNaN(num)) {
            i.symbol = value;
        }
        else {
            i.constant = num;
        }
        return i;
    }

    private static _a_aux = parseInt("0111111111111111", 2);

    private static aInstructionToMachineCode(i:Instruction, symbolTable:{[name:string]:number;}):Word {
        var value = 0;
        if (i.symbol) {
            value = symbolTable[i.symbol];
        }
        else {
            value = i.constant;
        }
        return new Word(value & Assembler._a_aux);
    }

    static test() {
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

        let p1 = `// Computes M[2] = max(M[0], M[1])  where M stands for RAM

   @0
   D=M              // D = first number
   @1
   D=D-M            // D = first number - second number
   @OUTPUT_FIRST
   D;JGT            // if D>0 (first is greater) goto output_first
   @1
   D=M              // D = second number
   @OUTPUT_D
   0;JMP            // goto output_d
(OUTPUT_FIRST)
   @0
   D=M              // D = first number
(OUTPUT_D)
   @2
   M=D              // M[2] = D (greatest number)
(INFINITE_LOOP)
   @INFINITE_LOOP
   0;JMP   `;
        let out1 = `0000000000000000
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

        let asm1 = Assembler.compile(p1);
        assertEquals(asm1, out1);
        function assertEquals(v1:any, v2:any) {
            if (v1 != v2) throw new Error("Not equal " + v1 + "~" + v2);
        }
    }

    private static c_val_aux = -8192;

    private static cInstructionToMachineCode(i:Instruction):Word {
        var res = 0;
        if (i.jump) {
            res += Assembler.JumpValues[i.jump];
        }
        if (i.store) {
            res += Assembler.destinationValues[i.store];
        }
        res += Assembler.commandsValues[i.command];
        return new Word(res + +Assembler.c_val_aux);
    }

    private static parseC_Instruction(line:string):Instruction {
        let i = new Instruction();
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
    }

    static stripComments(line:string):string {
        line = line.trim();
        let index = line.indexOf("//");
        if (index < 0) {
            return line;
        }
        else if (index == 0) {
            return null;
        }
        else {
            return line.substr(0, index).trim();
        }
    }

    static JumpValues:{[name:string]:number;} = {
        "JMP": parseInt("111", 2),
        "JEQ": parseInt("010", 2),
        "JGT": parseInt("001", 2),
        "JLT": parseInt("100", 2),
        "JNE": parseInt("101", 2),
        "JGE": parseInt("011", 2),
        "JLE": parseInt("110", 2)
    };
    static destinationValues:{[name:string]:number;} = {
        "D": parseInt("010000", 2),
        "A": parseInt("100000", 2),
        "M": parseInt("001000", 2),
    };
    static commandsValues:{[name:string]:number;} = {
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
}
class Instruction {
    type:InstrType;
    constant:number;
    symbol:string;
    jump:string;
    store:string;
    command:string;
}
enum InstrType{A, C, LABEL}
class Symbol {
    public static get SP():number {
        return 0;
    }

    public static get LCL():number {
        return 1;
    }

    public static get ARG():number {
        return 2;
    }

    public static get THIS():number {
        return 3;
    }

    public static get THAT():number {
        return 4;
    }

    public static get R0():number {
        return 0;
    }

    public static get R1():number {
        return 1;
    }

    public static get R2():number {
        return 2;
    }

    public static get R3():number {
        return 3;
    }

    public static get R4():number {
        return 4;
    }

    public static get R5():number {
        return 5;
    }

    public static get R6():number {
        return 6;
    }

    public static get R7():number {
        return 7;
    }

    public static get R8():number {
        return 8;
    }

    public static get R9():number {
        return 9;
    }

    public static get R10():number {
        return 10;
    }

    public static get R11():number {
        return 11;
    }

    public static get R12():number {
        return 12;
    }

    public static get R13():number {
        return 13;
    }

    public static get R14():number {
        return 14;
    }

    public static get R15():number {
        return 15;
    }

    public static get SCREEN():number {
        return 16384;
    }

    public static get KBD():number {
        return 24576;
    }

    static builtin_symbols:{ [name : string]: number; } = {
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

}