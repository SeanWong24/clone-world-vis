import { Component, Host, h, Prop } from '@stencil/core';

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
    data: any[]
  }[];
  @Prop() propertyDictForVis: { [propertyName: string]: any };

  render() {
    return (
      <Host>
        <label>{this.title}</label>
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
              }
            })
          }
        </div>
      </Host>
    );
  }

}
