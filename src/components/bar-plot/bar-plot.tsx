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
  @Prop() firstSegmentMinValue: number;
  @Prop() firstSegmentMaxValue: number;
  @Prop() secondSegmentMaxValue: number;
  @Prop() thirdSegmentMaxValue: number;
  @Prop() margin: number;

  componentDidRender() {
    if (this.mainSvgElementDimensions?.width !== this.mainSvgElement.clientWidth || this.mainSvgElementDimensions?.height !== this.mainSvgElement.clientHeight) {
      this.mainSvgElementDimensions = { width: this.mainSvgElement.clientWidth, height: this.mainSvgElement.clientHeight };
    }
  }

  render() {
    const margin = this.margin || 10;

    let firstSegmentScale: d3.ScaleLinear<number, number>;
    let secondSegmentScale: d3.ScaleLinear<number, number>;
    let thirdSegmentScale: d3.ScaleLinear<number, number>;
    if (this.mainSvgElementDimensions && this.firstSegmentMinValue !== undefined && this.thirdSegmentMaxValue !== undefined) {
      firstSegmentScale = d3.scaleLinear()
        .domain([this.firstSegmentMinValue, this.firstSegmentMaxValue])
        .range([0, this.mainSvgElementDimensions.width - margin])
        .clamp(true);
      secondSegmentScale = d3.scaleLinear()
        .domain([this.firstSegmentMaxValue, this.secondSegmentMaxValue])
        .range([0, this.mainSvgElementDimensions.width - margin])
        .clamp(true);
      thirdSegmentScale = d3.scaleLinear()
        .domain([this.secondSegmentMaxValue, this.thirdSegmentMaxValue])
        .range([0, this.mainSvgElementDimensions.width - margin])
        .clamp(true);
    }

    return (
      <Host>
        <svg ref={el => this.mainSvgElement = el} id="main-svg" width="100%" height="100%">
          {firstSegmentScale &&
            <g>
              <rect
                x="0"
                y={margin}
                width={firstSegmentScale(this.datum)}
                height={this.mainSvgElementDimensions.height - margin}
                fill="green">
                <title>{this.datum}</title>
              </rect>
              <rect
                x="0"
                y={margin + 3}
                width={secondSegmentScale(this.datum)}
                height={this.mainSvgElementDimensions.height - margin - 3 * 2}
                fill="blue">
                <title>{this.datum}</title>
              </rect>
              <rect
                x="0"
                y={margin + 3 + 2}
                width={thirdSegmentScale(this.datum)}
                height={this.mainSvgElementDimensions.height - margin - 3 * 2 - 2 * 2}
                fill="red">
                <title>{this.datum}</title>
              </rect>
            </g>
          }
        </svg>
      </Host>
    );
  }

}
