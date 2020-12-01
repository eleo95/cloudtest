import React from "react";
import {
  FlexibleWidthXYPlot,
  XAxis,
  YAxis,
  VerticalBarSeries,
  AreaSeries,
  VerticalGridLines,
  HorizontalGridLines,
  ChartLabel,
  MarkSeries,
  Hint,
} from "react-vis";
import { sumWattbydays, timestamp2days, dynamicSort } from "./../../Utils";
const powerDataModeler = (power_array) => {
  let dataset = [];
  let err = false;
  try {
    dataset = sumWattbydays(power_array).map((entry, id, arr) => {
      const [day, power] = Object.entries(entry)[0];
      const [_, count] = Object.entries(entry)[1];
      console.log(`powwer countttt ${count}`);
      return {
        // x: getActualDate(entry.timestamp.seconds),
        x: day,
        y: power / 1000, //kwh,
      };
    });
    err = false;
    return dataset;
  } catch (error) {
    err = true;
    return [];
  }
};
const power2graph = (power_array) => {
  // console.log("start");
  // console.log(power_array);
  // console.log(sumWattbydays(power_array));
  // console.log("end");

  const dataset = powerDataModeler(power_array);

  console.log(dataset);
  if (dataset.length === 0) {
    return (
      <div className="emptyPowerCard">
        <span>No Data</span>
      </div>
    );
  }
  return (
    <FlexibleWidthXYPlot
      height={200}
      xType="ordinal"
      margin={{ left: 75, top: 20 }}
    >
      <HorizontalGridLines />
      <VerticalGridLines />
      <XAxis />
      <YAxis
        tickFormat={(value) =>
          value >= 1
            ? `${parseFloat(value).toFixed(1)} KW`
            : `${parseFloat(value).toFixed(1) * 1000} W`
        }
      />

      <VerticalBarSeries data={dataset} color="#333333" />
      <ChartLabel
        text="Date"
        className="alt-x-label"
        includeMargin={true}
        xPercent={0.5}
        yPercent={0.78}
      />
    </FlexibleWidthXYPlot>
  );
};

// const getActualDate = (timestamp) => {
//   return new Date(timestamp * 1000).toLocaleString().split(",")[0];
// };

const powerDay2graph = (power_array) => {
  // console.log("start");
  // console.log(power_array);
  // console.log("end");

  let dataset = [];
  let err = false;
  let lastcurrentTime = new Date();
  try {
    dataset = power_array
      .filter((item) => {
        const currentDate = new Date(
          item.timestamp.seconds * 1000
        ).toLocaleDateString();
        // console.log(new Date().toLocaleDateString());
        // console.log(currentDate);
        return currentDate === new Date().toLocaleDateString();
      })
      .map((entry) => {
        const currentTime = new Date(
          entry.timestamp.seconds * 1000
        ).toLocaleTimeString();
        // const [day, power] = Object.entries(entry)[0];

        console.log(entry.timestamp);
        const hourDiff =
          Math.abs(
            new Date(entry.timestamp.seconds * 1000).getTime() -
              lastcurrentTime.getTime()
          ) / 3600000;

        // if (Math.round(hourDiff) === 2) {
        //   lastcurrentTime = new Date(entry.timestamp.seconds * 1000);
        return {
          // x: getActualDate(entry.timestamp.seconds),
          x: currentTime,
          y: entry.watts / 1000.0,
        };
        // } else {
        //   return {};
        // }
      });
    // .filter((item) => Object.keys(item).length !== 0);
    console.log(dataset);
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
        <span>No Data</span>
      </div>
    );
  }
  return (
    <FlexibleWidthXYPlot
      height={200}
      xType="ordinal"
      margin={{ left: 75, top: 20 }}
    >
      <MarkSeries data={[{ x: 0, y: 0 }]} style={{ display: "none" }} />
      <HorizontalGridLines />
      <VerticalGridLines />
      <XAxis />

      <YAxis
        tickFormat={(value) => `${parseFloat(value).toFixed(2) * 1000} W`}
      />
      <AreaSeries data={dataset.slice(-4)} color="#333333" fill="#333333" />

      <ChartLabel
        text="Time"
        className="alt-x-label"
        includeMargin={true}
        xPercent={0.5}
        yPercent={0.78}
      />
    </FlexibleWidthXYPlot>
  );
};

const getActualDate = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleString();
};

export { powerDay2graph, power2graph, powerDataModeler };
