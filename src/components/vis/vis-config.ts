import { DataRecord } from "./data-record";
import * as d3 from 'd3';

export class VisConfig {
    dimensions: DimensionDefinition[];
}

export class DimensionDefinition {
    static VisType = {
        ParallelSets: 'ParallelSets',
        BoxPlot: 'BoxPlot',
        BarPlot: 'BarPlot'
    };

    static DataProcessFunction = {
        NoChange: 'NoChange',
        Quantile: 'Quantile'
    }

    name: string;
    visType: string;
    dataProcessFunction: string;

    processData(data: DataRecord[], result: DataRecord[]) {
        switch (this.dataProcessFunction) {
            case DimensionDefinition.DataProcessFunction.NoChange:
                this.dataProcessNoChange(data, result);
                break;
            case DimensionDefinition.DataProcessFunction.Quantile:
                this.dataProcessQuantile(data, result);
                break;
        }
    }

    private dataProcessNoChange(data: DataRecord[], result: DataRecord[]) {
        data.forEach(
            (record, i) => result[i][this.name] = record[this.name]
        );
    }

    private dataProcessQuantile(data: DataRecord[], result: DataRecord[]) {
        const scale = d3.scaleQuantile()
            .domain(data?.map(record => +record[this.name]))
            .range([.25, .5, .75, 1]);

        data.forEach(
            (record, i) => result[i][this.name] = scale(+record[this.name])
        );
    }
}