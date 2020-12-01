export const checkUserIsAdmin = (currentUser) => {
  if (!currentUser || !Array.isArray(currentUser.userRoles)) return false;
  const { userRoles } = currentUser;
  if (userRoles.includes("admin")) return true;

  return false;
};

export const sumWattbydays = (powervalues) => {
  var result = [];

  // const pValuesArray =
  //   source === "firebase"
  //     ? timestamp2days(powervalues)
  //     : zabbixTimestamp2days(powervalues);
  const pValuesArray = timestamp2days(powervalues);
  // : zabbixTimestamp2days(powervalues);

  Array.from(new Set(pValuesArray.map((x, idx, arr) => x.timestamp))).forEach(
    (x) => {
      const readingCount = pValuesArray.filter((y) => y.timestamp === x).length;
      result.push(
        pValuesArray
          .filter((y) => y.timestamp === x)
          .reduce((output, item) => {
            let val = output[x] === undefined ? 0 : output[x];
            output[x] = item.watts + val;
            return output;
          }, {})
      );
      result.map((item) => {
        item["count"] = readingCount;
        return item;
      });
      return result;
    }
  );
  return result;
};

export const timestamp2days = (powervalues) => {
  const pValuesArray = powervalues.map((item) => {
    // const timestamp = doc.data().timestamp.toDateString().split(" ");
    const timestamp = new Date(item.timestamp.seconds * 1000)
      .toDateString()
      .split(" ");
    // console.log("skdnaldklask");
    // console.log(timestamp);
    // console.log(powervalues);

    return {
      watts: item.watts,
      timestamp: `${timestamp[0] + " " + timestamp[2]}`,
      // timestamp: doc.get("timestamp"),
    };
  });
  return pValuesArray;
};

export const zabbixTimestamp2days = (powervalues) => {
  const pValuesArray = powervalues.map((item) => {
    // const timestamp = doc.data().timestamp.toDateString().split(" ");
    const timestamp = new Date(item.clock * 1000).toDateString().split(" ");
    // console.log("skdnaldklask");
    // console.log(timestamp);
    // console.log(powervalues);

    return {
      watts: item.value,
      timestamp: `${timestamp[0] + " " + timestamp[2]}`,
      // timestamp: doc.get("timestamp"),
    };
  });
  return pValuesArray;
};
