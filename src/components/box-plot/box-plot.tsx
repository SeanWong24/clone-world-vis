import { Component, Host, h, Prop, State } from '@stencil/core';
import * as d3 from 'd3';

@Component({
  tag: 's-box-plot',
  styleUrl: 'box-plot.css',
  shadow: true
})
export class BoxPlot {

  private mainSvgElement: SVGElement;

  @State() private mainSvgElementDimensions: { width: number, height: number };

  @Prop() data: number[];
  @Prop() globalMinValue: number;
  @Prop() globalMaxValue: number;
  @Prop() margin: number;

  componentDidRender() {
    if (this.mainSvgElementDimensions?.width !== this.mainSvgElement.clientWidth || this.mainSvgElementDimensions?.height !== this.mainSvgElement.clientHeight) {
      this.mainSvgElementDimensions = { width: this.mainSvgElement.clientWidth, height: this.mainSvgElement.clientHeight };
    }
  }

  render() {
    const margin = this.margin || 10;

    const sortedData = this.data?.sort(d3.ascending) || [];
    const q1 = d3.quantile(sortedData, .25);
    const median = d3.quantile(sortedData, .5);
    const q3 = d3.quantile(sortedData, .75);
    const interQuantileRange = q3 - q1;
    const minValue = Math.max(...sortedData) //q1 - 1.5 * interQuantileRange, d3.min(sortedData));
    const maxValue = Math.min(...sortedData) //q1 + 1.5 * interQuantileRange, d3.max(sortedData));

    const scaleMinValue = (this.globalMinValue === undefined) ? minValue : this.globalMinValue;
    const scaleMaxValue = (this.globalMaxValue === undefined) ? maxValue : this.globalMaxValue;
    let xScale: d3.ScaleLinear<number, number>;
    if (this.mainSvgElementDimensions) {
      xScale = d3.scaleLinear()
        .domain([scaleMinValue, scaleMaxValue])
        .range([margin, this.mainSvgElementDimensions.width - margin]);
    }

    return (
      <Host>
        <svg ref={el => this.mainSvgElement = el} id="main-svg" width="100%" height="100%">
          {xScale &&
            <g>
              <line
                id="min-line"
                x1={xScale(minValue)}
                y1={margin}
                x2={xScale(minValue)}
                y2={this.mainSvgElementDimensions.height - margin}
                stroke="black" />
              <line
                id="min-q1-line"
                x1={xScale(minValue)}
                y1={this.mainSvgElementDimensions.height / 2}
                x2={xScale(q1)}
                y2={this.mainSvgElementDimensions.height / 2}
                stroke="black" />
              <rect
                id="box"
                x={xScale(q1)}
                y={margin}
                width={xScale(q3) - xScale(q1)}
                height={this.mainSvgElementDimensions.height - margin * 2}
                stroke="black"
                fill="azure" />
              <line
                id="median-line"
                x1={xScale(median)}
                y1={margin}
                x2={xScale(median)}
                y2={this.mainSvgElementDimensions.height - margin}
                stroke="black" />
              <line
                id="q1-max-line"
                x1={xScale(q3)}
                y1={this.mainSvgElementDimensions.height / 2}
                x2={xScale(maxValue)}
                y2={this.mainSvgElementDimensions.height / 2}
                stroke="black" />
              <line
                id="max-line"
                x1={xScale(maxValue)}
                y1={margin}
                x2={xScale(maxValue)}
                y2={this.mainSvgElementDimensions.height - margin}
                stroke="black" />
              <title>{
                'min: ' + minValue + '\n' +
                '25%: ' + q1 + '\n' +
                'median: ' + median + '\n' +
                '75%: ' + q3 + '\n' +
                'max: ' + maxValue
              }</title>
            </g>
          }
        </svg>
      </Host >
    );
  }

}
