/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */


import { HTMLStencilElement, JSXBase } from '@stencil/core/internal';
import {
  DataRecord,
} from './components/vis/data-record';
import {
  VisConfig,
} from './components/vis/vis-config';

export namespace Components {
  interface SBarPlot {
    'datum': number;
    'firstSegmentMaxValue': number;
    'firstSegmentMinValue': number;
    'margin': number;
    'secondSegmentMaxValue': number;
    'thirdSegmentMaxValue': number;
  }
  interface SBoxPlot {
    'data': number[];
    'globalMaxValue': number;
    'globalMinValue': number;
    'margin': number;
  }
  interface SParallelSets {
    'data': DataRecord[];
    'dimensions': string[];
    'ribbonFillCallback': (dataNode: any, _svg: any) => string;
  }
  interface SStatisticsPlotGroup {
    'dataDefinition': {
      yPosition: number,
      data: any[]
    }[];
    'propertyDictForVis': { [propertyName: string]: any };
    'title': string;
    'visType': string;
  }
  interface SVis {
    'config': VisConfig;
    'data': DataRecord[];
  }
}

declare global {


  interface HTMLSBarPlotElement extends Components.SBarPlot, HTMLStencilElement {}
  var HTMLSBarPlotElement: {
    prototype: HTMLSBarPlotElement;
    new (): HTMLSBarPlotElement;
  };

  interface HTMLSBoxPlotElement extends Components.SBoxPlot, HTMLStencilElement {}
  var HTMLSBoxPlotElement: {
    prototype: HTMLSBoxPlotElement;
    new (): HTMLSBoxPlotElement;
  };

  interface HTMLSParallelSetsElement extends Components.SParallelSets, HTMLStencilElement {}
  var HTMLSParallelSetsElement: {
    prototype: HTMLSParallelSetsElement;
    new (): HTMLSParallelSetsElement;
  };

  interface HTMLSStatisticsPlotGroupElement extends Components.SStatisticsPlotGroup, HTMLStencilElement {}
  var HTMLSStatisticsPlotGroupElement: {
    prototype: HTMLSStatisticsPlotGroupElement;
    new (): HTMLSStatisticsPlotGroupElement;
  };

  interface HTMLSVisElement extends Components.SVis, HTMLStencilElement {}
  var HTMLSVisElement: {
    prototype: HTMLSVisElement;
    new (): HTMLSVisElement;
  };
  interface HTMLElementTagNameMap {
    's-bar-plot': HTMLSBarPlotElement;
    's-box-plot': HTMLSBoxPlotElement;
    's-parallel-sets': HTMLSParallelSetsElement;
    's-statistics-plot-group': HTMLSStatisticsPlotGroupElement;
    's-vis': HTMLSVisElement;
  }
}

declare namespace LocalJSX {
  interface SBarPlot {
    'datum'?: number;
    'firstSegmentMaxValue'?: number;
    'firstSegmentMinValue'?: number;
    'margin'?: number;
    'secondSegmentMaxValue'?: number;
    'thirdSegmentMaxValue'?: number;
  }
  interface SBoxPlot {
    'data'?: number[];
    'globalMaxValue'?: number;
    'globalMinValue'?: number;
    'margin'?: number;
  }
  interface SParallelSets {
    'data'?: DataRecord[];
    'dimensions'?: string[];
    'onAxisLoaded'?: (event: CustomEvent<any>) => void;
    'onRibbonClick'?: (event: CustomEvent<any>) => void;
    'onRibbonLoaded'?: (event: CustomEvent<any>) => void;
    'ribbonFillCallback'?: (dataNode: any, _svg: any) => string;
  }
  interface SStatisticsPlotGroup {
    'dataDefinition'?: {
      yPosition: number,
      data: any[]
    }[];
    'propertyDictForVis'?: { [propertyName: string]: any };
    'title'?: string;
    'visType'?: string;
  }
  interface SVis {
    'config'?: VisConfig;
    'data'?: DataRecord[];
  }

  interface IntrinsicElements {
    's-bar-plot': SBarPlot;
    's-box-plot': SBoxPlot;
    's-parallel-sets': SParallelSets;
    's-statistics-plot-group': SStatisticsPlotGroup;
    's-vis': SVis;
  }
}

export { LocalJSX as JSX };


declare module "@stencil/core" {
  export namespace JSX {
    interface IntrinsicElements {
      's-bar-plot': LocalJSX.SBarPlot & JSXBase.HTMLAttributes<HTMLSBarPlotElement>;
      's-box-plot': LocalJSX.SBoxPlot & JSXBase.HTMLAttributes<HTMLSBoxPlotElement>;
      's-parallel-sets': LocalJSX.SParallelSets & JSXBase.HTMLAttributes<HTMLSParallelSetsElement>;
      's-statistics-plot-group': LocalJSX.SStatisticsPlotGroup & JSXBase.HTMLAttributes<HTMLSStatisticsPlotGroupElement>;
      's-vis': LocalJSX.SVis & JSXBase.HTMLAttributes<HTMLSVisElement>;
    }
  }
}


