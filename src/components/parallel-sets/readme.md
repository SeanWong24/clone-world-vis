# s-parallel-sets



<!-- Auto Generated Below -->


## Properties

| Property             | Attribute | Description | Type                                   | Default                                                                                                                                                                                          |
| -------------------- | --------- | ----------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `data`               | --        |             | `DataRecord[]`                         | `undefined`                                                                                                                                                                                      |
| `dimensions`         | --        |             | `string[]`                             | `undefined`                                                                                                                                                                                      |
| `ribbonFillCallback` | --        |             | `(dataNode: any, _svg: any) => string` | `(dataNode, _svg) => {     let walker = dataNode;     while (walker.parentNode?.parentNode) {       walker = walker.parentNode;     }     return this.colorScale(walker.valueName \|\| '');   }` |


## Events

| Event         | Description | Type               |
| ------------- | ----------- | ------------------ |
| `ribbonClick` |             | `CustomEvent<any>` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
