import { Component, Host, h, Prop, EventEmitter, Event } from '@stencil/core';
import * as d3 from 'd3';

@Component({
  tag: 's-statistics-plot-group',
  styleUrl: 'statistics-plot-group.css',
  shadow: true
})
export class StatisticsPlotGroup {

  @Prop() title: string;
  @Prop() visType: string;
  @Prop() dataDefinition: {
    yPosition: number,
    dimensionSetName: string,
    data: any[]
  }[];
  @Prop() propertyDictForVis: { [propertyName: string]: any };
  @Event() titleClick: EventEmitter;

  render() {
    return (
      <Host>
        <label
          onClick={() => {this.titleClick.emit(this.title);}}
          style={{cursor: 'pointer'}}
        >{this.title}</label>
        <div id="plot-container">
          {
            this.dataDefinition.map(definition => {
              switch (this.visType) {
                case 'BoxPlot':
                  return <s-box-plot
                    globalMinValue={this.propertyDictForVis['globalMinValue']}
                    globalMaxValue={this.propertyDictForVis['globalMaxValue']}
                    margin={5}
                    data={definition.data}
                    style={{
                      position: 'sticky',
                      top: (+definition.yPosition - 30) + 'px',
                      height: '20px',
                      width: '100%'
                    }}
                  ></s-box-plot>;
                case 'BarPlot':
                  return <s-bar-plot
                    firstSegmentMinValue={this.propertyDictForVis['firstSegmentMinValue']}
                    firstSegmentMaxValue={this.propertyDictForVis['firstSegmentMaxValue']}
                    secondSegmentMaxValue={this.propertyDictForVis['secondSegmentMaxValue']}
                    thirdSegmentMaxValue={this.propertyDictForVis['thirdSegmentMaxValue']}
                    margin={5}
                    datum={d3.mean(definition.data)}
                    style={{
                      position: 'sticky',
                      top: (+definition.yPosition - 30) + 'px',
                      height: '20px',
                      width: '100%'
                    }}
                  ></s-bar-plot>;
              }
            })
          }
        </div>
      </Host>
    );
  }

}
