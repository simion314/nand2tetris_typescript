enum EmulatorState{
    PAUSED,
    RUNNING
}

class Emulator {
    private _frquency = 10;
    state:EmulatorState= EmulatorState.PAUSED;
    instructions_RAM:RAM = new RAM(Word.MAX_INT);
    data_RAM:RAM = new RAM(Word.MAX_INT);
    cpu:CPU;
    constructor(){
        this.cpu = new CPU(this.instructions_RAM,this.data_RAM);
    }
    start(machine_code:string):void {
        this.instructions_RAM.loadFromText(machine_code);
        this.data_RAM.loadFromText("11\n1111111111111111");//TODO
        this.cpu.start();
        this.state = EmulatorState.RUNNING;
    }
    stop():void{
        this.cpu.stop();
    }
    nextStep(){
        this.cpu.tick();
    }
}