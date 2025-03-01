import {
  changeChildAction,
  changeValueAction,
  CompAction,
  CompActionTypes,
  wrapChildAction,
} from "openblocks-core";
import {
  AxisFormatterComp,
  calcXYConfig,
  EchartsAxisType,
} from "./chartConfigs/cartesianAxisConfig";
import { getPieRadiusAndCenter } from "./chartConfigs/pieChartConfig";
import {
  CharOptionCompType,
  chartChildrenMap,
  ChartCompPropsType,
  ChartSize,
  getDataKeys,
  noDataAxisConfig,
  noDataPieChartConfig,
} from "./chartConstants";
import { chartPropertyView } from "./chartPropertyView";
import { EChartsOption } from "echarts";
import _ from "lodash";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactResizeDetector from "react-resize-detector";
import ReactECharts from "./reactEcharts";
import {
  chartColorPalette,
  childrenToProps,
  depsConfig,
  genRandomKey,
  isNumeric,
  JSONObject,
  JSONValue,
  NameConfig,
  ToViewReturn,
  UICompBuilder,
  withDefault,
  withExposingConfigs,
  withViewFn,
} from "openblocks-sdk";
import { getEchartsLocale, trans } from "i18n/comps";

function transformData(originData: JSONObject[], xAxis: string, seriesColumnNames: string[]) {
  // aggregate data by x-axis
  const transformedData: JSONObject[] = [];
  originData.reduce((prev, cur) => {
    if (cur === null || cur === undefined) {
      return prev;
    }
    const groupValue = cur[xAxis] as string;
    if (!prev[groupValue]) {
      // init as 0
      const initValue: any = {};
      seriesColumnNames.forEach((name) => {
        initValue[name] = 0;
      });
      prev[groupValue] = initValue;
      transformedData.push(prev[groupValue]);
    }
    // remain the x-axis data
    prev[groupValue][xAxis] = groupValue;
    seriesColumnNames.forEach((key) => {
      if (key === xAxis) {
        return;
      } else if (isNumeric(cur[key])) {
        prev[groupValue][key] += Number(cur[key]);
      } else {
        prev[groupValue][key] += 1;
      }
    });
    return prev;
  }, {} as any);
  return transformedData;
}

const notAxisChartSet: Set<CharOptionCompType> = new Set(["pie"] as const);
const echartsConfigOmitChildren = ["hidden", "selectedPoints", "onEvent"] as const;
type EchartsConfigProps = Omit<ChartCompPropsType, typeof echartsConfigOmitChildren[number]>;

function isAxisChart(type: CharOptionCompType) {
  return !notAxisChartSet.has(type);
}

function getSeriesConfig(props: EchartsConfigProps) {
  const visibleSeries = props.series.filter((s) => !s.getView().hide);
  const seriesLength = visibleSeries.length;
  return visibleSeries.map((s, index) => {
    if (isAxisChart(props.chartConfig.type)) {
      let encodeX: string, encodeY: string;
      const horizontalX = props.xAxisDirection === "horizontal";
      let itemStyle = props.chartConfig.itemStyle;
      // FIXME: need refactor... chartConfig returns a function with paramters
      if (props.chartConfig.type === "bar") {
        // barChart's border radius, depend on x-axis direction and stack state
        const borderRadius = horizontalX ? [2, 2, 0, 0] : [0, 2, 2, 0];
        if (props.chartConfig.stack && index === visibleSeries.length - 1) {
          itemStyle = { ...itemStyle, borderRadius: borderRadius };
        } else if (!props.chartConfig.stack) {
          itemStyle = { ...itemStyle, borderRadius: borderRadius };
        }
      }
      if (horizontalX) {
        encodeX = props.xAxisKey;
        encodeY = s.getView().columnName;
      } else {
        encodeX = s.getView().columnName;
        encodeY = props.xAxisKey;
      }
      return {
        name: s.getView().seriesName,
        selectedMode: "single",
        select: {
          itemStyle: {
            borderColor: "#000",
          },
        },
        encode: {
          x: encodeX,
          y: encodeY,
        },
        // each type of chart's config
        ...props.chartConfig,
        itemStyle: itemStyle,
        label: {
          ...props.chartConfig.label,
          ...(!horizontalX && { position: "outside" }),
        },
      };
    } else {
      // pie
      const radiusAndCenter = getPieRadiusAndCenter(seriesLength, index, props.chartConfig);
      return {
        ...props.chartConfig,
        radius: radiusAndCenter.radius,
        center: radiusAndCenter.center,
        name: s.getView().seriesName,
        selectedMode: "single",
        encode: {
          itemName: props.xAxisKey,
          value: s.getView().columnName,
        },
      };
    }
  });
}

// https://echarts.apache.org/en/option.html
function getEchartsConfig(props: EchartsConfigProps, chartSize?: ChartSize): EChartsOption {
  if (props.mode === "json") {
    return props.echartsOption ? props.echartsOption : {};
  }
  // axisChart
  const axisChart = isAxisChart(props.chartConfig.type);
  const gridPos = {
    left: 20,
    right: props.legendConfig.left === "right" ? "10%" : 20,
    top: 50,
    bottom: 35,
  };
  let config: EChartsOption = {
    color: chartColorPalette,
    title: { text: props.title, left: "center" },
    backgroundColor: "#fff",
    tooltip: {
      confine: true,
      trigger: axisChart ? "axis" : "item",
    },
    legend: props.legendConfig,
    grid: {
      ...gridPos,
      containLabel: true,
    },
  };
  if (props.data.length <= 0) {
    // no data
    return {
      ...config,
      ...(axisChart ? noDataAxisConfig : noDataPieChartConfig),
    };
  }
  const yAxisConfig = props.yConfig();
  const seriesColumnNames = props.series
    .filter((s) => !s.getView().hide)
    .map((s) => s.getView().columnName);
  // y-axis is category and time, data doesn't need to aggregate
  const transformedData =
    yAxisConfig.type === "category" || yAxisConfig.type === "time"
      ? props.data
      : transformData(props.data, props.xAxisKey, seriesColumnNames);
  config = {
    ...config,
    dataset: [
      {
        source: transformedData,
        sourceHeader: false,
      },
    ],
    series: getSeriesConfig(props),
  };
  if (axisChart) {
    // pure chart's size except the margin around
    let chartRealSize;
    if (chartSize) {
      const rightSize =
        typeof gridPos.right === "number"
          ? gridPos.right
          : (chartSize.w * parseFloat(gridPos.right)) / 100.0;
      chartRealSize = {
        // actually it's self-adaptive with the x-axis label on the left, not that accurate but work
        w: chartSize.w - gridPos.left - rightSize,
        // also self-adaptive on the bottom
        h: chartSize.h - gridPos.top - gridPos.bottom,
        right: rightSize,
      };
    }
    const finalXyConfig = calcXYConfig(
      props.xConfig,
      yAxisConfig,
      props.xAxisDirection,
      transformedData.map((d) => d[props.xAxisKey]),
      chartRealSize
    );
    config = {
      ...config,
      // @ts-ignore
      xAxis: finalXyConfig.xConfig,
      // @ts-ignore
      yAxis: finalXyConfig.yConfig,
    };
  }
  // log.log("Echarts transformedData and config", transformedData, config);
  return config;
}

function getSelectedPoints(param: any, option: any) {
  const series = option.series;
  const dataSource = _.isArray(option.dataset) && option.dataset[0]?.source;
  if (series && dataSource) {
    return param.selected.flatMap((selectInfo: any) => {
      const seriesInfo = series[selectInfo.seriesIndex];
      if (!seriesInfo || !seriesInfo.encode) {
        return [];
      }
      return selectInfo.dataIndex.map((index: any) => {
        const commonResult = {
          seriesName: seriesInfo.name,
        };
        if (seriesInfo.encode.itemName && seriesInfo.encode.value) {
          return {
            ...commonResult,
            itemName: dataSource[index][seriesInfo.encode.itemName],
            value: dataSource[index][seriesInfo.encode.value],
          };
        } else {
          return {
            ...commonResult,
            x: dataSource[index][seriesInfo.encode.x],
            y: dataSource[index][seriesInfo.encode.y],
          };
        }
      });
    });
  }
  return [];
}

let ChartTmpComp = (function () {
  return new UICompBuilder(chartChildrenMap, () => null)
    .setPropertyViewFn(chartPropertyView)
    .build();
})();

ChartTmpComp = withViewFn(ChartTmpComp, (comp) => {
  const echartsCompRef = useRef<ReactECharts | null>();
  const [chartSize, setChartSize] = useState<ChartSize>();
  const firstResize = useRef(true);
  const onEvent = comp.children.onEvent.getView();
  useEffect(() => {
    // bind events
    const echartsCompInstance = echartsCompRef?.current?.getEchartsInstance();
    if (!echartsCompInstance) {
      return _.noop;
    }
    echartsCompInstance.on("selectchanged", (param: any) => {
      const option: any = echartsCompInstance.getOption();
      //log.log("chart select change", param);
      if (param.fromAction === "select") {
        comp.dispatch(changeChildAction("selectedPoints", getSelectedPoints(param, option)));
        onEvent("select");
      } else if (param.fromAction === "unselect") {
        comp.dispatch(changeChildAction("selectedPoints", getSelectedPoints(param, option)));
        onEvent("unselect");
      }
    });
    // unbind
    return () => echartsCompInstance.off("selectchanged");
  }, [onEvent]);

  const echartsConfigChildren = _.omit(comp.children, echartsConfigOmitChildren);
  const option = useMemo(() => {
    return getEchartsConfig(
      childrenToProps(echartsConfigChildren) as ToViewReturn<typeof echartsConfigChildren>,
      chartSize
    );
  }, [chartSize, ...Object.values(echartsConfigChildren)]);

  return (
    <ReactResizeDetector
      onResize={(w, h) => {
        if (w && h) {
          setChartSize({ w: w, h: h });
        }
        if (!firstResize.current) {
          // ignore the first resize, which will impact the loading animation
          echartsCompRef.current?.getEchartsInstance().resize();
        } else {
          firstResize.current = false;
        }
      }}
    >
      <ReactECharts
        ref={(e) => (echartsCompRef.current = e)}
        style={{ height: "100%" }}
        notMerge
        lazyUpdate
        opts={{ locale: getEchartsLocale() }}
        option={option}
      />
    </ReactResizeDetector>
  );
});

function getYAxisFormatContextValue(
  data: Array<JSONObject>,
  yAxisType: EchartsAxisType,
  yAxisName?: string
) {
  const dataSample = yAxisName && data.length > 0 && data[0][yAxisName];
  let contextValue = dataSample;
  if (yAxisType === "time") {
    // to timestamp
    const time =
      typeof dataSample === "number" || typeof dataSample === "string"
        ? new Date(dataSample).getTime()
        : null;
    if (time) contextValue = time;
  }
  return contextValue;
}

ChartTmpComp = class extends ChartTmpComp {
  private lastYAxisFormatContextVal?: JSONValue;

  override reduce(action: CompAction): this {
    const comp = super.reduce(action);
    if (action.type === CompActionTypes.UPDATE_NODES_V2) {
      const newData = comp.children.data.getView();
      // data changes
      if (comp.children.data !== this.children.data) {
        setTimeout(() => {
          // update x-axis value
          const keys = getDataKeys(newData);
          if (keys.length > 0 && !keys.includes(comp.children.xAxisKey.getView())) {
            comp.children.xAxisKey.dispatch(changeValueAction(keys[0] || ""));
          }
          // pass to child series comp
          comp.children.series.dispatchDataChanged(newData);
        }, 0);
      }
      // the context value of axis format
      const sampleSeries = comp.children.series.getView().find((s) => !s.getView().hide);
      const contextValue = getYAxisFormatContextValue(
        newData,
        comp.children.yConfig.children.yAxisType.getView(),
        sampleSeries?.children.columnName.getView()
      );
      if (contextValue !== comp.lastYAxisFormatContextVal) {
        comp.lastYAxisFormatContextVal = contextValue;
        return comp.setChild(
          "yConfig",
          comp.children.yConfig.reduce(
            wrapChildAction(
              "formatter",
              AxisFormatterComp.changeContextDataAction({ value: contextValue })
            )
          )
        );
      }
    }
    return comp;
  }

  override autoHeight(): boolean {
    return false;
  }
};

const ChartComp = withExposingConfigs(ChartTmpComp, [
  depsConfig({
    name: "selectedPoints",
    desc: trans("chart.selectedPointsDesc"),
    depKeys: ["selectedPoints"],
    func: (input) => {
      return input.selectedPoints;
    },
  }),
  depsConfig({
    name: "data",
    desc: trans("chart.dataDesc"),
    depKeys: ["data", "mode"],
    func: (input) => {
      if (input.mode === "ui") {
        return input.data;
      } else {
        // no data in json mode
        return [];
      }
    },
  }),
  new NameConfig("title", trans("chart.titleDesc")),
]);

export const ChartCompWithDefault = withDefault(ChartComp, {
  xAxisKey: "date",
  series: [
    {
      dataIndex: genRandomKey(),
      seriesName: trans("chart.spending"),
      columnName: "spending",
    },
    {
      dataIndex: genRandomKey(),
      seriesName: trans("chart.budget"),
      columnName: "budget",
    },
  ],
});
