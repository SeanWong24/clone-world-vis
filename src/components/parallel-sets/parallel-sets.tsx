import { Component, Host, h, Prop, State, Event, EventEmitter } from '@stencil/core';
import { DataRecord } from './data-record';
import DataNode from './data-node';
import * as d3 from 'd3';

@Component({
  tag: 's-parallel-sets',
  styleUrl: 'parallel-sets.css',
  shadow: true
})
export class ParallelSets {

  private mainSvgElement: SVGElement;
  private colorScale = d3.scaleOrdinal(d3.schemeAccent);

  @State() private mainSvgElementDimensions: { width: number, height: number };

  @Prop() data: DataRecord[];
  @Prop() dimensions: string[];
  @Prop() ribbonFillCallback = (dataNode, _svg) => {
    let walker = dataNode;
    while (walker.parentNode?.parentNode) {
      walker = walker.parentNode;
    }
    return this.colorScale(walker.valueName || '');
  };
  @Event() ribbonClick: EventEmitter;


  componentDidRender() {
    if (this.mainSvgElementDimensions?.width !== this.mainSvgElement.clientWidth || this.mainSvgElementDimensions?.height !== this.mainSvgElement.clientHeight) {
      this.mainSvgElementDimensions = { width: this.mainSvgElement.clientWidth, height: this.mainSvgElement.clientHeight };
    }
  }

  render() {
    const dimemsionNameList = (this.dimensions?.length > 0) ? this.dimensions : Object.keys(this.data[0]);
    const rootNode = new DataNode(undefined, undefined, undefined, this.data).initialize(dimemsionNameList);

    const depthNodeListMap = new Map<number, DataNode[]>();
    rootNode.dfs(node => {
      const nodeList = depthNodeListMap.get(node.depth);

      if (nodeList) {
        nodeList.push(node);
      } else {
        depthNodeListMap.set(node.depth, [node]);
      }
    });

    depthNodeListMap.forEach(value => value.sort((a, b) => a.compare(b)));

    return (
      <Host>
        <svg ref={el => this.mainSvgElement = el} id="main-svg" width="100%" height="100%">
          <g id="textures"></g>
          <g id="axes"></g>
          {this.mainSvgElementDimensions && this.renderRibbons(depthNodeListMap, dimemsionNameList)}
        </svg>
      </Host>
    );
  }

  private renderRibbons(depthNodeListMap: Map<number, DataNode[]>, dimensionNameList: string[]) {
    const currentLayerRibbonGElements = [...depthNodeListMap].map(([depth, nodeList]) => {
      if (depth > 1) {
        const currentLayerRibbonPathes = nodeList.map((currentNode, currentNodeIndex) => {
          const d = this.obatinD(depthNodeListMap, dimensionNameList, depth, currentNode, currentNodeIndex);

          const onMouseEnterCallback = () => {
            const nodeHierarchyList = [currentNode];
            let walker = currentNode;
            while (walker.parentNode) {
              walker = walker.parentNode;
              nodeHierarchyList.unshift(walker);
            }
            d3.select(this.mainSvgElement).select('#ribbons').selectAll('path')
              .filter(n => (nodeHierarchyList.find(d => d === n) as unknown as boolean))
              .attr('opacity', .9);
          };
          const onMouseOutCallback = () => d3.select(this.mainSvgElement).select('#ribbons').selectAll('path').attr('opacity', .5);

          const path = <path
            ref={el => d3.select(el).datum(currentNode)}
            d={d}
            stroke="black"
            stroke-width="1"
            fill={this.ribbonFillCallback(currentNode, d3.select(this.mainSvgElement).select('#textures'))}
            opacity=".5"
            cursor="pointer"
            onMouseEnter={onMouseEnterCallback}
            onMouseOut={onMouseOutCallback}
            onClick={() => this.ribbonClick.emit(currentNode)}>
            <title>{currentNode.parentNode?.valueName + '=>' + currentNode.valueName + ',' + currentNode.dataRecordCount}</title>
          </path>;
          return path;
        })
        return <g id={'ribbon-layer-' + (depth - 1) + '-' + depth} class="ribbon-layer">{currentLayerRibbonPathes}</g>;
      }
    });

    return <g id="ribbons">{currentLayerRibbonGElements}</g>;
  }

  private obatinD(depthNodeListMap: Map<number, DataNode[]>, dimensionNameList: string[], depth: number, currentNode: DataNode, currentNodeIndex: number) {
    const positionScale = d3.scaleLinear()
      .domain([0, this.data.length])
      .range([10, this.mainSvgElementDimensions.height - 10]);

    const canvasWidth = this.mainSvgElement?.clientWidth;
    const dimensionSplitCount = dimensionNameList.length - 1;
    const parentDepth = depth - 1;
    const parentIndex = (depthNodeListMap.get(parentDepth) || []).findIndex(d => d === currentNode.parentNode);
    const currentIndexInParentChildMap = [...currentNode.parentNode?.childMap.entries() || []].findIndex(d => d[1] === currentNode);

    const previousLayerNodeList = depthNodeListMap.get(parentDepth);
    const previousLayerNodeListBeforeParentNode = previousLayerNodeList?.slice(0, parentIndex);
    const previousLayerNodeRecordCountBeforeParentNode = d3.sum(previousLayerNodeListBeforeParentNode?.map(node => node.dataRecordCount) || [0]);

    const parentNodeChildMapEntryList = [...currentNode.parentNode?.childMap.entries() || []];
    const siblingListBeforeCurrentNode = parentNodeChildMapEntryList.slice(0, currentIndexInParentChildMap);
    const siblingRecordCountBeforeCurrentNode = d3.sum(siblingListBeforeCurrentNode.map(d => d[1].dataRecordCount));

    const currentLayerNodeList = depthNodeListMap.get(depth);
    const currentLayerNodeListBeforeCurrentNode = currentLayerNodeList?.slice(0, currentNodeIndex);
    const cuurenLayerNodeRecordCountBeforeCurrentNode = d3.sum(currentLayerNodeListBeforeCurrentNode?.map(d => d.dataRecordCount) || [0]);

    const currentLayerNodeListTillCurrentNode = currentLayerNodeList?.slice(0, currentNodeIndex + 1);
    const cuurenLayerNodeRecordCountTillCurrentNode = d3.sum(currentLayerNodeListTillCurrentNode?.map(d => d.dataRecordCount) || [0]);

    const x1 = canvasWidth / dimensionSplitCount * (parentDepth - 1);
    const y1 = positionScale(
      previousLayerNodeRecordCountBeforeParentNode +
      siblingRecordCountBeforeCurrentNode
    );
    const x2 = canvasWidth / dimensionSplitCount * (depth - 1);
    const y2 = positionScale(cuurenLayerNodeRecordCountBeforeCurrentNode);
    const x3 = x2;
    const y3 = positionScale(cuurenLayerNodeRecordCountTillCurrentNode);
    const x4 = x1;
    const y4 = y1 + y3 - y2;

    return `M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} L ${x4} ${y4} Z`;
  }

}
