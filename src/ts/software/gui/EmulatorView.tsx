/// <reference path="../../../../typings/react/react-global.d.ts" />
enum EmulatorViewEvent{

}
interface EmulatorViewProps {
    emulator?:Emulator;
}
class EmulatorView extends React.Component<EmulatorViewProps, {}> {
    private onNext = new LiteEvent<void>();
    private onStartStop = new LiteEvent<string>();
    private onRefresh = new LiteEvent<void>();

    public get NextEv():ILiteEvent<void> {
        return this.onNext;
    }

    public get StartStopEv():ILiteEvent<string> {
        return this.onStartStop;
    }

    public get RefreshEv():ILiteEvent<void> {
        return this.onRefresh;
    }

    startStop() {
        let m_code = this.machineCode;
        this.onStartStop.trigger(m_code);
    }

    nextStep() {
        this.onNext.trigger();
    }

    refresh() {
        this.onRefresh.trigger();
    }

    render() {
        let emulator = this.props.emulator;
        return (
            <div className="emulator-view">
                <div className="emulator-toolbar">
                    <button className="em-start-button" onClick={this.startStop.bind(this)}>
                        Start/Stop
                    </button>
                    <button className="em-start-button" onClick={this.nextStep.bind(this)}>
                        Next
                    </button>
                    <button className="em-start-button" onClick={this.refresh.bind(this)}>
                        Refresh
                    </button>
                </div>
                <div className="emulator-view-center-panel">
                    <MemorySegmentView start={0} end={15} ram={emulator.data_RAM} name="Upper memory"/>
                    <MemorySegmentView start={16} end={32} ram={emulator.data_RAM} name="Variables memory"/>

                    <CPU_View cpu={emulator.cpu}/>
                    <div className="assembly-panel">
                        <div className="h-group gap12 height100pr">
                            <div className="code-panel">
                                <h3>Assembly source</h3>
                                <textarea className="assembly-input" id="assembly-area">
                                    {this.testAssembly}
                                </textarea>
                            </div>
                            <div className="code-panel">
                                <h3>Machine code</h3>
                                <textarea className="assembly-input" id="machine-code-area">

                                </textarea>
                            </div>
                        </div>

                        <button onClick={this.compileAssembly}>Compile</button>
                    </div>
                </div>
            </div>
        )
    }

    testAssembly =
        `// Computes M[2] = max(M[0], M[1])  where M stands for RAM
@0
D=M // D = first number
@1
D=D-M   // D = first number - second number
@OUTPUT_FIRST
D;JGT   // if D>0 (first is greater) goto output_first
@1
D=M // D = second number
@OUTPUT_D
0;JMP   // goto output_d
(OUTPUT_FIRST)
@0
D=M // D = first number
(OUTPUT_D)
@2
M=D // M[2] = D (greatest number)
(INFINITE_LOOP)
@INFINITE_LOOP
0;JMP`;
    compileAssembly(){
        let assembly = document.getElementById("assembly-area")['value'];
        let m1 = Assembler.compile(assembly);
        document.getElementById("machine-code-area")['value'] = m1;
    }

    get machineCode():string{
        return document.getElementById("machine-code-area")['value'];
    }
}