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
} from "./../../redux/Project/project.actions";
import { useHistory } from "react-router-dom";
import { powerDay2graph, power2graph } from "./power2Graph";
import Modal from "./../../components/Modal";
import FormInput from "./../../components/forms/FormInput";
import Button from "./../../components/forms/Button";
import FormSelect from "./../../components/forms/FormSelect";
import {
  TableCell,
  TableRow,
  TableHead,
  Table,
  TableContainer,
  TableBody,
  Paper,
  Grid,
} from "@material-ui/core/";
import NativeSelect from "@material-ui/core/NativeSelect";

import "./styles.scss";

const mapState = ({ projectData }) => ({
  currentProjectId: projectData.currentProject,
  currentPowerValues: projectData.currentPowerValues,
  // project: projectData.projects.filter(
  //   (pro) => pro.documentID === projectData.currentProject
  // )[0],
  project: projectData.projects.find(
    (pro) => pro.documentID === projectData.currentProject
  ),
});

const ProjectDetail = (props) => {
  const dispatch = useDispatch();
  const { currentProjectId, project, currentPowerValues } = useSelector(
    mapState
  );
  const history = useHistory();
  const [hideModal, setHideModal] = useState(true);
  const [listaEquipos, setListaEquipos] = useState([]);
  const [listaDBs, setListaDBs] = useState([]);
  const [listaStorage, setListaStorage] = useState([]);
  const [listaVMs, setListaVMs] = useState([]);

  useEffect(() => {
    let { equipos, databases, storage, documentID, vms } = project;
    console.log(equipos);
    setListaEquipos(equipos);
    setListaDBs(databases);
    setListaStorage(storage);
    setListaVMs(vms);
    dispatch(fetchPowerValuesStart(documentID));
    // listaEquipos.push({
    //   tipo: "",
    //   nucleos: 0,
    //   ram: 0,
    //   storage: 0,
    // });
  }, []);

  const toggleModal = () => setHideModal(!hideModal);

  const configModal = {
    hideModal,
    toggleModal,
  };

  const resetForm = () => {
    setHideModal(true);
    // setProjectName("");
    // setProjectCompany("");
    // setProjectContact("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // dispatch(  );
    // addProjectStart({
    //   projectName,
    //   projectCompany,
    //   projectContact,
    // })
    resetForm();
  };
  const handleEdit = (value, index, key) => {
    // listaEquipos[index][key] = value;
    const newlist = listaEquipos.map((equ, idx) => {
      if (idx == index) {
        equ[key] = value;
      }

      return equ;
    });
    setListaEquipos(newlist);
    console.log(newlist);
  };

  const handleEditVMs = (value, index, key) => {
    const newlist = listaVMs.map((equ, idx) => {
      if (idx == index) {
        equ[key] = value;
      }

      return equ;
    });
    setListaVMs(newlist);
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
  };
  const handleUpdateFormStorage = () => {
    console.log("update form");
    console.log(listaStorage);

    // const payload = [...listaEquipos];
    dispatch(updateStorageStart(documentID, listaStorage));
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
        setListaEquipos([...listaEquipos.filter((ele, indx) => indx != index)]);
        break;
      case "storage":
        setListaStorage([...listaStorage.filter((ele, indx) => indx != index)]);
        break;
      case "db":
        setListaDBs([...listaDBs.filter((ele, indx) => indx != index)]);
        break;
      case "vm":
        setListaDBs([...listaDBs.filter((ele, indx) => indx != index)]);
        break;

      default:
        break;
    }
  };

  const handleGenReport = () => {
    const pro = {
      project: {
        projectName: projectName,
        projectCompany: projectCompany,
        projectContact: projectContact,
        documentID: documentID,
        netbw: netbw,
        years: years,
        netprice: netprice,
      },
      servers: listaEquipos,
      VMs: listaVMs,
      DBs: listaDBs,
      storage: listaStorage,
    };
    dispatch(setProjectReport(pro));
    history.push(`/report`);
    // history.push(`/dashboard/${documentID}/report`);
  };

  const {
    projectName,
    projectCompany,
    projectContact,
    documentID,
    netbw,
    years,
    netprice,
  } = project;
  return (
    <div style={{ backgroundColor: "#f3f3f3" }}>
      <Grid
        container
        spacing={2}
        style={{ maxHeight: "100vh", overflow: "auto" }}
      >
        <Grid item sm={12} md={8}>
          <div style={{ margin: "2rem 2rem 0 2rem" }}>
            <Paper className="paper">
              <h1>{projectName}</h1>
              <ul>
                <li>Project ID: {documentID}</li>
                <li>Company: {projectCompany}</li>
                <li>Contact: {projectContact}</li>
                <li>Network Bandwith: {netbw}</li>
              </ul>
            </Paper>
          </div>
        </Grid>
        <Grid item sm={12} md={4}>
          <div style={{ margin: "2rem 2rem 2rem 2rem" }}>
            {/* <Paper /> */}
            <Paper className="paper">
              <h1 className="reporthead">Reporte</h1>
              <h1>.</h1>
              <Button onClick={handleGenReport}>Generar</Button>
            </Paper>
          </div>
        </Grid>

        {/* <Grid item xs={12} md={6} container>
          <div style={{ margin: "2rem 2rem 2rem 2rem", width: "61vw" }}>
            <Paper className="paper">{power2graph(currentPowerValues)}</Paper>
          </div>
        </Grid>
        <Grid item xs={12} md={6} container>
          <div style={{ margin: "2rem 2rem 2rem 2rem", width: "61vw" }}>
            <Paper className="paper">
              {powerDay2graph(currentPowerValues)}
            </Paper>
          </div>
        </Grid> */}
        <Grid item xs={12}>
          <div style={{ margin: "2rem 2rem 0 2rem" }}>
            <Paper className="paper">
              <div className="apHeader">
                <h1>Servers</h1>
                <span></span>
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
                        <TableCell align="right">CPU</TableCell>
                        <TableCell align="right">Cores</TableCell>
                        <TableCell align="right">RAM</TableCell>
                        <TableCell align="right">Virtualization</TableCell>
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
                                handleEdit(e.target.value, index, "os")
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
                                handleEdit(e.target.value, index, "enviroment")
                              }
                            />
                          </TableCell>
                          <TableCell align="right">
                            <FormInput
                              // label="CPU Cores"
                              type="number"
                              value={item.cpu}
                              handleChange={(e) =>
                                handleEdit(
                                  parseInt(e.target.value ?? 0),
                                  index,
                                  "cpu"
                                )
                              }
                            />
                          </TableCell>
                          <TableCell align="right">
                            <FormInput
                              type="number"
                              value={item.cores}
                              handleChange={(e) =>
                                handleEdit(
                                  parseInt(e.target.value ?? 0),
                                  index,
                                  "cores"
                                )
                              }
                            />
                          </TableCell>
                          <TableCell align="right">
                            <FormInput
                              type="number"
                              value={item.ram}
                              handleChange={(e) =>
                                handleEdit(
                                  parseInt(e.target.value ?? 0),
                                  index,
                                  "ram"
                                )
                              }
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
                                  handleEdit(e.target.value, index, "virtual")
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
        {/* <Grid item xs={12}>
          <div style={{ margin: "2rem 2rem 0 2rem" }}>
            <Paper className="paper">
              <div className="apHeader">
                <h1>Virtual Machines</h1>
                <span></span>
                <Button onClick={() => handleAddVMs()}>Add</Button>
              </div>

              <div>
                <TableContainer>
                  <Table aria-label="simple table" className="projects">
                    <TableHead>
                      <TableRow>
                        <TableCell>Operating System</TableCell>
                        <TableCell align="right">Virtualization</TableCell>
                        <TableCell align="right">Cores</TableCell>
                        <TableCell align="right">RAM</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {listaVMs.map((item, index) => (
                        <TableRow key={index} hover={true}>
                          <TableCell scope="row">
                            <FormSelect
                              defaultValue={item.os}
                              options={[
                                { value: "linux", name: "GNU Linux" },
                                {
                                  value: "windows",
                                  name: "MS Windows",
                                },
                              ]}
                              handleChange={(e) =>
                                handleEditVMs(e.target.value, index, "os")
                              }
                            />
                          </TableCell>
                          <TableCell align="right">
                            <FormSelect
                              defaultValue={item.virtual}
                              options={[
                                { value: "hyperv", name: "Hyper-V" },
                                {
                                  value: "vmware",
                                  name: "VMWare",
                                },
                              ]}
                              handleChange={(e) =>
                                handleEditVMs(e.target.value, index, "virtual")
                              }
                            />
                          </TableCell>
                          <TableCell align="right">
                            <FormInput
                              type="number"
                              value={item.ram}
                              handleChange={(e) =>
                                handleEditVMs(e.target.value ?? 0, index, "ram")
                              }
                            />
                          </TableCell>
                          <TableCell align="right">
                            <FormInput
                              type="number"
                              value={item.cores}
                              handleChange={(e) =>
                                handleEditVMs(
                                  e.target.value ?? 0,
                                  index,
                                  "cores"
                                )
                              }
                            />
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
                {listaVMs.length > 0 ? (
                  <Button type="submit" onClick={handleUpdateFormVM}>
                    Save
                  </Button>
                ) : null}
              </div>
            </Paper>
          </div>
        </Grid> */}
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
                        <TableCell align="right">Capacity Size (TB)</TableCell>
                        <TableCell align="right">Backup Size (TB)</TableCell>
                        <TableCell align="right">Archive Size (TB)</TableCell>
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
                            <FormInput
                              // label="CPU Cores"
                              type="number"
                              value={item.capacity}
                              handleChange={(e) =>
                                handleEditStorage(
                                  parseInt(e.target.value ?? 0),
                                  index,
                                  "capacity"
                                )
                              }
                            />
                          </TableCell>
                          <TableCell align="right">
                            {/* <p>{item.ram}</p> */}
                            <FormInput
                              // label="RAM"
                              type="number"
                              value={item.backup}
                              handleChange={(e) =>
                                handleEditStorage(
                                  parseInt(e.target.value ?? 0),
                                  index,
                                  "backup"
                                )
                              }
                            />
                          </TableCell>
                          <TableCell align="right">
                            {/* <p>{item.storage}</p> */}
                            <FormInput
                              // label="Storage"
                              type="number"
                              value={item.archive}
                              handleChange={(e) =>
                                handleEditStorage(
                                  parseInt(e.target.value ?? 0),
                                  index,
                                  "archive"
                                )
                              }
                            />
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
        <Grid item xs={12}>
          <div style={{ margin: "2rem 2rem 0 2rem" }}>
            <Paper className="paper">
              <div className="apHeader">
                <h1>Databases</h1>
                <span></span>
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
                        <TableCell align="right">Cores</TableCell>
                        <TableCell align="right">RAM (GB)</TableCell>
                        <TableCell align="right">CPU</TableCell>
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
                          <TableCell align="right">
                            <FormInput
                              type="number"
                              value={item.cores}
                              handleChange={(e) =>
                                handleEditDBs(
                                  parseInt(e.target.value ?? 0),
                                  index,
                                  "cores"
                                )
                              }
                            />
                          </TableCell>
                          <TableCell align="right">
                            <FormInput
                              type="number"
                              value={item.ram}
                              handleChange={(e) =>
                                handleEditDBs(
                                  parseInt(e.target.value ?? 0),
                                  index,
                                  "ram"
                                )
                              }
                            />
                          </TableCell>
                          <TableCell>
                            {item.enviroment === "phy" ? (
                              <FormInput
                                type="number"
                                value={item.cpu}
                                handleChange={(e) =>
                                  handleEditDBs(
                                    parseInt(e.target.value ?? 0),
                                    index,
                                    "cpu"
                                  )
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
      </Grid>
    </div>
  );
};

export default ProjectDetail;
