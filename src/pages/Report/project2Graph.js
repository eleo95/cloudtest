import { Grid } from "@material-ui/core";
import React, { useState } from "react";
import {
  FlexibleWidthXYPlot,
  XAxis,
  YAxis,
  VerticalBarSeries,
  VerticalGridLines,
  HorizontalGridLines,
  ChartLabel,
  DiscreteColorLegend,
  RadialChart,
} from "react-vis";
const currencyFormat = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
const dataModeler = (fixed, recurrent, years) => {
  let dataset = [];
  let err = false;
  try {
    for (let i = 0; i < years; i++) {
      dataset.push({
        x: i + 1,
        y: recurrent,
      });
    }
    dataset[0].y += fixed;
    err = false;
    return dataset;
  } catch (error) {
    err = true;
    return [];
  }
};
const radialDataModeler = (total, label, amount, color) => {
  let err;
  try {
    const dataItem = {
      label,
      angle: (amount / total) * 100,
      color,
    };
    err = false;
    return dataItem;
  } catch (error) {
    err = true;
    return [];
  }
};
const Project2Graph = ({ fixed, recurrent, years }) => {
  const isHoveringOverLine = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState({});
  let dataset = [];
  let err = false;
  try {
    for (let i = 0; i < years; i++) {
      dataset.push({
        x: i + 1,
        y: recurrent,
      });
    }
    dataset[0].y += fixed;
    err = false;
  } catch (error) {
    err = true;
  }

  if (err) {
    return (
      <div className="emptyPowerCard">
        <span>Loading Error</span>
      </div>
    );
  }
  if (dataset.length === 0) {
    return (
      <div className="emptyPowerCard">
        <span>Loading...</span>
      </div>
    );
  }
  return (
    <FlexibleWidthXYPlot
      height={200}
      margin={{ left: 50, top: 20 }}
      xType="ordinal"
    >
      <HorizontalGridLines />
      <VerticalGridLines />
      <XAxis />
      <YAxis />

      <VerticalBarSeries data={dataset} color="#333333" />
      <ChartLabel
        text="Years"
        className="alt-x-label"
        includeMargin={true}
        xPercent={0.5}
        yPercent={0.78}
      />

      <ChartLabel
        text="Estimated Cost Per Year"
        className="alt-x-label"
        includeMargin={true}
        xPercent={0.46}
        yPercent={-0.16}
      />
    </FlexibleWidthXYPlot>
  );
};

const ProjectClusterGraph = (dataList) => {
  const dataset = dataList.map(({ fixed, recurrent, years }) => {
    return dataModeler(fixed, recurrent, years);
  });
  // if (err) {
  //   return (
  //     <div className="emptyPowerCard">
  //       <span>Loading Error</span>
  //     </div>
  //   );
  // }
  if (dataset.length === 0) {
    return (
      <div className="emptyPowerCard">
        <span>Loading...</span>
      </div>
    );
  }
  return (
    <FlexibleWidthXYPlot
      height={200}
      margin={{ left: 100, top: 50, right: 100, bottom: 50 }}
      xType="ordinal"
    >
      <HorizontalGridLines />
      <VerticalGridLines />
      <XAxis />
      <YAxis tickFormat={(value) => currencyFormat(value)} />
      <DiscreteColorLegend
        style={{ position: "absolute", right: "-8px", top: "10px" }}
        orientation="vertical"
        items={[
          {
            title: "Cloud",
            color: "#AFEEEE",
          },
          {
            title: "On-premise",
            color: "#D8D8D8",
          },
        ]}
      />
      {dataset.map((item, idx) => {
        return (
          <VerticalBarSeries
            cluster={`201${idx}`}
            color={idx > 0 ? "#AFEEEE" : "#D8D8D8"}
            data={item}
          />
        );
      })}
      <ChartLabel
        text="Years"
        className="alt-x-label"
        includeMargin={true}
        xPercent={0.5}
        yPercent={0.46}
      />

      <ChartLabel
        text="Estimated Compute Cost Per Year"
        className="alt-x-label"
        includeMargin={true}
        xPercent={0.46}
        yPercent={-0.43}
      />
    </FlexibleWidthXYPlot>
  );
};

const ProjectRadialGraph = (total, dataList) => {
  const dataset = dataList.map(({ label, amount, color }) => {
    return radialDataModeler(total, label, amount, color);
  });
  // if (err) {
  //   return (
  //     <div className="emptyPowerCard">
  //       <span>Loading Error</span>
  //     </div>
  //   );
  // }
  if (dataset.length === 0) {
    return (
      <div className="emptyPowerCard">
        <span>Loading...</span>
      </div>
    );
  }
  return (
    <RadialChart
      width={250}
      height={250}
      data={dataset}
      colorType="literal"
      // labelsRadiusMultiplier={1.1}
      // labelsStyle={{
      //   fontSize: 12,
      // }}
      // showLabels
    >
      <DiscreteColorLegend
        style={{ position: "absolute", right: "-215px", top: "10px" }}
        orientation="vertical"
        items={dataset.map(({ label, color, angle }) => {
          return {
            title: `${label} ${Math.round(angle)}%`,
            color,
          };
        })}
      />
    </RadialChart>
  );
};

export { Project2Graph, ProjectClusterGraph, ProjectRadialGraph };
