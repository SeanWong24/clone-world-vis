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

  private tooltipDivElement: HTMLDivElement;
  private mainSvgElement: SVGElement;
  private ribbonGElement: SVGElement;
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
  @Event() ribbonLoaded: EventEmitter;


  componentDidRender() {
    if (this.mainSvgElementDimensions?.width !== this.mainSvgElement.clientWidth || this.mainSvgElementDimensions?.height !== this.mainSvgElement.clientHeight) {
      this.mainSvgElementDimensions = { width: this.mainSvgElement.clientWidth, height: this.mainSvgElement.clientHeight };
    }

    this.ribbonLoaded.emit(this.ribbonGElement);
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
        <div ref={el => this.tooltipDivElement = el} id="tooltip" style={{
          display: 'none',
          position: 'absolute',
          padding: '5px',
          backgroundColor: '#f0f0f0',
          opacity: '.9'
        }} />
        <svg ref={el => this.mainSvgElement = el} id="main-svg" width="100%" height="100%">
          <g id="textures"></g>
          {this.mainSvgElementDimensions && this.renderRibbons(20, depthSegmentMap, dimemsionNameList)}
          {this.mainSvgElementDimensions && this.renderAxes(20, depthSegmentMap, dimemsionNameList)}
        </svg>
      </Host>
    );
  }

  private renderAxes(segmentMargin: number, depthSegmentMap: Map<number, Map<string, DataNode[]>>, dimensionNameList: string[]) {
    const canvasWidth = this.mainSvgElementDimensions.width;
    const dimensionSplitCount = dimensionNameList.length - 1;
    const currentLayerAxisG = [...depthSegmentMap].map(([currentDepth, segmentNodeListMap]) => {
      let textAnchor = 'middle';
      switch (currentDepth) {
        case 1:
          textAnchor = 'start';
          break;
        case dimensionNameList.length:
          textAnchor = 'end';
          break;
      }

      let segments;
      if (currentDepth > 0) {
        const segmentCountForCurrentLayer = segmentNodeListMap.size;
        const positionScaleForCurrentLayer = d3.scaleLinear()
          .domain([0, this.data.length])
          .range([segmentMargin, this.mainSvgElementDimensions.height - segmentCountForCurrentLayer * segmentMargin]);

        let processedSegmentsRecordTotalCount = 0;
        segments = [...segmentNodeListMap].map(([currentSegmentValueName, nodeList], currentSegmentIndex) => {
          const currentSegmentRecordCount = d3.sum(nodeList.map(node => node.dataRecordCount));

          const x1 = (canvasWidth - 2) / dimensionSplitCount * (currentDepth - 1) + 1;
          const y1 = positionScaleForCurrentLayer(processedSegmentsRecordTotalCount) + currentSegmentIndex * segmentMargin;
          const y2 = positionScaleForCurrentLayer(processedSegmentsRecordTotalCount = processedSegmentsRecordTotalCount + currentSegmentRecordCount) + currentSegmentIndex * segmentMargin;

          const line = <line
            x1={x1}
            y1={y1}
            x2={x1}
            y2={y2}
            stroke-width="2"
            stroke="black"
          ></line>;

          const box = <rect
            x={currentDepth < dimensionNameList.length ? x1 : x1 - 20}
            y={y1}
            width={20}
            height={y2 - y1}
            opacity="0"
            fill="blue"
            cursor="pointer"
            onMouseEnter={
              event => {
                (event.target as Element).setAttribute('opacity', '.3');

                this.toggleTooltip(true, event.x + 15, event.y + 15);
                this.tooltipDivElement.innerText = currentSegmentValueName + '\n' + currentSegmentRecordCount + '\n' + (currentSegmentRecordCount / this.data.length * 100).toFixed(2) + '%';
              }
            }
            onMouseLeave={
              event => {
                (event.target as Element).setAttribute('opacity', '0');
                this.toggleTooltip(false);
              }
            }
          >
          </rect>;

          const text = <text
            x={x1}
            y={y2 + 15}
            text-anchor={textAnchor}
            pointer-events="none"
            style={{ userSelct: 'none' }}
          >{currentSegmentValueName}</text>

          return { line, box, text };
        });
      }

      return segments ?
        (<g id={'axis-' + currentDepth} class="axis">
          <text
            x={(canvasWidth - 2) / dimensionSplitCount * (currentDepth - 1) + 1}
            y={15}
            text-anchor={textAnchor}
            pointer-events="none"
            font-weight="bold"
            style={{ userSelct: 'none' }}
          >{dimensionNameList[currentDepth - 1]}</text>
          <g id={'axis-lines-' + currentDepth} class="axis-lines">{segments.map(segment => segment.line)}</g>
          <g id={'axis-boxes-' + currentDepth} class="axis-boxes">{segments.map(segment => segment.box)}</g>
          <g id={'axis-texts-' + currentDepth} class="axis-texts">{segments.map(segment => segment.text)}</g>
        </g>) : {};
    });

    return <g id="axes">{currentLayerAxisG}</g>;
  }

  private renderRibbons(segmentMargin: number, depthSegmentMap: Map<number, Map<string, DataNode[]>>, dimensionNameList: string[]) {
    const currentLayerRiboonsG = [...depthSegmentMap].map(([currentDepth, segmentNodeListMap]) => {
      if (currentDepth > 1) {
        const currentSegmentRibbonsG = [...segmentNodeListMap].map(([, nodeList], currentSegmentIndex) => {
          const currentSegmentRibbonPathes = nodeList.map((currentNode, currentNodeIndex) => {
            const d = this.obatinD(segmentMargin, depthSegmentMap, segmentNodeListMap, currentSegmentIndex, currentDepth, currentNode, currentNodeIndex, dimensionNameList);

            const onMouseEnterCallback = (event: MouseEvent) => {
              const nodeHierarchyList = [currentNode];
              let walker = currentNode;
              while (walker.parentNode) {
                walker = walker.parentNode;
                nodeHierarchyList.unshift(walker);
              }
              d3.select(this.mainSvgElement).select('#ribbons').selectAll('path')
                .filter(n => (nodeHierarchyList.find(d => d === n) as unknown as boolean))
                .attr('opacity', .9);

              this.toggleTooltip(true, event.x + 15, event.y + 15);
              this.tooltipDivElement.innerText = currentNode.parentNode?.valueName + '=>' + currentNode.valueName + ',' + currentNode.dataRecordCount;
            };
            const onMouseLeaveCallback = () => {
              d3.select(this.mainSvgElement).select('#ribbons').selectAll('path').attr('opacity', .5);
              this.toggleTooltip(false);
            }

            const path = <path
              ref={el => d3.select(el).datum(currentNode)}
              d={d}
              fill={this.ribbonFillCallback(currentNode, d3.select(this.mainSvgElement).select('#textures'))}
              opacity=".5"
              cursor="pointer"
              onMouseEnter={onMouseEnterCallback}
              onMouseLeave={onMouseLeaveCallback}
              onClick={() => this.ribbonClick.emit(currentNode)}>
            </path>;
            return path;
          });
          return <g id={'ribbon-layer-' + (currentDepth - 1) + '-to-' + currentDepth + '-segment-' + currentSegmentIndex} class="ribbon-layer-segment">{currentSegmentRibbonPathes}</g>;
        });
        return <g id={'ribbon-layer-' + (currentDepth - 1) + '-to-' + currentDepth} class="ribbon-layer">{currentSegmentRibbonsG}</g>;
      }
    });

    return <g ref={el => this.ribbonGElement = el} id="ribbons">{currentLayerRiboonsG}</g>;
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

    const x1 = (canvasWidth - 2) / dimensionSplitCount * (parentDepth - 1) + 1;
    const y1 = positionScaleForParentLayer(previousSegmentsRecordCountForParentNode + currentSegmentRecordCountBeforeParentNode + silingsBeforeCurrentNodeRecordCount) + segmentLengthOffsetForParentNode;
    const x2 = (canvasWidth - 2) / dimensionSplitCount * (currentDepth - 1) + 1;
    const y2 = positionScaleForCurrentLayer(previousSegmentsRecordCountForCurrentNode + currentSegmentRecordCountBeforeCurrentNode) + segmentLengthOffsetForCurrentNode;
    const x3 = x2;
    const y3 = positionScaleForCurrentLayer(previousSegmentsRecordCountForCurrentNode + currentSegmentRecordCountBeforeCurrentNode + currentNode.dataRecordCount) + segmentLengthOffsetForCurrentNode;
    const x4 = x1;
    const y4 = positionScaleForParentLayer(previousSegmentsRecordCountForParentNode + currentSegmentRecordCountBeforeParentNode + silingsBeforeCurrentNodeRecordCount + currentNode.dataRecordCount) + segmentLengthOffsetForParentNode;

    return `M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} L ${x4} ${y4} Z`;
  }

  private toggleTooltip(isShowing: boolean, displayX?: number, displayY?: number) {
    if (isShowing) {
      this.tooltipDivElement.style.display = 'block';
      this.tooltipDivElement.style.left = displayX + 'px';
      this.tooltipDivElement.style.top = displayY.toFixed() + 'px';
    } else {
      this.tooltipDivElement.style.display = 'none';
      this.tooltipDivElement.innerHTML = '';
    }
  }

}
