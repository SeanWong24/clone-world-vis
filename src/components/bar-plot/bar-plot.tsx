import { Component, Host, h, State, Prop } from '@stencil/core';
import * as d3 from 'd3';

@Component({
  tag: 's-bar-plot',
  styleUrl: 'bar-plot.css',
  shadow: true
})
export class BarPlot {

  private mainSvgElement: SVGElement;

  @State() private mainSvgElementDimensions: { width: number, height: number };

  @Prop() datum: number;
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

    let xScale: d3.ScaleLinear<number, number>;
    if (this.mainSvgElementDimensions && this.globalMinValue !== undefined && this.globalMaxValue !== undefined) {
      xScale = d3.scaleLinear()
        .domain([this.globalMinValue, this.globalMaxValue])
        .range([margin, this.mainSvgElementDimensions.width - margin]);
    }

    return (
      <Host>
        <svg ref={el => this.mainSvgElement = el} id="main-svg" width="100%" height="100%">
          {xScale &&
            <rect
              x="0"
              y={margin}
              width={xScale(this.datum)}
              height={this.mainSvgElementDimensions.height - margin}>
              <title>{this.datum}</title>
            </rect>
          }
        </svg>
      </Host>
    );
  }

}
