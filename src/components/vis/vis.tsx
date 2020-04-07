import { Component, Host, h, Prop, State } from '@stencil/core';
import { DataRecord } from './data-record';
import { VisConfig, DimensionDefinition } from './vis-config';
import * as d3 from 'd3';

@Component({
  tag: 's-vis',
  styleUrl: 'vis.css',
  shadow: true
})
export class Vis {

  private statisticsPlotGroupContainer: HTMLDivElement;

  @Prop() data: DataRecord[];
  @Prop() config: VisConfig = {} as any;
  @State() processed: DataRecord[];

  render() {
    const parallelSetsData = this.data.map(() => ({}) as DataRecord);
    this.config.dimensions
      .forEach(dimensionDefinition => {
        dimensionDefinition = Object.assign(new DimensionDefinition, dimensionDefinition);
        dimensionDefinition.processData(this.data, parallelSetsData);
      });
    this.processed = parallelSetsData;

    return (
      <Host>
        <s-parallel-sets
          data={this.processed}
          dimensions={
            this.config.dimensions
              .filter(dimensionDefinition => dimensionDefinition.visType === DimensionDefinition.VisType.ParallelSets)
              .map(dimensionDefinition => dimensionDefinition.name)
          }
          onAxisLoaded={this.onParallelSetsAxisLoadedHandler}
        ></s-parallel-sets>
        <div ref={el => this.statisticsPlotGroupContainer = el}></div>
      </Host>
    );
  }

  private onParallelSetsAxisLoadedHandler = (event: CustomEvent<SVGElement>) => {
    this.statisticsPlotGroupContainer.innerHTML = '';
    const lines = event.detail?.querySelectorAll('g.axis:last-of-type > .axis-lines line');
    if (lines && this.config.dimensions) {
      for (const dimensionDefinition of this.config.dimensions) {
        if (dimensionDefinition.visType !== DimensionDefinition.VisType.ParallelSets) {
          const data = [...lines as any]
            .map(line => (
              {
                yPosition: line.getBoundingClientRect().y,
                dimensionName: line.__data__.dimensionName,
                dataRecordList: line.__data__.dataNodeList.flatMap(node => node.dataRecordList) as DataRecord[]
              }
            ));

          const minValue = d3.min(data.map(d =>
            d3.min(d.dataRecordList.map(record =>
              +record[dimensionDefinition.name]
            ))
          ));
          const maxValue = d3.max(data.map(d =>
            d3.max(d.dataRecordList.map(record =>
              +record[dimensionDefinition.name]
            ))
          ));
          switch (dimensionDefinition.visType) {
            case DimensionDefinition.VisType.BoxPlot:
              const statisticsPlotGroupElement = document.createElement('s-statistics-plot-group');
              statisticsPlotGroupElement.title = dimensionDefinition.name;
              statisticsPlotGroupElement.visType = dimensionDefinition.visType;
              statisticsPlotGroupElement.dataDefinition = data.map(d => ({
                yPosition: d.yPosition,
                data: d.dataRecordList.map(d => d[dimensionDefinition.name])
              }));
              statisticsPlotGroupElement.propertyDictForVis = { globalMinValue: minValue, globalMaxValue: maxValue };
              this.statisticsPlotGroupContainer.append(statisticsPlotGroupElement);
              break;
            case DimensionDefinition.VisType.BarPlot:
              break;
          }
        }
      }
    }
  }

}
