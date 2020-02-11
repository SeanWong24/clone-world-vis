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

    const depthSegmentMap = new Map<number, Map<string, DataNode[]>>();
    rootNode.dfs(node => {
      let segmentNodeListMap = depthSegmentMap.get(node.depth);
      if (!segmentNodeListMap) {
        segmentNodeListMap = new Map();
        depthSegmentMap.set(node.depth, segmentNodeListMap);
      }

      const nodeList = segmentNodeListMap.get(node.valueName);
      if (nodeList) {
        let indexToInsert = nodeList.findIndex(n => node.compare(n) < 1);
        if (indexToInsert < 0) {
          indexToInsert = nodeList.length;
        }
        nodeList.splice(indexToInsert, 0, node);
      } else {
        segmentNodeListMap.set(node.valueName, [node]);
      }
    });

    return (
      <Host>
        <svg ref={el => this.mainSvgElement = el} id="main-svg" width="100%" height="100%">
          <g id="textures"></g>
          <g id="axes"></g>
          {this.mainSvgElementDimensions && this.renderRibbons(depthSegmentMap, dimemsionNameList)}
        </svg>
      </Host>
    );
  }

  private renderRibbons(depthSegmentMap: Map<number, Map<string, DataNode[]>>, dimensionNameList: string[]) {
    const segmentMargin = 20;

    const currentLayerRiboonsG = [...depthSegmentMap].map(([currentDepth, segmentNodeListMap]) => {
      if (currentDepth > 1) {
        const currentSegmentRibbonsG = [...segmentNodeListMap].map(([, nodeList], currentSegmentIndex) => {
          const currentSegmentRibbonPathes = nodeList.map((currentNode, currentNodeIndex) => {
            const d = this.obatinD(segmentMargin, depthSegmentMap, segmentNodeListMap, currentSegmentIndex, currentDepth, currentNode, currentNodeIndex, dimensionNameList);

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
          });
          return <g id={'ribbon-layer-' + (currentDepth - 1) + '-to-' + currentDepth + '-segment-' + currentSegmentIndex} class="ribbon-layer-segment">{currentSegmentRibbonPathes}</g>;
        });
        return <g id={'ribbon-layer-' + (currentDepth - 1) + '-to-' + currentDepth} class="ribbon-layer">{currentSegmentRibbonsG}</g>;
      }
    });

    return <g id="ribbons">{currentLayerRiboonsG}</g>;
  }

  private obatinD(segmentMargin: number, depthSegmentMap: Map<number, Map<string, DataNode[]>>, segmentNodeListMap: Map<string, DataNode[]>, currentSegmentIndex: number, currentDepth: number, currentNode: DataNode, currentNodeIndex: number, dimensionNameList: string[]) {
    const parentNode = currentNode.parentNode;
    let parentNodeSegmentIndex;
    let parentNodeIndex;
    const segmentNodeListMapForParentNode = [...depthSegmentMap.values()].find(
      segmentMap => [...segmentMap.values()].find(
        (nodeList, segmentIndex) => {
          parentNodeIndex = nodeList.findIndex(node => node === parentNode);
          const result = parentNodeIndex >= 0;
          if (result) {
            parentNodeSegmentIndex = segmentIndex;
          }
          return result;
        }
      )
    );

    const segmentCountForParentLayer = segmentNodeListMapForParentNode.size;
    const positionScaleForParentLayer = d3.scaleLinear()
      .domain([0, this.data.length])
      .range([segmentMargin, this.mainSvgElementDimensions.height - segmentCountForParentLayer * segmentMargin]);

    const segmentCountForCurrentLayer = segmentNodeListMap.size;
    const positionScaleForCurrentLayer = d3.scaleLinear()
      .domain([0, this.data.length])
      .range([segmentMargin, this.mainSvgElementDimensions.height - segmentCountForCurrentLayer * segmentMargin]);

    const canvasWidth = this.mainSvgElementDimensions.width;
    const dimensionSplitCount = dimensionNameList.length - 1;
    const parentDepth = currentDepth - 1;

    const segmentLengthOffsetForParentNode = parentNodeSegmentIndex * segmentMargin;
    const previousSegmentsRecordCountForParentNode = d3.sum(
      [...segmentNodeListMapForParentNode.values()].slice(0, parentNodeSegmentIndex).map(
        nodeList => d3.sum(
          nodeList.map(
            node => node.dataRecordCount
          )
        )
      )
    );
    const currentSegmentRecordCountBeforeParentNode = d3.sum(
      [...segmentNodeListMapForParentNode.values()][parentNodeSegmentIndex]
        .slice(0, parentNodeIndex)
        .map(node => node.dataRecordCount)
    );
    const parentNodeChildList = [...parentNode.childMap.values()];
    const currentNodeIndexInParentChildList = parentNodeChildList.findIndex(node => node === currentNode);
    const silingsBeforeCurrentNodeRecordCount = d3.sum(
      parentNodeChildList.slice(0, currentNodeIndexInParentChildList).map(node => node.dataRecordCount)
    );

    const segmentLengthOffsetForCurrentNode = currentSegmentIndex * segmentMargin;
    const previousSegmentsRecordCountForCurrentNode = d3.sum(
      [...segmentNodeListMap.values()].slice(0, currentSegmentIndex).map(
        nodeList => d3.sum(
          nodeList.map(
            node => node.dataRecordCount
          )
        )
      )
    );
    const currentSegmentRecordCountBeforeCurrentNode = d3.sum(
      [...segmentNodeListMap.values()][currentSegmentIndex]
        .slice(0, currentNodeIndex)
        .map(node => node.dataRecordCount)
    );

    const x1 = canvasWidth / dimensionSplitCount * (parentDepth - 1);
    const y1 = positionScaleForParentLayer(previousSegmentsRecordCountForParentNode + currentSegmentRecordCountBeforeParentNode + silingsBeforeCurrentNodeRecordCount) + segmentLengthOffsetForParentNode;
    const x2 = canvasWidth / dimensionSplitCount * (currentDepth - 1);
    const y2 = positionScaleForCurrentLayer(previousSegmentsRecordCountForCurrentNode + currentSegmentRecordCountBeforeCurrentNode) + segmentLengthOffsetForCurrentNode;
    const x3 = x2;
    const y3 = positionScaleForCurrentLayer(previousSegmentsRecordCountForCurrentNode + currentSegmentRecordCountBeforeCurrentNode + currentNode.dataRecordCount) + segmentLengthOffsetForCurrentNode;
    const x4 = x1;
    const y4 = y1 + y3 - y2;

    return `M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} L ${x4} ${y4} Z`;
  }

}
