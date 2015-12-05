/// <reference path="../../../../typings/react/react-global.d.ts" />

interface MemorySectionProps {
    ram: RAM;
    start: number;
    end: number;
    name:String;
}

class MemorySegmentView extends React.Component<MemorySectionProps, {}> {
    render() {
        let elements = [];
        for (var i = this.props.start; i < this.props.end; i++) {
            let value = this.props.ram.run(null, false, new Word(i));
            elements.push(<span>{value.toString() } / {value.value}<br /></span>);
        }
        return <div className="memory-segment-view">
            <h3>{this.props.name}</h3>
            {elements}
        </div>
    }
    static test(id) {
        let ram = new RAM(32);
        ReactDOM.render(
            <MemorySegmentView start= {0} end={15} ram={ram} name="Upper"/>,
            document.getElementById(id)
        );
    }
}
