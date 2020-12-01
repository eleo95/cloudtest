import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setProjectId,
  updateAppliancesStart,
  updateDatabasesStart,
  updateStorageStart,
  updateVMsStart,
  fetchPowerValuesStart,
  setProjectReport,
  updateProjectPropStart,
  deleteSensorStart,
  addSensorStart,
  setZabbixToken,
} from "./../../redux/Project/project.actions";
import { useHistory } from "react-router-dom";
import { powerDay2graph, power2graph, powerDataModeler } from "./power2Graph";
import Modal from "./../../components/Modal";
import FormInput from "./../../components/forms/FormInput";
import Button from "./../../components/forms/Button";
import FormSelect from "./../../components/forms/FormSelect";
import { useToasts } from "react-toast-notifications";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Switch from "@material-ui/core/Switch";

import {
  TableCell,
  TableRow,
  TableHead,
  Table,
  TableContainer,
  TableBody,
  Paper,
  Grid,
  Radio,
  RadioGroup,
  FormLabel,
  FormControl,
  FormControlLabel,
  Icon,
  List,
  ListItem,
  ListItemText,
} from "@material-ui/core/";
import Slider from "@material-ui/core/Slider";

import "./styles.scss";
import { handleUpdateProjectProp } from "../../redux/Project/project.helpers";
import { updateProyectProp } from "../../redux/Project/project.sagas";
import { storage } from "firebase";

const mapState = ({ projectData }) => ({
  currentProjectId: projectData.currentProject,
  currentPowerValues: projectData.currentPowerValues,
  zabbixToken: projectData.zabbixToken,
  // project: projectData.projects.filter(
  //   (pro) => pro.documentID === projectData.currentProject
  // )[0],
  project: projectData.projects?.find(
    (pro) => pro.documentID === projectData.currentProject
  ),
});

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      style={{ minHeight: "43.5rem" }}
      {...other}
    >
      {value === index && (
        <Grid container spacing={2}>
          {children}
        </Grid>
      )}
    </div>
  );
}

const ProjectDetail = (props) => {
  const dispatch = useDispatch();
  const {
    currentProjectId,
    project,
    currentPowerValues,
    zabbixToken,
  } = useSelector(mapState);
  const history = useHistory();
  const [hideModal, setHideModal] = useState(true);
  const [hideZabbixModal, setHideZabbixModal] = useState(true);
  const [hideZabbixEnergyModal, setHideZabbixEnergyModal] = useState(true);
  const [isEnergyFromZabbix, setIsEnergyFromZabbix] = useState(false);
  const [sensorDescription, setSensorDescription] = useState("");
  const [listaEquipos, setListaEquipos] = useState([]);
  const [listaDBs, setListaDBs] = useState([]);
  const [listaStorage, setListaStorage] = useState([]);
  const [listaVMs, setListaVMs] = useState([]);
  const [tabValue, setTabValue] = React.useState(0);
  const { addToast } = useToasts();
  const [serverPrices, setServerPrices] = useState([]);
  const [proYear, setProYear] = useState(0);
  const [proBw, setProBw] = useState(0);
  const [proBwPrice, setProBwPrice] = useState(0);

  const [proCompany, setProCompany] = useState("");
  const [proContact, setProContact] = useState("");

  const [proTeamHours, setProTeamHours] = useState(0);
  const [proTeamPaymnt, setProTeamPaymnt] = useState(0);

  const [energyList, setEnergyList] = useState([]);
  const [teamList, setTeamList] = useState([]);
  const [zabbixGroups, setZabbixGroups] = useState([]);

  const [zabbixDomain, setZabbixDomain] = useState("192.168.1.57:5005");
  const [zabbixUser, setZabbixUser] = useState("Admin");
  const [zabbixPass, setZabbixPass] = useState("");
  const [monthlyPower, setmonthlyPower] = useState(0);

  useEffect(() => {
    fetchServerPrices();
    dispatch(setZabbixToken(""));
  }, []);

  useEffect(() => {
    setEnergyList(currentPowerValues);
  }, [currentPowerValues]);


  useEffect(() => {
    console.log("trigered!!!!!");
    let {
      equipos,
      databases,
      storage,
      documentID,
      vms,
      years,
      netbw,
      netprice,
      projectCompany,
      projectContact,
      itTeamHours,
      itTeamPay,
      projectTeam,
    } = project || {
      equipos: [],
      databases: [],
      storage: [],
      projectTeam: [],
      documentID: "",
    };
    setListaEquipos(equipos);
    setListaDBs(databases);
    setListaStorage(storage);
    setListaVMs(vms);
    dispatch(fetchPowerValuesStart(documentID));
    setProYear(years);
    setProBw(netbw);
    setProBwPrice(netprice);
    setProCompany(projectCompany);
    setProContact(projectContact);
    setProTeamHours(itTeamHours);
    setProTeamPaymnt(itTeamPay);
    setTeamList(projectTeam || []);
  }, [project ? null : project]);

  const toggleModal = () => setHideModal(!hideModal);
  const toggleZabbixModal = () => setHideZabbixModal(!hideZabbixModal);

  const configModal = {
    hideModal,
    toggleModal,
  };

  const resetForm = () => {
    setHideModal(true);
    setSensorDescription("");
  };

  const fetchServerPrices = async () => {
    dispatch(fetchPowerValuesStart(documentID));
    // const url = "http://localhost:5000/precios";
    const url =
      "https://banzaicloud.com/cloudinfo/api/v1/providers/azure/services/compute/regions/eastus/products";
    const response = await fetch(url);
    const data = await response.json();
    try {
      await setServerPrices(data.products);
      // console.log(data.products);
    } catch (error) {
      console.log("err: fetchin values");
    }
  };

  const fetchZabbixToken = async () => {
    const url = `http://${zabbixDomain}/api_jsonrpc.php`;
    const headers = {
      "Content-Type": "application/json; charset=utf-8",
    };
    const body = JSON.stringify({
      jsonrpc: "2.0",
      method: "user.login",
      params: {
        user: zabbixUser,
        password: zabbixPass,
      },
      id: 1,
    });
    await fetch(url, { method: "POST", headers, body })
      .then((response) => {
        if (response.status >= 400 && response.status < 600) {
          throw new Error("Bad response from server");
        }
        return response.json();
      })
      .then((returnedResponse) => {
        // Your response to manipulate
        dispatch(setZabbixToken(returnedResponse.result));
        addToast("Conexión a Zabbix Exitosa!", {
          appearance: "success",
          autoDismiss: true,
        });
        return fetchZabbixGroups(returnedResponse.result);
      })
      .catch((error) => {
        // Your error is here!
        addToast(`${error}`, {
          appearance: "error",
          autoDismiss: true,
        });
        console.log(error);
      });
  };

  const fetchZabbixGroups = async (token) => {
    const url = `http://${zabbixDomain}/api_jsonrpc.php`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "hostgroup.get",
        id: 1,
        auth: token,
        params: {},
      }),
    });
    const data = await response.json();
    try {
      await setZabbixGroups(data.result);
    } catch (error) {
      console.log("err: fetchin values");
    }
  };

  const fetchZabbixHosts = async (groupid, setListaX) => {
    const url = `http://${zabbixDomain}/api_jsonrpc.php`;
    console.log(`zabbix group ${groupid} clicked!!!`);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "host.get",
        auth: zabbixToken,
        params: {
          output: ["hosts"],
          groupids: [groupid],
          selectItems: [
            "name",
            "lastvalue",
            "units",
            "itemid",
            "lastclock",
            "value_type",
            "itemid",
          ],
        },
        id: 1,
      }),
    });
    const data = await response.json();
    try {
      // const zabbixDevices = await setZabbixGroups(data.result);
      console.log("jhdjhfjkhdskfds");
      console.log(data);

      await setListaX(
        data.result.map((elem) => {
          const cpu_val = elem.items.find(
            (item) => item.name === "CPU utilization"
          )?.lastvalue;
          const ram_val = elem.items.find(
            (item) => item.name === "Total memory"
          )?.lastvalue;
          const cores_val = elem.items.find(
            (item) =>
              item.name === "Number of CPUs" || item.name === "Number of cores"
          )?.lastvalue;
          const opsystem_val = elem.items
            .find(
              (item) =>
                item.name === "System description" ||
                item.name === "Operating system"
            )
            ?.lastvalue.split(" ")[0]
            .toLowerCase();
          const env_val = elem.items
            .find((item) => item.name === "Host name of Zabbix agent running")
            ?.lastvalue.toLowerCase()
            .includes("vm");
          console.log(cpu_val);
          console.log(ram_val);
          console.log(cores_val);

          return tabValue === 1
            ? {
                os: opsystem_val,
                cpu: parseInt(cores_val),
                // cores: cores_val ?? 0,
                ram: parseInt(`${ram_val / 10 ** 9}`), //bytes to gb
                virtual: "",
                enviroment: env_val ? "vm" : "phy",
                class: "",
                price: 0,
                est_cost: 0,
                year: 2014,
                cpu_useage: parseFloat(cpu_val).toFixed(2),
                cloud_version: {},
              }
            : {
                type: "",
                enviroment: env_val ? "vm" : "phy",
                os: opsystem_val,
                ram: parseInt(`${ram_val / 10 ** 9}`), //bytes to gb
                // cores: 0,
                cpu: parseInt(cores_val),
                license: "",
                year: 2014,
                est_cost: 0,
                cpu_useage: parseFloat(cpu_val).toFixed(2),
                cloud_version: {},
              };
        })
      );

      // console.log(data.products);
    } catch (error) {
      console.log("err: fetchin values");
      console.log(error);
    }
  };

  const fetchZabbixEnergyHosts = (groupid, setListaX) => {
    const url = `http://${zabbixDomain}/api_jsonrpc.php`;
    console.log(`zabbix group ${groupid} clicked!!!`);

    fetch(url, {
      method: "POST",
      headers: {
        // "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "host.get",
        auth: zabbixToken,
        params: {
          output: ["hosts"],
          groupids: [groupid],
          selectItems: [
            "name",
            "lastvalue",
            "units",
            "itemid",
            "lastclock",
            "value_type",
            "itemid",
            "description",
          ],
        },
        id: 1,
      }),
    })
      .then((response) => {
        if (response.status >= 400 && response.status < 600) {
          throw new Error("Bad response from server");
        }
        return response.json();
      })
      .then(async (data) => {
        console.log("near promise");
        console.log(data);
        const zabbixenergylist = await Promise.all(
          data.result.map((e) => {
            let itemInfo = new Map();
            const element = e.items.find((item) => {
              return (
                item.name === "system-watts"
                // || item.name === "Memory utilization"
              );
            });
            console.log(element);

            itemInfo.set("id", element?.itemid);
            itemInfo.set("desc", element?.description);

            return fetch(url, {
              method: "POST",
              headers: {
                // "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json; charset=utf-8",
              },
              body: JSON.stringify({
                jsonrpc: "2.0",
                method: "history.get",
                auth: zabbixToken,
                params: {
                  output: "extend",
                  history: 0,
                  itemids: element?.itemid,
                  sortfield: "clock",
                  sortorder: "ASC",
                  limit: 100,
                },
                id: 1,
              }),
            })
              .then((response) => {
                if (response.status >= 400 && response.status < 600) {
                  throw new Error("Bad response from server");
                }

                return response.json();
              })
              .then((data) => {
                return {
                  id: itemInfo.get("id"),
                  desc: itemInfo.get("desc"),
                  values: data.result.map((item) => {
                    return {
                      watts: parseFloat(
                        item.lastvalue ? item.lastvalue : item.value
                      ),
                      timestamp: {
                        seconds: parseInt(
                          item.lastclock ? item.lastclock : item.clock
                        ),
                      },
                    };
                  }),
                };
              });
          })
        );
        console.log("xxxxxxx");
        console.log(zabbixenergylist);
        await setEnergyList(zabbixenergylist);
        await setmonthlyPower(
          energyList.reduce((acc, item) => {
            return (
              acc +
              powerDataModeler(item.values).reduce(
                (acc, elem) => acc + elem.y,
                0
              )
            );
          }, 0)
        );
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    dispatch(addSensorStart(documentID, { desc: sensorDescription }));

    setEnergyList([
      {
        id: "pending...",
        desc: sensorDescription,
        values: [],
      },
      ...energyList,
    ]);
    addToast("Guardado Exitosamente!", {
      appearance: "success",
      autoDismiss: true,
    });

    resetForm();
  };
  const handleEditSpecs = (value, index) => {
    const propsArray = value.split(",");
    const newlist = listaEquipos.map((equ, idx) => {
      if (idx == index) {
        // equ["class"] = propsArray[0];
        // equ["price"] = parseFloat(propsArray[1]);
        equ["cpu"] = parseInt(propsArray[0]);
        equ["ram"] = parseInt(propsArray[1]);
      }

      return equ;
    });
    setListaEquipos(newlist);
    console.log(newlist);
  };

  const handleEditSpecsDB = (value, index) => {
    const propsArray = value.split(",");
    const newlist = listaDBs.map((equ, idx) => {
      if (idx == index) {
        // equ["class"] = propsArray[0];
        // equ["price"] = parseFloat(propsArray[1]);
        equ["cpu"] = parseInt(propsArray[0]);
        equ["ram"] = parseInt(propsArray[1]);
      }

      return equ;
    });
    setListaDBs(newlist);
    console.log(newlist);
  };

  const handleEditServers = (value, index, key) => {
    const newlist = listaEquipos.map((equ, idx) => {
      if (idx == index) {
        equ[key] = value;
      }

      return equ;
    });
    setListaEquipos(newlist);
  };

  const handleEditTeam = (value, index, key) => {
    const newlist = teamList.map((equ, idx) => {
      if (idx == index) {
        equ[key] = value;
      }

      return equ;
    });
    setTeamList(newlist);
    console.log(newlist);
  };

  const handleEditDBs = (value, index, key) => {
    // listaEquipos[index][key] = value;
    const newlist = listaDBs.map((item, idx) => {
      if (idx == index) {
        item[key] = value;
      }

      return item;
    });
    setListaDBs(newlist);
    console.log(newlist);
  };

  const handleEditStorage = (value, index, key) => {
    // listaEquipos[index][key] = value;
    const newlist = listaStorage.map((item, idx) => {
      if (idx == index) {
        item[key] = value;
      }

      return item;
    });
    setListaStorage(newlist);
    console.log(newlist);
  };

  const handleUpdateForm = () => {
    console.log("update form");
    console.log(listaEquipos);

    // const payload = [...listaEquipos];
    dispatch(updateAppliancesStart(documentID, listaEquipos));
    addToast("Guardado Exitosamente!", {
      appearance: "success",
      autoDismiss: true,
    });
  };
  const handleUpdateFormVM = () => {
    console.log("update form");
    console.log(listaVMs);

    // const payload = [...listaEquipos];
    dispatch(updateVMsStart(documentID, listaVMs));
  };
  const handleUpdateFormDB = () => {
    console.log("update form");
    console.log(listaDBs);

    // const payload = [...listaEquipos];
    dispatch(updateDatabasesStart(documentID, listaDBs));
    addToast("Guardado Exitosamente!", {
      appearance: "success",
      autoDismiss: true,
    });
  };

  const handleUpdateProjectParams = (params) => {
    params.forEach((element) => {
      dispatch(
        updateProjectPropStart(documentID, element.field, element.value)
      );
    });
    addToast("Guardado Exitosamente!", {
      appearance: "success",
      autoDismiss: true,
    });
  };

  const handleUpdateFormStorage = () => {
    console.log("update form");
    console.log(listaStorage);

    // const payload = [...listaEquipos];
    dispatch(updateStorageStart(documentID, listaStorage));
    addToast("Guardado Exitosamente!", {
      appearance: "success",
      autoDismiss: true,
    });
  };

  const handleAddOneMore = (type) => {
    switch (type) {
      case "server":
        setListaEquipos([
          ...listaEquipos,
          {
            os: "",
            cpu: 0,
            cores: 0,
            ram: 0,
            virtual: "",
            enviroment: "",
            class: "",
            price: 0,
            est_cost: 0,
            year: 2014,
            cpu_useage: 100,
            cloud_version: {},
          },
        ]);
        break;
      case "storage":
        setListaDBs([
          ...listaDBs,
          {
            type: "",
            enviroment: "",
            os: "",
            ram: 0,
            cores: 0,
            cpu: 1,
            license: "",
            year: 2014,
            est_cost: 0,
            cpu_useage: 100,
            cloud_version: {},
          },
        ]);
        break;
      case "db":
        setListaStorage([
          ...listaStorage,
          {
            capacity: 0,
            backup: 0,
            archive: 0,
            type: "nas",
            unit: "gb",
            year: "",
          },
        ]);
      // case "vm":
      //   setListaDBs([...listaDBs.filter((ele, indx) => indx !== index)]);
      //   break;
      case "team":
        setTeamList([
          ...teamList,
          {
            ref: "",
            salary: 0,
            officeHours: 8,
            datacenterHours: 0,
          },
        ]);
      default:
        break;
    }
  };
  const handleAdd = () => {
    setListaEquipos([
      ...listaEquipos,
      {
        os: "",
        cpu: 0,
        cores: 0,
        ram: 0,
        virtual: "",
        enviroment: "",
        class: "",
        price: 0,
        est_cost: 0,
        year: 2014,
        cpu_useage: 100,
        cloud_version: {},
      },
    ]);
  };

  const handleAddDBs = () => {
    setListaDBs([
      ...listaDBs,
      {
        type: "",
        enviroment: "",
        os: "",
        ram: 0,
        cores: 0,
        cpu: 1,
        license: "",
        year: 2014,
        est_cost: 0,
        cpu_useage: 100,
        cloud_version: {},
      },
    ]);
  };

  const handleAddVMs = () => {
    setListaVMs([
      ...listaVMs,
      {
        virtual: "",
        os: "",
        ram: 0,
        cores: 0,
      },
    ]);
  };

  const handleAddStorage = () => {
    setListaStorage([
      ...listaStorage,
      {
        type: "",
        capacity: 0,
        backup: 0,
        archive: 0,
      },
    ]);
  };

  const handleDeleteRowForm = (index, type) => {
    switch (type) {
      case "server":
        setListaEquipos([
          ...listaEquipos.filter((ele, indx) => indx !== index),
        ]);
        break;
      case "storage":
        setListaStorage([
          ...listaStorage.filter((ele, indx) => indx !== index),
        ]);
        break;
      case "db":
        setListaDBs([...listaDBs.filter((ele, indx) => indx !== index)]);
        break;
      case "vm":
        setListaDBs([...listaDBs.filter((ele, indx) => indx !== index)]);
        break;
      case "power":
        setEnergyList([...energyList.filter((elem) => elem.id !== index)]);
        break;
      case "team":
        setTeamList([...teamList.filter((ele, indx) => indx !== index)]);
        break;
      default:
        break;
    }
  };

  const undefProHandler = () => {
    if (typeof project == "undefined") {
      history.push("/dashboard");
    }
  };

  const handleGenReport = () => {
    const pro = {
      project: {
        projectName: projectName,
        projectCompany: projectCompany,
        projectContact: projectContact,
        documentID: documentID,
        netbw: proBw,
        years: proYear,
        netprice: proBwPrice,
      },
      servers: listaEquipos,
      VMs: listaVMs,
      DBs: listaDBs,
      storage: listaStorage,
      team: teamList,
      energyloads: energyList,
    };
    dispatch(setProjectReport(pro));
    // history.push(`/report`);
    history.push(`/dashboard/${documentID}/report`);
  };

  const getYearRange = () => {
    let date = new Date().getFullYear();
    var yearlist = [];
    for (let i = 3; i >= 0; i--) {
      // console.log(date-i)
      yearlist.push(date - i);
    }
    return yearlist;
  };

  const {
    projectName,
    projectCompany,
    projectContact,
    documentID,
    netbw,
    years,
    netprice,
  } = project || { equipos: [], databases: [], storage: [], documentID: "" };

  undefProHandler();

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }

  const marks = [
    {
      value: 0,
      label: "0%",
    },
    {
      value: 25,
      label: "25%",
    },
    {
      value: 50,
      label: "50%",
    },
    {
      value: 75,
      label: "75%",
    },
    {
      value: 100,
      label: "100%",
    },
  ];

  const findNext = (cpu, ram) => {
    const found = serverPrices.find((item) => {
      return item.cpusPerVm === cpu && item.memPerVm >= ram;
    });
    return found ? found : findNext(cpu + 1, ram);
  };

  const cloudserver = (cpu, ram, percent) => {
    const cpu_useage = Math.ceil((cpu * percent) / 100);
    return findNext(cpu_useage, ram);
  };

  const handleCpuUseage = (index, value, item) => {
    handleEditServers(value, index, "cpu_useage");
    handleEditServers(item, index, "cloud_version");
  };

  return (
    <div>
      <AppBar position="sticky" color="primary">
        <Tabs
          variant="scrollable"
          // scrollButtons="on"
          value={tabValue}
          onChange={(event, newValue) => setTabValue(newValue)}
          aria-label="simple tabs example"
        >
          <Tab style={{ minWidth: 100 }} label="Details" {...a11yProps(0)} />
          <Tab style={{ minWidth: 100 }} label="Servers" {...a11yProps(1)} />
          <Tab style={{ minWidth: 100 }} label="Storage" {...a11yProps(2)} />
          <Tab style={{ minWidth: 100 }} label="Databases" {...a11yProps(3)} />
          <Tab
            style={{ minWidth: 100 }}
            label="Energy"
            {...a11yProps(4)}
            onClick={() =>
              setmonthlyPower(
                energyList.reduce((acc, item) => {
                  return (
                    acc +
                    powerDataModeler(item.values).reduce(
                      (acc, elem) => acc + elem.y,
                      0
                    )
                  );
                }, 0)
              )
            }
          />
          <Tab
            style={{ minWidth: 100 }}
            label="Additional Costs"
            {...a11yProps(5)}
          />
        </Tabs>
      </AppBar>

      <TabPanel value={tabValue} index={0}>
        <Grid container direction="row">
          <Grid item xs={12} md={8}>
            <div style={{ margin: "2rem 2rem 0 2rem" }}>
              {/* <Paper /> */}
              <Paper className="paper">
                <div className="apHeader">
                  <h1>{projectName}</h1>
                  <span></span>
                  <Button
                    onClick={() =>
                      handleUpdateProjectParams([
                        { field: "years", value: proYear },
                        { field: "projectCompany", value: proCompany },
                        { field: "projectContact", value: proContact },
                      ])
                    }
                  >
                    Save
                  </Button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                  <b className="label">Project ID: </b>
                  <span className="idField">{documentID}</span>
                </div>

                <FormInput
                  type="text"
                  label="Company:"
                  value={proCompany}
                  handleChange={(e) => setProCompany(e.target.value)}
                />

                <FormInput
                  type="text"
                  label="Contact:"
                  value={proContact}
                  handleChange={(e) => setProContact(e.target.value)}
                />
                <FormControl component="fieldset">
                  <FormLabel
                    component="legend"
                    style={{ fontSize: "1.5rem", color: "black" }}
                  >
                    <b>Project Duration</b>
                  </FormLabel>
                  <RadioGroup
                    aria-label="duration"
                    name="duration1"
                    value={proYear}
                    onChange={(e) => setProYear(parseInt(e.target.value))}
                  >
                    <FormControlLabel
                      value={3}
                      control={<Radio color="primary" />}
                      label={
                        <span style={{ fontSize: "1.5rem" }}>3 Years</span>
                      }
                    />
                    <FormControlLabel
                      value={5}
                      control={<Radio color="primary" />}
                      label={
                        <span style={{ fontSize: "1.5rem" }}>5 Years</span>
                      }
                    />
                  </RadioGroup>
                </FormControl>
              </Paper>
            </div>
          </Grid>
          <Grid item xs={12} md={4}>
            <div style={{ margin: "2rem 2rem 2rem 2rem", flex: "1" }}>
              {/* <Paper /> */}
              <Paper className="paper">
                <h1 className="reporthead">zabbix integration</h1>
                <span></span>
                <FormInput
                  disabled={zabbixToken}
                  type="text"
                  label="Domain"
                  value={zabbixDomain}
                  handleChange={(e) => setZabbixDomain(e.target.value)}
                />
                <FormInput
                  disabled={zabbixToken}
                  type="text"
                  label="User"
                  value={zabbixUser}
                  handleChange={(e) => setZabbixUser(e.target.value)}
                />
                <FormInput
                  disabled={zabbixToken}
                  type="Password"
                  label="Password"
                  value={zabbixPass}
                  handleChange={(e) => setZabbixPass(e.target.value)}
                />
                {zabbixToken === "" ? (
                  <Button onClick={() => fetchZabbixToken()}>Connect</Button>
                ) : (
                  <p>Authenticated!</p>
                )}
              </Paper>
            </div>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={8} xl={3}>
            <div style={{ margin: "2rem 2rem 2rem 2rem" }}>
              <Paper className="paper">
                <h1 className="reporthead">Network Parameters</h1>

                <span></span>
                <span>Network Bandwith</span>
                <FormInput
                  type="number"
                  value={proBw}
                  handleChange={(e) => setProBw(parseFloat(e.target.value))}
                />
                <span>Network Price per GB</span>
                <FormInput
                  type="number"
                  value={proBwPrice}
                  handleChange={(e) =>
                    setProBwPrice(parseFloat(e.target.value))
                  }
                />
                <Button
                  type="submit"
                  onClick={() =>
                    handleUpdateProjectParams([
                      { field: "netbw", value: proBw },
                      { field: "netprice", value: proBwPrice },
                    ])
                  }
                >
                  Save
                </Button>
              </Paper>
            </div>
          </Grid>
          <Grid item>
            <div style={{ margin: "2rem 2rem 2rem 2rem", flex: "1" }}>
              {/* <Paper /> */}
              <Paper className="paper">
                <h1 className="reporthead">Report</h1>
                <span></span>
                <Button onClick={handleGenReport}>Generate</Button>
              </Paper>
            </div>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid item xs={12}>
          <div style={{ margin: "2rem 2rem 0 2rem" }}>
            <Paper className="paper">
              <div className="apHeader">
                <h1>Servers</h1>
                <span></span>
                {zabbixToken !== "" ? (
                  <Button
                    style={{ marginRight: "1rem" }}
                    onClick={() => toggleZabbixModal()}
                  >
                    Zabbix ADD
                  </Button>
                ) : null}
                {listaEquipos.length === 0 ? (
                  <Button
                    type="submit"
                    onClick={handleUpdateForm}
                    style={{ marginRight: "8px" }}
                  >
                    Save
                  </Button>
                ) : null}
                <Button onClick={() => handleAdd()}>Add</Button>
              </div>

              <div>
                <TableContainer>
                  <Table aria-label="simple table" className="projects">
                    <TableHead>
                      <TableRow>
                        <TableCell>Operating System</TableCell>
                        <TableCell align="right">Enviroment</TableCell>
                        <TableCell align="right">Specs</TableCell>
                        <TableCell align="right">Virtualization</TableCell>
                        <TableCell align="right">Estimated Cost</TableCell>
                        <TableCell align="right">Acquisition Year</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {listaEquipos.map((item, index) => (
                        <TableRow key={index} hover={true}>
                          <TableCell scope="row">
                            <FormSelect
                              defaultValue={item.os}
                              options={[
                                { value: "", name: "" },
                                { value: "windows", name: "MS Windows" },
                                {
                                  value: "linux",
                                  name: "GNU Linux OS",
                                },
                              ]}
                              handleChange={(e) =>
                                handleEditServers(e.target.value, index, "os")
                              }
                            />
                          </TableCell>
                          <TableCell align="right">
                            <FormSelect
                              defaultValue={item.enviroment}
                              options={[
                                { value: "", name: "" },
                                { value: "phy", name: "Physical Server" },

                                { value: "vm", name: "Multi VM Server" },
                              ]}
                              handleChange={(e) =>
                                handleEditServers(
                                  e.target.value,
                                  index,
                                  "enviroment"
                                )
                              }
                            />
                          </TableCell>

                          <TableCell align="right">
                            {item.os === "" ? null : (
                              <Slider
                                value={parseFloat(item.cpu_useage)}
                                onChangeCommitted={(e, value) => {
                                  let cloudserverobj = cloudserver(
                                    item.cpu,
                                    item.ram,
                                    item.cpu_useage
                                  );
                                  console.log(
                                    cloudserver(
                                      item.cpu,
                                      item.ram,
                                      item.cpu_useage
                                    )
                                  );
                                  handleCpuUseage(index, value, {
                                    class: cloudserverobj["type"],
                                    cpu: cloudserverobj["cpusPerVm"],
                                    ram: cloudserverobj["memPerVm"],
                                    price: cloudserverobj["onDemandPrice"],
                                  });
                                  return `${
                                    !isNaN(parseInt(value))
                                      ? parseInt(value)
                                      : 100
                                  }`;
                                }}
                                aria-labelledby="continuous-slider"
                                valueLabelDisplay="auto"
                                marks={marks}
                                step={1}
                                min={1}
                                max={100}
                              />
                            )}

                            <FormSelect
                              defaultValue=""
                              value={`${item.cpu},${item.ram}`}
                              options={[
                                { value: "", name: "" },
                                ...serverPrices.map((item) => {
                                  return {
                                    value: `${item.cpusPerVm},${item.memPerVm}`,
                                    name: `${item.cpusPerVm} CPUs - ${item.memPerVm} GB RAM`,
                                  };
                                }),
                              ]}
                              handleChange={(e) => {
                                console.log(item);
                                return handleEditSpecs(e.target.value, index);
                              }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            {item.enviroment === "vm" ? (
                              <FormSelect
                                defaultValue={item.virtual}
                                options={[
                                  { value: "", name: "" },
                                  { value: "hyperv", name: "Hyper-V" },
                                  {
                                    value: "vmware",
                                    name: "VMWare",
                                  },
                                ]}
                                handleChange={(e) =>
                                  handleEditServers(
                                    e.target.value,
                                    index,
                                    "virtual"
                                  )
                                }
                              />
                            ) : null}
                          </TableCell>
                          <TableCell align="right">
                            {item.enviroment === "phy" ? (
                              <FormInput
                                key={`ROW_${index}`}
                                type="number"
                                value={item.est_cost}
                                handleChange={(e) =>
                                  handleEditServers(
                                    parseFloat(e.target.value ?? 0),
                                    index,
                                    "est_cost"
                                  )
                                }
                              />
                            ) : null}
                          </TableCell>
                          <TableCell align="right">
                            {item.enviroment === "phy" ? (
                              <FormSelect
                                defaultValue={item.year}
                                options={[
                                  { value: "", name: "" },
                                  {
                                    value: getYearRange()[0] - 1,
                                    name: `Before ${getYearRange()[0]}`,
                                  },
                                  ...getYearRange().map((year) => {
                                    return {
                                      value: year,
                                      name: year.toString(),
                                    };
                                  }),
                                ]}
                                handleChange={(e) =>
                                  handleEditServers(
                                    e.target.value,
                                    index,
                                    "year"
                                  )
                                }
                              />
                            ) : null}
                          </TableCell>

                          <TableCell>
                            <Button
                              type="submit"
                              onClick={() =>
                                handleDeleteRowForm(index, "server")
                              }
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {listaEquipos.length > 0 ? (
                  <Button type="submit" onClick={handleUpdateForm}>
                    Save
                  </Button>
                ) : null}
              </div>
            </Paper>
          </div>
        </Grid>
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        <Grid item xs={12}>
          <div style={{ margin: "2rem 2rem 0 2rem" }}>
            <Paper className="paper">
              <div className="apHeader">
                <h1>Storage</h1>
                <span></span>
                {listaStorage.length === 0 ? (
                  <Button
                    type="submit"
                    onClick={handleUpdateFormStorage}
                    style={{ marginRight: "8px" }}
                  >
                    Save
                  </Button>
                ) : null}
                <Button onClick={() => handleAddStorage()}>Add</Button>
              </div>

              <div>
                <TableContainer>
                  <Table aria-label="simple table" className="projects">
                    <TableHead>
                      <TableRow>
                        <TableCell>Storage Type</TableCell>
                        <TableCell align="right">Capacity Size</TableCell>
                        <TableCell align="right">Backup Type</TableCell>
                        <TableCell align="right">Estimated Cost</TableCell>
                        <TableCell align="right">Acquisition Year</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {listaStorage.map((item, index) => (
                        <TableRow key={index} hover={true}>
                          <TableCell scope="row">
                            <FormSelect
                              defaultValue={item.type}
                              options={[
                                { value: "", name: "" },
                                { value: "localdisk", name: "Local Disk" },

                                { value: "nas", name: "File Sharing/NAS" },
                              ]}
                              handleChange={(e) =>
                                handleEditStorage(e.target.value, index, "type")
                              }
                            />
                          </TableCell>
                          <TableCell align="right">
                            <RadioGroup
                              row
                              aria-label="storage unit"
                              name="storageu"
                              value={item.unit}
                              onChange={(e) =>
                                handleEditStorage(e.target.value, index, "unit")
                              }
                            >
                              <FormControlLabel
                                value={"gb"}
                                control={<Radio color="primary" />}
                                label={
                                  <span style={{ fontSize: "1.5rem" }}>GB</span>
                                }
                              />
                              <FormControlLabel
                                value={"tb"}
                                control={<Radio color="primary" />}
                                label={
                                  <span style={{ fontSize: "1.5rem" }}>TB</span>
                                }
                              />
                            </RadioGroup>
                            <FormInput
                              // label="CPU Cores"
                              type="number"
                              value={item.capacity}
                              handleChange={(e) =>
                                handleEditStorage(
                                  parseFloat(e.target.value ?? 0),
                                  index,
                                  "capacity"
                                )
                              }
                            />
                          </TableCell>
                          <TableCell align="right">
                            <FormSelect
                              defaultValue={item.backup}
                              options={[
                                { value: 0, name: "" },
                                {
                                  value: 0.0224,
                                  name: "Locally Redundant Storage (LRS)",
                                },
                                {
                                  value: 0.0448,
                                  name: "Geo-Redundant Storage (GRS)",
                                },
                                {
                                  value: 0.0569,
                                  name:
                                    "Read-Access Geo-Redundant Storage (RA-GRS)",
                                },
                              ]}
                              handleChange={(e) =>
                                handleEditStorage(
                                  e.target.value,
                                  index,
                                  "backup"
                                )
                              }
                            />
                          </TableCell>
                          <TableCell align="right">
                            {item.type === "nas" ? (
                              <FormInput
                                key={`ROW_${index}`}
                                type="number"
                                value={item.est_cost}
                                handleChange={(e) =>
                                  handleEditStorage(
                                    parseFloat(e.target.value ?? 0),
                                    index,
                                    "est_cost"
                                  )
                                }
                              />
                            ) : null}
                          </TableCell>
                          <TableCell align="right">
                            {item.type === "nas" ? (
                              <FormSelect
                                defaultValue={item.year}
                                options={[
                                  { value: "", name: "" },
                                  {
                                    value: getYearRange()[0] - 1,
                                    name: `Before ${getYearRange()[0]}`,
                                  },
                                  ...getYearRange().map((year) => {
                                    return {
                                      value: year,
                                      name: year.toString(),
                                    };
                                  }),
                                ]}
                                handleChange={(e) =>
                                  handleEditStorage(
                                    e.target.value,
                                    index,
                                    "year"
                                  )
                                }
                              />
                            ) : null}
                          </TableCell>
                          <TableCell>
                            <Button
                              type="submit"
                              onClick={() =>
                                handleDeleteRowForm(index, "storage")
                              }
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {listaStorage.length > 0 ? (
                  <Button type="submit" onClick={handleUpdateFormStorage}>
                    Save
                  </Button>
                ) : null}
              </div>
            </Paper>
          </div>
        </Grid>
      </TabPanel>
      <TabPanel value={tabValue} index={3}>
        <Grid item xs={12}>
          <div style={{ margin: "2rem 2rem 0 2rem" }}>
            <Paper className="paper">
              <div className="apHeader">
                <h1>Databases</h1>
                <span></span>
                {zabbixToken !== "" ? (
                  <Button
                    style={{ marginRight: "1rem" }}
                    onClick={() => toggleZabbixModal()}
                  >
                    Zabbix ADD
                  </Button>
                ) : null}
                {listaDBs.length === 0 ? (
                  <Button
                    type="submit"
                    onClick={handleUpdateFormDB}
                    style={{ marginRight: "8px" }}
                  >
                    Save
                  </Button>
                ) : null}
                <Button onClick={() => handleAddDBs()}>Add</Button>
              </div>

              <div>
                <TableContainer>
                  <Table aria-label="simple table" className="projects">
                    <TableHead>
                      <TableRow>
                        <TableCell>Tipo</TableCell>
                        <TableCell>License</TableCell>
                        <TableCell align="right">Enviroment</TableCell>
                        <TableCell align="right">Operating System</TableCell>
                        <TableCell align="right">Specs</TableCell>
                        <TableCell align="right">Estimated Cost</TableCell>
                        <TableCell align="right">Acquisition Year</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {listaDBs.map((item, index) => (
                        <TableRow key={index} hover={true}>
                          <TableCell scope="row">
                            <FormSelect
                              defaultValue={item.type}
                              options={[
                                { value: "", name: "" },
                                { value: "postgres", name: "PostgreSQL" },

                                { value: "mssql", name: "MSSQL" },
                                { value: "mysql", name: "MySQL" },
                              ]}
                              handleChange={(e) =>
                                handleEditDBs(e.target.value, index, "type")
                              }
                            />
                          </TableCell>
                          <TableCell align="right">
                            {item.type === "mssql" ? (
                              <FormSelect
                                defaultValue={item.license}
                                options={[
                                  { value: "", name: "" },
                                  { value: "std", name: "Standard" },

                                  { value: "ent", name: "Enterprise" },
                                ]}
                                handleChange={(e) =>
                                  handleEditDBs(
                                    e.target.value,
                                    index,
                                    "license"
                                  )
                                }
                              />
                            ) : null}
                          </TableCell>
                          <TableCell align="right">
                            <FormSelect
                              defaultValue={item.enviroment}
                              options={[
                                { value: "", name: "" },
                                { value: "phy", name: "Physical Server" },

                                { value: "vm", name: "Multi VM Server" },
                              ]}
                              handleChange={(e) =>
                                handleEditDBs(
                                  e.target.value,
                                  index,
                                  "enviroment"
                                )
                              }
                            />
                          </TableCell>
                          <TableCell align="right">
                            <FormSelect
                              defaultValue={item.os}
                              options={[
                                { value: "", name: "" },
                                { value: "linux", name: "GNU Linux OS" },

                                { value: "windows", name: "MS Windows OS" },
                              ]}
                              handleChange={(e) =>
                                handleEditDBs(e.target.value, index, "os")
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Slider
                              value={parseFloat(item.cpu_useage)}
                              onChange={(e, value) => {
                                let cloudserverobj = cloudserver(
                                  item.cpu,
                                  item.ram,
                                  item.cpu_useage
                                );                               
                                handleEditDBs(value, index, "cpu_useage");
                                return handleEditDBs(
                                  {
                                    class: cloudserverobj["type"],
                                    cpu: cloudserverobj["cpusPerVm"],
                                    ram: cloudserverobj["memPerVm"],
                                    price: cloudserverobj["onDemandPrice"],
                                  },
                                  index,
                                  "cloud_version"
                                );
                              }}
                              aria-labelledby="continuous-slider"
                              valueLabelDisplay="auto"
                              marks={marks}
                              step={1}
                              min={1}
                              max={100}
                            />

                            <FormSelect
                              defaultValue=""
                              value={`${item.cpu},${item.ram}`}
                              options={[
                                { value: "", name: "" },
                                ...serverPrices.map((item) => {
                                  // console.log(
                                  //   `${item.type},${item.onDemandPrice},${item.cpusPerVm},${item.memPerVm}`
                                  // );
                                  return {
                                    value: `${item.cpusPerVm},${item.memPerVm}`,
                                    name: `${item.cpusPerVm} CPUs - ${item.memPerVm} GB RAM`,
                                  };
                                }),
                              ]}
                              handleChange={(e) => {
                                console.log(item);
                                return handleEditSpecsDB(e.target.value, index);
                              }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            {item.enviroment === "phy" ? (
                              <FormInput
                                type="number"
                                value={item.est_cost}
                                handleChange={(e) =>
                                  handleEditDBs(
                                    parseInt(e.target.value ?? 0),
                                    index,
                                    "est_cost"
                                  )
                                }
                              />
                            ) : null}
                          </TableCell>
                          <TableCell align="right">
                            {item.enviroment === "phy" ? (
                              <FormSelect
                                defaultValue={item.year}
                                options={[
                                  { value: "", name: "" },
                                  {
                                    value: getYearRange()[0] - 1,
                                    name: `Before ${getYearRange()[0]}`,
                                  },
                                  ...getYearRange().map((year) => {
                                    return {
                                      value: year,
                                      name: year.toString(),
                                    };
                                  }),
                                ]}
                                handleChange={(e) =>
                                  handleEditDBs(e.target.value, index, "year")
                                }
                              />
                            ) : null}
                          </TableCell>

                          <TableCell>
                            <Button
                              type="submit"
                              onClick={() => handleDeleteRowForm(index, "db")}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {listaDBs.length > 0 ? (
                  <Button type="submit" onClick={handleUpdateFormDB}>
                    Save
                  </Button>
                ) : null}
              </div>
            </Paper>
          </div>
        </Grid>
      </TabPanel>
      <TabPanel value={tabValue} index={4}>
        <Grid item xs={12}>
          <div style={{ margin: "2rem 2rem 0 2rem" }}>
            <Paper className="paper">
              <div className="apHeader">
                <div>
                  <h1>Energy Loads</h1>
                  {/* <h1>{`Energy Loads:
                   ${parseFloat(monthlyPower * 4).toFixed(
                    2)} KWh/Month`
                    }</h1> */}
                  <FormControlLabel
                    style={{ display: "block" }}
                    control={
                      <Switch
                        checked={isEnergyFromZabbix}
                        onChange={() =>
                          setIsEnergyFromZabbix(!isEnergyFromZabbix)
                        }
                        name="checkedB"
                        color="primary"
                      />
                    }
                    label="Use Zabbix Power Readings"
                  />
                </div>
                <span></span>
                {zabbixToken !== "" && isEnergyFromZabbix ? (
                  <Button
                    style={{ marginRight: "1rem" }}
                    onClick={() => {
                      setHideZabbixEnergyModal(!hideZabbixEnergyModal);
                      // setIsEnergyFromZabbix(!isEnergyFromZabbix);
                    }}
                  >
                    Zabbix ADD
                  </Button>
                ) : null}
                <Button onClick={() => toggleModal()}>Add</Button>
              </div>

              {energyList.map((item) => {
                return (
                  <div key={item.id}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ lineHeight: 0 }}>
                        <h4>Device ID:{item.id}</h4>
                        <p>{item.desc}</p>
                      </div>
                      <div style={{ alignSelf: "center" }}>
                        <Icon
                          style={{ cursor: "pointer", fontSize: "5rem" }}
                          onClick={() => {
                            dispatch(deleteSensorStart(documentID, item.id));
                            handleDeleteRowForm(item.id, "power");
                          }}
                        >
                          delete_forever
                        </Icon>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-around",
                      }}
                    ></div>

                    <Grid container spacing={2}>
                      <Grid
                        item
                        xs={12}
                        md={6}
                        container
                        style={{ justifyContent: "center" }}
                      >
                        <div>
                          <p>Accumulated Power By Day</p>
                        </div>
                        <div
                          style={{
                            margin: "2rem 2rem 2rem 2rem",
                            width: "61vw",
                          }}
                        >
                          <Paper className="paper">
                            {tabValue === 4 && power2graph(item.values)}
                          </Paper>
                        </div>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        md={6}
                        container
                        style={{ justifyContent: "center" }}
                      >
                        <div>
                          <p>Latest Power Data </p>
                        </div>
                        <div
                          style={{
                            margin: "2rem 2rem 2rem 2rem",
                            width: "61vw",
                          }}
                        >
                          <Paper className="paper">
                            {tabValue === 4 &&
                              powerDay2graph(item.values, "firebase")}
                          </Paper>
                        </div>
                      </Grid>
                    </Grid>
                  </div>
                );
              })}
            </Paper>
          </div>
        </Grid>
      </TabPanel>
      <TabPanel value={tabValue} index={5}>
        <Grid item xs={12}>
          <div style={{ margin: "2rem 2rem 0 2rem" }}>
            <Paper className="paper">
              <div className="apHeader">
                <h1>IT Personnel Parameters</h1>
                <span></span>
                {teamList.length === 0 ? (
                  <Button
                    type="submit"
                    onClick={handleUpdateFormStorage}
                    style={{ marginRight: "8px" }}
                  >
                    Save
                  </Button>
                ) : null}
                <Button onClick={() => handleAddOneMore("team")}>Add</Button>
              </div>

              <div>
                <TableContainer>
                  <Table aria-label="simple table" className="projects">
                    <TableHead>
                      <TableRow>
                        <TableCell>Reference</TableCell>
                        <TableCell align="right">Monthly Salary</TableCell>
                        <TableCell align="right">Office Hours</TableCell>
                        <TableCell align="right">
                          Datacenter Related Hours
                        </TableCell>

                        <TableCell></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {teamList.map((item, index) => (
                        <TableRow key={index} hover={true}>
                          <TableCell scope="row" key={`tablecell${index}`}>
                            <FormInput
                              key={`form${index}`}
                              type="text"
                              value={item.ref}
                              handleChange={(e) =>
                                handleEditTeam(e.target.value, index, "ref")
                              }
                            />
                          </TableCell>
                          <TableCell align="right">
                            <FormInput
                              // label="CPU Cores"
                              type="number"
                              value={item.salary}
                              handleChange={(e) =>
                                handleEditTeam(
                                  parseInt(e.target.value ?? 0),
                                  index,
                                  "salary"
                                )
                              }
                            />
                          </TableCell>
                          <TableCell align="right">
                            {/* <p>{item.storage}</p> */}
                            <FormInput
                              // label="Storage"
                              type="number"
                              value={item.officeHours}
                              handleChange={(e) =>
                                handleEditTeam(
                                  parseInt(e.target.value ?? 0),
                                  index,
                                  "officeHours"
                                )
                              }
                            />
                          </TableCell>
                          <TableCell align="right">
                            {/* <p>{item.ram}</p> */}
                            <FormInput
                              // label="RAM"
                              type="number"
                              value={item.datacenterHours}
                              handleChange={(e) =>
                                handleEditTeam(
                                  parseInt(e.target.value ?? 0),
                                  index,
                                  "datacenterHours"
                                )
                              }
                            />
                          </TableCell>

                          <TableCell>
                            <Button
                              type="submit"
                              onClick={() => handleDeleteRowForm(index, "team")}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {teamList.length > 0 ? (
                  <Button
                    type="submit"
                    onClick={() =>
                      handleUpdateProjectParams([
                        { field: "projectTeam", value: teamList },
                      ])
                    }
                  >
                    Save
                  </Button>
                ) : null}
              </div>
            </Paper>
          </div>
        </Grid>
      </TabPanel>
      <Modal {...configModal}>
        <div className="addNewProjectForm">
          <form onSubmit={handleSubmit}>
            <h2>Register Sensor</h2>

            <FormInput
              label="Sensor Description"
              type="text"
              value={sensorDescription}
              handleChange={(e) => setSensorDescription(e.target.value)}
            />

            <Button type="submit">Finish</Button>
          </form>
        </div>
      </Modal>
      <Modal hideModal={hideZabbixModal} toggleModal={toggleZabbixModal}>
        <div className="addNewProjectForm">
          <form onSubmit={handleSubmit}>
            <h3>Select your Host group</h3>

            {zabbixGroups ? (
              <List>
                {zabbixGroups.map((item) => {
                  return (
                    <ListItem
                      button
                      key={`zabbixGroup_${item.groupid}`}
                      onClick={() => {
                        fetchZabbixHosts(
                          item.groupid,
                          tabValue === 1 ? setListaEquipos : setListaDBs
                        );
                        setHideZabbixModal(true);
                        listaEquipos
                          .forEach((item, idx) => {
                            if (
                              !isNaN(item.cpu) ||
                              item.cpu === "" ||
                              item.cpu === undefined
                            ) {
                              let cloudserverobj = cloudserver(
                                item.cpu,
                                item.ram,
                                parseFloat(item.cpu_useage).toFixed(2)
                              );

                              handleCpuUseage(
                                idx,
                                !isNaN(parseFloat(item.cpu_useage).toFixed(2))
                                  ? `${item.cpu_useage}`
                                  : 100,
                                {
                                  class: cloudserverobj["type"],
                                  cpu: cloudserverobj["cpusPerVm"],
                                  ram: cloudserverobj["memPerVm"],
                                  price: cloudserverobj["onDemandPrice"],
                                }
                              );
                            }
                          });
                      }}
                    >
                      <ListItemText>{item.name}</ListItemText>
                    </ListItem>
                  );
                })}
              </List>
            ) : (
              <span>loading</span>
            )}
          </form>
        </div>
      </Modal>
      <Modal
        hideModal={hideZabbixEnergyModal}
        toggleModal={() => setHideZabbixEnergyModal(!hideZabbixEnergyModal)}
      >
        <div className="addNewProjectForm">
          <form>
            <h3>Select your Host group</h3>

            {zabbixGroups ? (
              <List>
                {zabbixGroups.map((item) => {
                  return (
                    <ListItem
                      button
                      key={`zabbixGroup_${item.groupid}`}
                      onClick={() => {
                        fetchZabbixEnergyHosts(item.groupid, setEnergyList);
                        setHideZabbixEnergyModal(true);
                      }}
                    >
                      <ListItemText>{item.name}</ListItemText>
                    </ListItem>
                  );
                })}
              </List>
            ) : (
              <span>loading</span>
            )}
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectDetail;
