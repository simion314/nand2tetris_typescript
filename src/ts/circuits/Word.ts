class Word {
    private _value:Int16Array = new Int16Array(1);

    constructor(val:number) {
        this._value[0] = val;
    }

    private static _zero:Word = new Word(0);

    static get Zero():Word {
        return Word._zero;
    }

    static get MAX_UINT():number {
        return 65535;
    }

    static get MAX_INT():number {
        return 32767;
    }

    static get MIN_INT():number {
        return -32768;
    }

    get isZero():boolean {
        return this._value[0] == 0;
    }

    get isNegative():boolean {
        return this._value[0] < 0
    };

    get isStrictPositive():boolean {
        return this._value[0] > 0
    };

    get value():number {
        return this._value[0];
    };

    static getNegate(w:Word):Word {
        let val = Word.trimExtraBits(~w.value);
        return new Word(val);
    }

    static trimExtraBits(val:number):number {
        if (val > Word.MAX_INT) {
            val = val & Word.MAX_UINT;
        }
        return val;
    }

    static fromString(val:string):Word {
        var val_n:number = parseInt(val, 2);
        return new Word(val_n);
    }

    toString():string {
        var res = (Math.pow(2, 16) + this._value[0]).toString(2);
        if (res.length == 17) {
            res = res.substr(1, 16);
        }
        return res;
    }

    nThBit(i):boolean {
        if (i < 0 || i >= 16) {
            throw new RangeError("Invalid bit position");
        }
        return (this.value & Math.pow(2, i)) != 0;
    }

    //test(){
    //    var w = new Word(-2);
    //    let nw = Word.getNegate(w);
    //    function assertEquals(v1:any,v2:any){
    //        if(v1!=v2) throw new Error("Not equal "+v1+"~"+v2);
    //    }
    //}

}