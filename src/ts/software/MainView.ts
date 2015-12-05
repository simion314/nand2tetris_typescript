/// <reference path="../../../typings/react/react-global.d.ts" />

class MainViewModel {
    view:any;//React.Component<EmulatorViewProps, {}>;
    emulator:Emulator = new Emulator();

    startStop(machine_code:string) {
        let emulator = this.emulator;
        let em_state = emulator.state;
        if(em_state==EmulatorState.RUNNING){
            emulator.stop();
        }
        else{
            emulator.start(machine_code);
        }
    }

    refreshView() {
        this.view.forceUpdate();
    }

    nextStep() {
        this.emulator.nextStep();
        this.refreshView();
    }
    private node : HTMLElement;
    setup(node_id:string) {
        this.node = document.getElementById(node_id);
        let emulatorViewProps = {
            emulator: this.emulator
        };
        this.view = ReactDOM.render(
            React.createElement(EmulatorView, emulatorViewProps),
            this.node
        );
        this.refreshView['thisObj'] = this;
        this.nextStep['thisObj'] = this;
        this.startStop['thisObj'] = this;
        this.refreshView['thisObj'] = this;
        this.view.RefreshEv.on(this.refreshView);
        this.view.NextEv.on(this.nextStep);
        this.view.StartStopEv.on(this.startStop);
    }
}