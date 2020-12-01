import { firestore } from "./../../firebase/utils";

export const handleAddProject = (project) => {
  return new Promise((resolve, reject) => {
    firestore
      .collection("projects")
      .doc()
      .set(project)
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const handleAddAppliances = (id, appliances) => {
  return new Promise((resolve, reject) => {
    firestore
      .collection("projects")
      .doc(id)
      .update({
        equipos: appliances,
      })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const handleAddDatabases = (id, dbs) => {
  return new Promise((resolve, reject) => {
    firestore
      .collection("projects")
      .doc(id)
      .update({
        databases: dbs,
      })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const handleAddStorage = (id, storage) => {
  return new Promise((resolve, reject) => {
    firestore
      .collection("projects")
      .doc(id)
      .update({
        storage: storage,
      })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const handleAddVMs = (id, vmlist) => {
  return new Promise((resolve, reject) => {
    firestore
      .collection("projects")
      .doc(id)
      .update({
        vms: vmlist,
      })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const handleFetchProjects = () => {
  return new Promise((resolve, reject) => {
    firestore
      .collection("projects")
      .orderBy("projectName")
      .get()
      .then((snapshot) => {
        const projectsArray = snapshot.docs.map((doc) => {
          console.log(doc.data());
          return {
            ...doc.data(),
            documentID: doc.id,
          };
        });
        resolve(projectsArray);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const handleDeleteProject = (documentID) => {
  return new Promise((resolve, reject) => {
    firestore
      .collection("projects")
      .doc(documentID)
      .delete()
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
};
// export const handleFetchPowerValues = (documentID) => {
//   return new Promise((resolve, reject) => {
//     firestore
//       .collection("projects")
//       .doc(documentID)
//       .collection("power_values")
//       .orderBy("timestamp")
//       .get()
//       .then((snapshot) => {
//         const pValuesArray = snapshot.docs.map((doc) => {
//           console.log(doc.data());
//           // const timestamp = doc.data().timestamp.toDateString().split(" ");
//           const timestamp = new Date(doc.get("timestamp") * 1000)
//             .toDateString()
//             .split(" ");
//           return {
//             watts: doc.get("watts"),
//             // timestamp: `${timestamp[0] + " " + timestamp[2]}`,
//             timestamp: doc.get("timestamp"),
//           };
//         });
//         resolve(pValuesArray);
//       })
//       .catch((err) => {
//         reject(err);
//       });
//   });
// };

export const handleFetchPowerValues = (documentID) => {
  return new Promise((resolve, reject) => {
    let finalArr = [];
    const resp = firestore
      .collection("projects")
      .doc(documentID)
      .collection("power")
      .get()
      .then((snapshot) => {
        const pValuesArray = snapshot.docs.map((doc) => {
          finalArr.push({
            id: doc.id,
            desc: doc.get("desc"),
          });
        });
        console.log("aaaaaaaa");
        console.log(finalArr);
        return finalArr;
      })
      .then(() => {
        const powerval = finalArr.map((item) => {
          let response = firestore
            .collection("projects")
            .doc(documentID)
            .collection("power")
            .doc(item.id)
            .collection("power_values")
            .orderBy("timestamp")
            .get()

            .then((snapshot) => {
              const finalArray = snapshot.docs.map((docu) => {
                return {
                  watts: docu.get("watts"),
                  timestamp: docu.get("timestamp"),
                };
                // console.log("ddddddd");
                // console.log(docu.data());
              });
              // console.log("fffffff");
              // console.log(finalArray);
              return finalArray;
            });
          response.then((res) => {
            return (item["values"] = res);
          });

          // console.log("rrrrrrr");
          // console.log(item);
          return item;
        });
        // resolve(powerval);
        // return response;
        console.log("yaaaaaa");
        console.log(powerval);

        resolve(powerval);

        return powerval.map();
      })

      .catch((err) => {
        reject(err);
      });
  });
};

export const handleFetchProject = (id) => {
  return new Promise((resolve, reject) => {
    firestore
      .collection("projects")
      .doc(id)
      .get()
      .then((snapshot) => {
        if (snapshot.exists) {
          resolve(snapshot.data());
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const handleUpdateProjectProp = (id, prop, value) => {
  console.log("frooooom fire");
  console.log(prop);
  console.log(value);
  console.log({ prop: value });
  return new Promise((resolve, reject) => {
    firestore
      .collection("projects")
      .doc(id)
      .update({
        [prop]: value,
      })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

export const handleAddSensor = (projectID, params) => {
  console.log("!!!!!!!!1");
  console.log(params);
  console.log(projectID);
  console.log("!!!!!!!!1");
  return new Promise((resolve, reject) => {
    firestore
      .collection("projects")
      .doc(projectID)
      .collection("power")
      .doc()
      .set(params)
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const handleDeleteSensor = (projectID, sensorID) => {
  return new Promise((resolve, reject) => {
    firestore
      .collection("projects")
      .doc(projectID)
      .collection("power")
      .doc(sensorID)
      .delete()
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
};
