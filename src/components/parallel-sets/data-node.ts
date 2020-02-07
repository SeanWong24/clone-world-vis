import { DataRecord } from "./data-record";
import { compareStrings } from "../../utils/utils";

export default class DataNode {
    depth: number;
    childMap: Map<string, DataNode>;
    dataRecordList: DataRecord[];

    get dataRecordCount() {
        return this.dataRecordList.length;
    }

    constructor(
        public parentNode: DataNode | undefined,
        public dimensionName: string | undefined,
        public valueName: string | undefined,
        dataRecordList?: DataRecord[]
    ) {
        this.childMap = new Map();
        this.dataRecordList = dataRecordList || [];
        this.depth = +(parentNode?.depth.toString() || -1) + 1;
    }

    initialize(dimensionNameList: string[]) {
        const CURRENT_DIMENSION_NAME = dimensionNameList[0];
        if (CURRENT_DIMENSION_NAME) {
            this.dataRecordList.forEach(dataRecord => {
                const CURRENT_VALUE = dataRecord[CURRENT_DIMENSION_NAME].toString();
                const TARGET_NODE = this.childMap.get(CURRENT_VALUE);
                if (TARGET_NODE) {
                    TARGET_NODE.addDataRecord(dataRecord);
                } else {
                    this.childMap.set(CURRENT_VALUE, new DataNode(this, CURRENT_DIMENSION_NAME, CURRENT_VALUE).addDataRecord(dataRecord));
                }
            });
            this.childMap = new Map([...this.childMap.entries()].sort((a, b) => compareStrings(a[0], b[0])));

            const TARGET_MAP_VALUE_LIST = Array.from(this.childMap.values());
            TARGET_MAP_VALUE_LIST.forEach(childNode => {
                childNode.initialize(dimensionNameList.slice(1));
            });
        }

        return this;
    }

    addDataRecord(dataRecord: DataRecord) {
        this.dataRecordList.push(dataRecord);
        return this;
    }

    dfs(handler: (node: DataNode) => void) {
        const STACK = [];
        const EXPLORED_SET = new Set();
        STACK.push(this);

        EXPLORED_SET.add(this);

        while (STACK.length > 0) {
            const CURRENT_NODE = STACK.pop();
            if (CURRENT_NODE) {
                handler(CURRENT_NODE);
            }

            const CHILD_NODE_LIST = [...CURRENT_NODE?.childMap.values() || []];
            CHILD_NODE_LIST.filter(node => !EXPLORED_SET.has(node))
                .forEach(node => {
                    STACK.push(node);
                    EXPLORED_SET.add(node);
                });
        }
    }

    compare(anotherNode: DataNode | undefined): number {
        if (this.depth === anotherNode?.depth) {
            const VALUE_HISTORY_THIS = [];
            const VALUE_HISTORY_ANOTHER = [];

            let walker = this as DataNode | undefined;
            while (walker) {
                VALUE_HISTORY_THIS.push(walker.valueName);
                walker = walker.parentNode;
            }
            walker = anotherNode;
            while (walker) {
                VALUE_HISTORY_ANOTHER.push(walker.valueName);
                walker = walker.parentNode;
            }

            let valueComparingResult = compareStrings(VALUE_HISTORY_THIS.shift() || '', VALUE_HISTORY_ANOTHER.shift() || '');
            if (valueComparingResult !== 0) {
                return valueComparingResult;
            }

            while (VALUE_HISTORY_THIS.length > 0) {
                valueComparingResult = compareStrings(VALUE_HISTORY_THIS.pop() || '', VALUE_HISTORY_ANOTHER.pop() || '');
                if (valueComparingResult !== 0) {
                    return valueComparingResult;
                }
            }
            return 0;
        } else {
            return Number.NaN;
        }
    }
}