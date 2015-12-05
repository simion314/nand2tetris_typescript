/// <reference path="../../../../typings/react/react-global.d.ts" />

interface CPU_ViewProps{
    cpu:CPU;
}
class CPU_View extends React.Component<CPU_ViewProps, {}>{
  render(){
      let cpu = this.props.cpu;
      let A = cpu.A.toString()+" / "+cpu.A.value;
      let M = cpu.M.toString()+" / "+cpu.M.value;
      let D = cpu.D.toString()+" / "+cpu.D.value;

      return (<div className="cpi_view">
          <div>
              <span>Registers:</span>
              <br />
              <span>A:{A}</span><br />
              <span>M:{M}</span><br />
              <span>D:{D}</span><br />
          </div>
      </div>);
  }
}
