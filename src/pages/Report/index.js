import React, { useEffect } from "react";
import "./styles.scss";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  fetchProjectsStart,
  setProjectId,
  setCurrentPowerValues,
} from "./../../redux/Project/project.actions";
import ReactDOMServer from "react-dom/server";
import { jsPDF } from "jspdf";

import * as htmlToImage from "html-to-image";
import {
  TableCell,
  TableRow,
  TableHead,
  Table,
  TableContainer,
  TableBody,
  TableFooter,
  Card,
  CardContent,
  Grid,
  Paper,
  Toolbar,
} from "@material-ui/core/";
import abstractSeries from "react-vis/dist/plot/series/abstract-series";
import Button from "../../components/forms/Button";
import {
  Project2Graph,
  ProjectClusterGraph,
  ProjectRadialGraph,
} from "./project2Graph";
import { powerDataModeler } from "../ProjectDetail/power2Graph";
import Pdf from "react-to-pdf";
const ref = React.createRef();

const mapState = ({ projectData }) => ({
  projectReport: projectData.projectReport,
});

const ReportPage = (props) => {
  const history = useHistory();
  const { projectReport } = useSelector(mapState);
  const dispatch = useDispatch();

  useEffect(() => {
    // dispatch(fetchProjectsStart());
    // dispatch(setCurrentPowerValues([]));
  }, []);
  const undefProHandler = () => {
    return history.push("/dashboard");
  };

  if (typeof projectReport.project == "undefined") {
    undefProHandler();
    return <></>;
  }

  const {
    servers,
    DBs,
    storage,
    team,
    energyloads,
    project: { years, netbw, netprice },
  } = projectReport;
  const totalserverphy = servers
    .concat(DBs)
    .filter((item) => item.enviroment === "phy")
    .reduce((acc, item) => {
      // const pricekey = `${item.cpu},${item.cores},${item.ram}`;
      // return acc + serverPriceBox[pricekey].onprem;
      return (
        acc +
        (item.est_cost -
          item.est_cost * 0.25 * (new Date().getFullYear() - item.year))
      );
    }, 0);
  const totalservervm = servers
    .concat(DBs)
    .filter((item) => item.enviroment === "vm")
    .reduce((acc, item) => {
      // const pricekey = `${item.cpu},${item.cores},${item.ram}`;
      // return acc + serverPriceBox[pricekey].onprem;
      return acc + item.est_cost;
    }, 0);

  const totalHwCostTime =
    (totalservervm + totalserverphy) * 0.2 * years +
    totalservervm +
    totalserverphy; //0.2 maintanance

  const totalSwCostTime = servers
    .concat(DBs)
    .filter((item) => item.os === "windows")
    .reduce((acc, item) => {
      // const pricekey = item.cpu * item.cores;
      return acc + item.cpu * 384.69; //factor precio desde winlincprices()
    }, 0);
  const totalStdCores = DBs.filter(
    (item) => item.type === "mssql" && item.license === "std"
  ).reduce((acc, item) => {
    return acc + item.cpu;
  }, 0);

  const totalEntCores = DBs.filter(
    (item) => item.type === "mssql" && item.license === "ent"
  ).reduce((acc, item) => {
    return acc + item.cpu;
  }, 0);

  // const totalCapacityTB = storage.reduce((acc, item) => {
  //   return acc + item.capacity;
  // }, 0);

  // const totalBackupTB = storage.reduce((acc, item) => {
  //   return acc + item.backup;
  // }, 0);
  // const totalArchiveTB = storage.reduce((acc, item) => {
  //   return acc + item.archive;
  // }, 0);

  const storageOnPrem = ({ est_cost, year }) => {
    return est_cost - est_cost * 0.25 * (new Date().getFullYear() - year);
  };

  const storageOnCloud = ({ unit, capacity, backup }) => {
    ///Azure Backup pricing
    const size = unit === "gb" ? capacity : capacity * 1000;
    const bckpPrice = parseFloat(backup).toFixed(2);
    const sizeRemain = size % 500;
    const residual =
      sizeRemain < 50
        ? 5 + sizeRemain * bckpPrice
        : 10 + sizeRemain * bckpPrice;
    if (size < 50) {
      return 5 + size * bckpPrice;
    } else if (size > 50 && size < 500) {
      return 10 + size * bckpPrice;
    } else {
      return (10 * (size - sizeRemain)) / 500 + residual;
    }
  };

  const storageMaint =
    storage.reduce((acc, item) => {
      // const pricekey = `${item.cpu},${item.cores},${item.ram}`;
      // return acc + serverPriceBox[pricekey].cloud;
      return acc + storageOnPrem(item);
    }, 0) * 0.15;
  const totalStorageCloudOverTime =
    storage.reduce((acc, item) => {
      return acc + storageOnCloud(item);
    }, 0) *
    12 *
    years;

  const totalStorageOnPremOverTime =
    storageMaint / 0.15 + storageMaint * 12 * years; //reusing same variable
  const totalVmLicCost =
    vmCosts.costpermachine * 12 * years + vmCosts.licvmware;

  const totalDBCost =
    (totalEntCores === 1
      ? dbCosts.sqlEnt2core * totalEntCores
      : (dbCosts.sqlEnt2core * totalEntCores) / 2) +
    (totalStdCores === 1
      ? dbCosts.sqlStd2core * totalStdCores
      : (dbCosts.sqlStd2core * totalStdCores) / 2);

  const costInfData = (1511.35 + 2115.89) * years;

  const costRed =
    (totalHwCostTime + totalSwCostTime) * 0.15 +
    (totalHwCostTime + totalSwCostTime) * 0.0225 +
    netprice * netbw * 12 * years;

  const rentvms =
    servers
      .concat(DBs)
      .filter((item) => item.os !== "")
      .reduce((acc, item) => {
        // const pricekey = `${item.cpu},${item.cores},${item.ram}`;
        // return acc + serverPriceBox[pricekey].cloud;
        return acc + item.cloud_version.price;
      }, 0) *
    24 *
    30 *
    12;

  const currencyFormat = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);

  //rentvms
  //totalDBCost
  const netcloud = netbw * 0.076 * 12 * years;
  const datacencloud = 0.0;
  // const storagecloud = 23 * 50 * 12 * years;
  const itcloud = 23.0 * 50 * years;
  const itonpremise = 76.67 * 23 * years;
  const rentdb =
    DBs.reduce((acc, item) => {
      return acc + dbCloudpriceshr[item.type];
    }, 0) *
    730 *
    12 *
    years;
  // const totalcloud = "";

  const monthlyEnergy =
    energyloads.reduce((acc, item) => {
      console.log(item);
      console.log(item.values);
      const dic = powerDataModeler(item.values);
      return (
        acc +
        powerDataModeler(item.values).reduce(
          (acc, elem, idx, arr) => acc + elem.y / arr.length,
          0
        )
      );
    }, 0) * 30;

  console.log(monthlyEnergy);

  const totalTeamPay =
    team.reduce((acc, item) => {
      console.log("reduceeeeeeee");
      console.log(item);
      return acc + item.salary;
    }, 0) * 12;

  const onpremiseProjectTotal =
    totalHwCostTime +
    totalSwCostTime +
    totalVmLicCost +
    totalDBCost +
    costInfData +
    // itonpremise +
    totalStorageOnPremOverTime +
    costRed +
    powerCost(monthlyEnergy) * 12 * years +
    totalTeamPay * years;

  const cloudProjectTotal =
    rentvms * years +
    rentdb +
    netcloud +
    datacencloud +
    totalStorageCloudOverTime +
    itcloud;

  const dbType = {
    mssql: "Microsoft SQL Server",
    postgres: "Database for PostgreSQL",
    mysql: "Database for MySQL",
  };
  const options = {
    orientation: "vertical",
    unit: "in",
    format: [4, 2],
  };
  const onButtonClick = () => {
    let domElement = document.getElementById("mynode");
    htmlToImage
      .toPng(domElement)
      .then(function (dataUrl) {
        console.log(dataUrl);
        const pdf = new jsPDF("portrait", "pt", "a4");
        pdf.addImage(dataUrl, "PNG", 10, 20, 380, 200);
        pdf.save("download.pdf");
      })
      .catch(function (error) {
        console.error("oops, something went wrong!", error);
      });
  };
  return (
    <div id="mynode" className="contentCard">
      <Pdf targetRef={ref} filename="download.pdf">
        {({ toPdf }) => <button onClick={onButtonClick}>Generate pdf</button>}
      </Pdf>
      <Card elevation={20} ref={ref}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="center">
                      <h1>Costos Operativos</h1>
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => history.goBack()}>Close</Button>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableFooter>
                  <TableRow>
                    <TableCell align="left">
                      <h3 className="reportSideH">On-Premise</h3>
                    </TableCell>
                    <TableCell align="right">
                      <h3 className="reportSideH">Cloud</h3>
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </Grid>
            {/*Costos por Hardware */}
            <Grid
              container
              spacing={2}
              // style={{ maxHeight: "100vh", overflow: "auto" }}
            >
              <Grid item xs={6}>
                <div style={{ margin: "2rem 2rem 0 2rem" }}>
                  <Paper className="paper">
                    <Toolbar>
                      <h5>Server Costs</h5>
                    </Toolbar>
                    <TableContainer>
                      <Table aria-label="simple table" className="projects">
                        <TableHead>
                          <TableRow>
                            <TableCell>Description</TableCell>
                            <TableCell align="right">Value</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {servers
                            .concat(DBs)
                            .filter((item) => item.enviroment === "phy")

                            .map((item, index) => {
                              // const pricekey = `${item.cpu},${item.cores},${item.ram}`;
                              return (
                                <TableRow
                                  key={`privephy${index}`}
                                  className="dynamicValues"
                                >
                                  <TableCell>
                                    <p>
                                      {!item.cpu
                                        ? "Physical Server - Bare Metal"
                                        : `Physical Server - ${item.cpu} CPUs ${item.ram} GB RAM`}
                                    </p>
                                  </TableCell>
                                  <TableCell align="right">
                                    <p>
                                      {currencyFormat(
                                        //precio despreciado a 25% cada anio
                                        item.est_cost -
                                          item.est_cost *
                                            0.25 *
                                            (new Date().getFullYear() -
                                              item.year)
                                      )}
                                    </p>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          <TableRow>
                            <TableCell>
                              <p>Total cost of physical servers</p>
                            </TableCell>
                            <TableCell align="right">
                              <p>{currencyFormat(totalserverphy)}</p>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <p>Server maintenance costs</p>
                            </TableCell>
                            <TableCell align="right">
                              <p>{currencyFormat(totalserverphy * 0.2)}</p>
                            </TableCell>
                          </TableRow>
                          {servers
                            .concat(DBs)
                            .filter((item) => item.enviroment === "vm")
                            .map((item, index) => {
                              // const pricekey = `${item.cpu},${item.cores},${item.ram}`;

                              return (
                                <TableRow
                                  key={`vmprice${index}`}
                                  className="dynamicValues"
                                >
                                  <TableCell>
                                    <p>{`VM server - ${item.cpu} CPUs ${item.ram} GB RAM`}</p>
                                  </TableCell>
                                  <TableCell align="right">
                                    <p>
                                      {currencyFormat(
                                        item.est_cost -
                                          item.est_cost *
                                            0.1 *
                                            (new Date().getFullYear() -
                                              item.year)
                                      )}
                                    </p>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          {/* <TableRow>
                            <TableCell>
                              <p>
                                Costo por Mantenimiento servidores
                                virtualizacion
                              </p>
                            </TableCell>
                            <TableCell align="right">
                              <p>{currencyFormat(totalservervm * 0.2)}</p>
                            </TableCell>
                          </TableRow> */}
                          <TableRow>
                            <TableCell>
                              <p>Total maintenance cost over time</p>
                            </TableCell>
                            <TableCell align="right">
                              <p>
                                {currencyFormat(
                                  // (totalservervm + totalserverphy) * 0.2 * years
                                  totalserverphy * 0.2 * years
                                )}
                              </p>
                            </TableCell>
                          </TableRow>
                          <TableRow className="totales">
                            <TableCell>
                              <p>Total compute equipment cost over time</p>
                            </TableCell>
                            <TableCell align="right">
                              <p>
                                {currencyFormat(totalHwCostTime)} /{years} years
                              </p>
                            </TableCell>
                          </TableRow>
                          {/* <TableRow>
                            {Project2Graph({
                              fixed: totalservervm + totalserverphy,
                              recurrent: (totalservervm + totalserverphy) * 0.2,
                              years,
                            })}
                          </TableRow> */}
                          {/* <TableRow>
                            
                          </TableRow> */}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </div>
              </Grid>
              {/*Costos vm cloud */}
              <Grid item xs={6}>
                <div style={{ margin: "2rem 2rem 0 2rem" }}>
                  <Paper className="paper">
                    <Toolbar>
                      <h5>Virtualization costs</h5>
                    </Toolbar>
                    <TableContainer>
                      <Table aria-label="simple table" className="projects">
                        <TableHead>
                          <TableRow>
                            <TableCell>Description</TableCell>
                            <TableCell align="right">Monthly Cost</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {servers
                            .concat(DBs)
                            .filter((item) => item.os !== "")

                            .map((item, index) => {
                              // const pricekey = `${item.cpu},${item.cores},${item.ram}`;
                              const cloudServer = item.cloud_version;
                              console.log(item);
                              return (
                                <TableRow
                                  key={`privephy${index}`}
                                  className="dynamicValues"
                                >
                                  <TableCell>
                                    <p>{`${cloudServer.class} (${cloudServer.cpu} Cores + ${cloudServer.ram} GB RAM)`}</p>
                                  </TableCell>
                                  <TableCell align="right">
                                    <p>
                                      {currencyFormat(
                                        cloudServer.price * 24 * 30
                                      )}
                                    </p>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          <TableRow className="totales">
                            <TableCell>
                              <p>Total Rent Cost</p>
                            </TableCell>
                            <TableCell align="right">
                              <p>{currencyFormat(rentvms * years)}</p>
                            </TableCell>
                          </TableRow>
                          {/* <TableRow>
                            {Project2Graph({
                              fixed: 0,
                              recurrent: rentvms,
                              years,
                            })}
                          </TableRow> */}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </div>
              </Grid>
              <Grid item xs={2}></Grid>
              <Grid item xs={8}>
                <div style={{ margin: "2rem 2rem 0 2rem" }}>
                  <Paper className="paper">
                    {ProjectClusterGraph([
                      {
                        fixed: totalservervm + totalserverphy,
                        recurrent: (totalservervm + totalserverphy) * 0.2,
                        years,
                      },
                      {
                        fixed: 0,
                        recurrent: rentvms,
                        years,
                      },
                    ])}
                  </Paper>
                </div>
              </Grid>
              <Grid item xs={2}></Grid>
              {/*Costos por Software */}
              <Grid item xs={6}>
                <div style={{ margin: "2rem 2rem 0 2rem" }}>
                  <Paper className="paper">
                    <Toolbar>
                      <h5>Costos por Software</h5>
                    </Toolbar>
                    <TableContainer>
                      <Table aria-label="simple table" className="projects">
                        <TableHead>
                          <TableRow>
                            <TableCell>Descripcion</TableCell>
                            <TableCell align="right">Costo</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {servers
                            .concat(DBs)
                            .filter((item) => item.os === "windows")
                            .map((item, index) => {
                              const pricekey = item.cpu;
                              return item.enviroment === "phy" ? (
                                <TableRow
                                  key={`licphy${index}`}
                                  className="dynamicValues"
                                >
                                  <TableCell>
                                    <p>{`Costo por Licencia de Windows para servidor de  ${item.cores} nucleos y ${item.ram} GB RAM`}</p>
                                  </TableCell>
                                  <TableCell align="right">
                                    <p>
                                      {
                                        // currencyFormat(winlincprices[pricekey])
                                        currencyFormat(item.cores * 384.69) //factor precio desde winlincprices()
                                      }
                                    </p>
                                  </TableCell>
                                </TableRow>
                              ) : (
                                <TableRow
                                  key={`licvm${index}`}
                                  className="dynamicValues"
                                >
                                  <TableCell>
                                    <p>{`Costo por licencia de Windows para servidor de virtualizacion (${item.cpu} nucleos,  ${item.ram}  GB RAM)`}</p>
                                  </TableCell>
                                  <TableCell align="right">
                                    <p>
                                      {
                                        currencyFormat(item.cpu * 384.69) //factor precio desde winlincprices()
                                      }
                                    </p>
                                  </TableCell>
                                </TableRow>
                              );
                            })}

                          <TableRow className="totales">
                            <TableCell>
                              <p>Costo total por Software en el tiempo</p>
                            </TableCell>
                            <TableCell align="right">
                              <p>{currencyFormat(totalSwCostTime)}</p>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </div>
              </Grid>
              <Grid item xs={6}></Grid>
              {/*Costos por Bases de Datos */}
              <Grid item xs={6}>
                <div style={{ margin: "2rem 2rem 0 2rem" }}>
                  <Paper className="paper">
                    <Toolbar>
                      <h5>Database Costs</h5>
                    </Toolbar>
                    <TableContainer>
                      <Table aria-label="simple table" className="projects">
                        <TableHead>
                          <TableRow>
                            <TableCell>Descripcion</TableCell>
                            <TableCell align="right">Costo</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>
                              <p>SQL Standard License Cost per 2 Cores</p>
                            </TableCell>
                            <TableCell align="right">
                              <p>{currencyFormat(dbCosts.sqlStd2core)}</p>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <p>Total Standard Instances</p>
                            </TableCell>
                            <TableCell align="right">
                              <p>{totalStdCores}</p>
                            </TableCell>
                          </TableRow>

                          <TableRow>
                            <TableCell>
                              <p>SQL Enterprise License Cost per 2 Cores</p>
                            </TableCell>
                            <TableCell align="right">
                              <p>{currencyFormat(dbCosts.sqlEnt2core)}</p>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <p>Total Enterprise Instances</p>
                            </TableCell>
                            <TableCell align="right">
                              <p>{totalEntCores}</p>
                            </TableCell>
                          </TableRow>
                          <TableRow className="totales">
                            <TableCell>
                              <p>Total License Costs</p>
                            </TableCell>
                            <TableCell align="right">
                              <p>{currencyFormat(totalDBCost)}</p>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </div>
              </Grid>
              {/*Costos de Bases de datos Azure*/}
              <Grid item xs={6}>
                <div style={{ margin: "2rem 2rem 0 2rem" }}>
                  <Paper className="paper">
                    <Toolbar>
                      <h5>Database Costs</h5>
                    </Toolbar>
                    <TableContainer>
                      <Table aria-label="simple table" className="projects">
                        <TableHead>
                          <TableRow>
                            <TableCell>Description</TableCell>
                            <TableCell align="right">Value</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>
                              <p>Number of Instances</p>
                            </TableCell>
                            <TableCell align="right">
                              <p>{DBs.length}</p>
                            </TableCell>
                          </TableRow>
                          {DBs.map((item, index) => {
                            return (
                              <TableRow
                                key={`dbs${index}`}
                                className="dynamicValues"
                              >
                                <TableCell>
                                  <p>{dbType[item.type]}</p>
                                </TableCell>
                                <TableCell align="right">
                                  <p>
                                    {currencyFormat(
                                      dbCloudpriceshr[item.type] * 24 * 30
                                    )}
                                    /Month
                                  </p>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                          <TableRow className="totales">
                            <TableCell>
                              <p>Total Database Cost over time</p>
                            </TableCell>
                            <TableCell align="right">
                              <p>
                                {currencyFormat(rentdb)}/{years} years
                              </p>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </div>
              </Grid>
              {/*Costos por virtualizacion */}
              <Grid item xs={6}>
                <div style={{ margin: "2rem 2rem 0 2rem" }}>
                  <Paper className="paper">
                    <Toolbar>
                      <h5>Virtualizacion Costs</h5>
                    </Toolbar>
                    <TableContainer>
                      <Table aria-label="simple table" className="projects">
                        <TableHead>
                          <TableRow>
                            <TableCell>Description</TableCell>
                            <TableCell align="right">Cost</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>
                              <p>Virtualization License Cost (VMWare)</p>
                            </TableCell>
                            <TableCell align="right">
                              <p>{currencyFormat(vmCosts.licvmware)}</p>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <p>
                                {/* Costo de la maquina virtual por mes */}
                                VM Administration Cost
                              </p>
                            </TableCell>
                            <TableCell align="right">
                              <p>{currencyFormat(vmCosts.costpermachine)}</p>
                            </TableCell>
                          </TableRow>

                          {/* <TableRow>
                            <TableCell>
                              <p>Cantidad de VMs</p>
                            </TableCell>
                            <TableCell align="right">
                              <p>
                                {
                                  servers
                                    .concat(DBs)
                                    .filter((item) => item.enviroment === "vm")
                                    .length
                                }
                              </p>
                            </TableCell>
                          </TableRow> */}
                          <TableRow className="totales">
                            <TableCell>
                              {/* <p>Costo total Licencias VMware el Tiempo</p> */}
                              <p>Total Cost</p>
                            </TableCell>
                            <TableCell align="right">
                              <p>{currencyFormat(totalVmLicCost)}</p>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </div>
              </Grid>

              <Grid item xs={6}></Grid>
              {/*Costos por Redes*/}
              <Grid item xs={6}>
                <div style={{ margin: "2rem 2rem 0 2rem" }}>
                  <Paper className="paper">
                    <Toolbar>
                      <h5>Costos por Redes</h5>
                    </Toolbar>
                    <TableContainer>
                      <Table aria-label="simple table" className="projects">
                        <TableHead>
                          <TableRow>
                            <TableCell>Descripcion</TableCell>
                            <TableCell align="right">Costo</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>
                              <p>Costo total por hardware y software</p>
                            </TableCell>
                            <TableCell align="right">
                              <p>
                                {(
                                  totalHwCostTime + totalSwCostTime
                                ).toLocaleString("en")}
                              </p>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <p>
                                Coste total de hardware y software de red (15%
                                del costo total de Hardware y Software)
                              </p>
                            </TableCell>
                            <TableCell align="right">
                              <p>
                                {(
                                  (totalHwCostTime + totalSwCostTime) *
                                  0.15
                                ).toLocaleString("en")}
                              </p>
                            </TableCell>
                          </TableRow>

                          <TableRow>
                            <TableCell>
                              <p>
                                Costo total por mantenimiento de los equipos de
                                red (15% del coso total de Hardware y Software
                                de red)
                              </p>
                            </TableCell>
                            <TableCell align="right">
                              <p>
                                {(
                                  (totalHwCostTime + totalSwCostTime) *
                                  0.0225
                                ).toLocaleString("en")}
                              </p>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <p>Cantidad de GB solicitado</p>
                            </TableCell>
                            <TableCell align="right">
                              <p>{netbw}</p>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <p>Costo del proveedor de servicio por GB</p>
                            </TableCell>
                            <TableCell align="right">
                              <p>{netprice.toLocaleString("en")}</p>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <p>Costo por la totaldiad de GB solicitados</p>
                            </TableCell>
                            <TableCell align="right">
                              <p>{(netprice * netbw).toLocaleString("en")}</p>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <p>Costo total en el tiempo</p>
                            </TableCell>
                            <TableCell align="right">
                              <p>{costRed.toLocaleString("en")}</p>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </div>
              </Grid>
              {/*Azure Networking Cost */}
              <Grid item xs={6}>
                <div style={{ margin: "2rem 2rem 0 2rem" }}>
                  <Paper className="paper">
                    <Toolbar>
                      <h5>Costos por Redes</h5>
                    </Toolbar>
                    <TableContainer>
                      <Table aria-label="simple table" className="projects">
                        <TableHead>
                          <TableRow>
                            <TableCell>Descripcion</TableCell>
                            <TableCell align="right">Costo</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>
                              <p>Total Outgoing bandwidth por mes en (GB)</p>
                            </TableCell>
                            <TableCell align="right">
                              <p>{netbw}</p>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <p>Costo por mes por GB</p>
                            </TableCell>
                            <TableCell align="right">
                              <p>{(0.076).toLocaleString("en")}</p>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <p>Renta Total</p>
                            </TableCell>
                            <TableCell align="right">
                              <p>{netcloud.toLocaleString("en")}</p>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </div>
              </Grid>
              {/*Costos por Infraestructura de Datacenter */}
              <Grid item xs={6}>
                <div style={{ margin: "2rem 2rem 0 2rem" }}>
                  <Paper className="paper">
                    <Toolbar>
                      <h5>Costos por Infraestructura de Datacenter</h5>
                    </Toolbar>
                    <TableContainer>
                      <Table aria-label="simple table" className="projects">
                        <TableHead>
                          <TableRow>
                            <TableCell>Descripcion</TableCell>
                            <TableCell align="right">Costo</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>
                              <p>
                                Costo por instalacion de equipos en el Rack (por
                                unidad DAS o SAN)(Annual)
                              </p>
                            </TableCell>
                            <TableCell align="right">
                              <p>{Number(1511.35).toLocaleString("en")}</p>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <p>Computo del datacenter</p>
                            </TableCell>
                            <TableCell align="right">
                              <p>{Number(2115.89).toLocaleString("en")}</p>
                            </TableCell>
                          </TableRow>

                          <TableRow className="totales">
                            <TableCell>
                              <p>Costo total de datacenter</p>
                            </TableCell>
                            <TableCell align="right">
                              <p>{costInfData.toLocaleString("en")}</p>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </div>
              </Grid>
              {/*Costos por Azure datacenter*/}
              <Grid item xs={6}>
                <div style={{ margin: "2rem 2rem 0 2rem" }}>
                  <Paper className="paper">
                    <Toolbar>
                      <h5>Costos por Infraestructura de Datacenter</h5>
                    </Toolbar>
                    <TableContainer>
                      <Table aria-label="simple table" className="projects">
                        <TableHead>
                          <TableRow>
                            <TableCell>Descripcion</TableCell>
                            <TableCell align="right">Costo</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow className="totales">
                            <TableCell>
                              <p>
                                {`Costos por Infraestructura de Datacenter en ${years} años`}{" "}
                              </p>
                            </TableCell>
                            <TableCell align="right">
                              <p>{datacencloud.toLocaleString("en")}</p>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </div>
              </Grid>
              <Grid item xs={6}>
                <div style={{ margin: "2rem 2rem 0 2rem" }}>
                  <Paper className="paper">
                    <Toolbar>
                      <h5>Electricity Cost</h5>
                    </Toolbar>
                    <TableContainer>
                      <Table aria-label="simple table" className="projects">
                        <TableHead>
                          <TableRow>
                            <TableCell>Description</TableCell>
                            <TableCell align="right">Value</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>
                              <p>Monthly Electric Load</p>
                            </TableCell>
                            <TableCell align="right">
                              <p>{`${parseFloat(monthlyEnergy).toFixed(
                                2
                              )} KWh/Month`}</p>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              {/* <p>Costo total Licencias VMware el Tiempo</p> */}
                              <p>Monthly Electric Cost</p>
                            </TableCell>
                            <TableCell align="right">
                              <p>
                                {currencyFormat(powerCost(monthlyEnergy))}
                                /Month
                              </p>
                            </TableCell>
                          </TableRow>
                          <TableRow className="totales">
                            <TableCell>
                              {/* <p>Costo total Licencias VMware el Tiempo</p> */}
                              <p>Total Cost</p>
                            </TableCell>
                            <TableCell align="right">
                              <p>
                                {currencyFormat(
                                  powerCost(monthlyEnergy) * 12 * years
                                )}
                                /{years} years
                              </p>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </div>
              </Grid>
              <Grid item xs={6}></Grid>
              {/*Costos por Almacenamiento*/}
              <Grid item xs={6}>
                <div style={{ margin: "2rem 2rem 0 2rem" }}>
                  <Paper className="paper">
                    <Toolbar>
                      <h5>Costos por Almacenamiento</h5>
                    </Toolbar>
                    <TableContainer>
                      <Table aria-label="simple table" className="projects">
                        <TableHead>
                          <TableRow>
                            <TableCell>Descripcion</TableCell>
                            <TableCell align="right">Costo</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {/* <TableRow>
                            <TableCell>
                              <p>Costo total por GB</p>
                            </TableCell>
                            <TableCell align="right">
                              <p>{(0.4).toLocaleString("en")}</p>
                            </TableCell>
                          </TableRow> */}
                          {storage.map((item, index) => {
                            return (
                              <TableRow
                                key={`storagephy${index}`}
                                className="dynamicValues"
                              >
                                <TableCell>
                                  <p>{`${storageKeywords[item.type]} (${
                                    item.capacity
                                  } ${item.unit.toUpperCase()})`}</p>
                                </TableCell>
                                <TableCell align="right">
                                  <p>{currencyFormat(storageOnPrem(item))}</p>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                          <TableRow>
                            <TableCell>
                              <p>Storage Maintenance Costs</p>
                            </TableCell>
                            <TableCell align="right">
                              <p>{currencyFormat(storageMaint)}/Month</p>
                            </TableCell>
                          </TableRow>
                          {/* <TableRow>
                            <TableCell>
                              <p>Storage Maintenance Costs over time</p>
                            </TableCell>
                            <TableCell align="right">
                              <p>{currencyFormat(storageMaint * 12 * )}</p>
                            </TableCell>
                          </TableRow> */}
                          <TableRow className="totales">
                            <TableCell>
                              <p>Storage Costs over time</p>
                            </TableCell>
                            <TableCell align="right">
                              <p>
                                {currencyFormat(totalStorageOnPremOverTime)}
                              </p>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </div>
              </Grid>
              {/*Costos por Azure Almacenamiento */}
              <Grid item xs={6}>
                <div style={{ margin: "2rem 2rem 0 2rem" }}>
                  <Paper className="paper">
                    <Toolbar>
                      <h5>Storage Costs</h5>
                    </Toolbar>
                    <TableContainer>
                      <Table aria-label="simple table" className="projects">
                        <TableHead>
                          <TableRow>
                            <TableCell>Description</TableCell>
                            <TableCell align="right">Value</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {storage.map((item, index) => {
                            return (
                              <TableRow
                                key={`privephy${index}`}
                                className="dynamicValues"
                              >
                                <TableCell>
                                  <p>{`${storageKeywords[item.type]} (${
                                    item.capacity
                                  } ${item.unit.toUpperCase()}) with ${
                                    storageKeywords[item.backup]
                                  } backup plan`}</p>
                                </TableCell>
                                <TableCell align="right">
                                  <p>
                                    {currencyFormat(storageOnCloud(item))}/Month
                                  </p>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                          {/* <TableRow>
                            <TableCell>
                              <p>Precio por hora para administracion de TI</p>
                            </TableCell>
                            <TableCell align="right">
                              <p>{(23).toLocaleString("en")}</p>
                            </TableCell>
                          </TableRow> */}
                          <TableRow className="totales">
                            <TableCell>
                              <p>Storage Costs over time</p>
                            </TableCell>
                            <TableCell align="right">
                              <p>
                                {currencyFormat(totalStorageCloudOverTime)}/
                                {years} years
                              </p>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </div>
              </Grid>
              {/*Costos por personal de TI onpremise*/}
              <Grid item xs={6}>
                <div style={{ margin: "2rem 2rem 0 2rem" }}>
                  <Paper className="paper">
                    <Toolbar>
                      <h5>Costos por personal de TI</h5>
                    </Toolbar>
                    <TableContainer>
                      <Table aria-label="simple table" className="projects">
                        <TableHead>
                          <TableRow>
                            <TableCell>Descripcion</TableCell>
                            <TableCell align="right">Costo</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>
                              <p>
                                Cantidad de empleados para administracion de TI
                              </p>
                            </TableCell>
                            <TableCell align="right">
                              <p>{team.length}</p>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <p>
                                Total de Salarios Anual para administracion de
                                TI
                              </p>
                            </TableCell>
                            <TableCell align="right">
                              <p>{currencyFormat(totalTeamPay)}</p>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <p>Costo total en el tiempo</p>
                            </TableCell>
                            <TableCell align="right">
                              <p>{currencyFormat(totalTeamPay * years)}</p>
                            </TableCell>
                          </TableRow>
                          {/* <TableRow>
                            <TableCell>
                              <p>
                                Cantidad de horas necesarias por año para
                                administracion de TI
                              </p>
                            </TableCell>
                            <TableCell align="right">
                              <p>{(76.67).toLocaleString("en")}</p>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <p>Precio por hora para administracion de TI</p>
                            </TableCell>
                            <TableCell align="right">
                              <p>{(23).toLocaleString("en")}</p>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <p>Costo total en el tiempo</p>
                            </TableCell>
                            <TableCell align="right">
                              <p>{itonpremise.toLocaleString("en")}</p>
                            </TableCell>
                          </TableRow> */}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </div>
              </Grid>
              {/*Costos por personal de TI AZURE */}
              <Grid item xs={6}>
                <div style={{ margin: "2rem 2rem 0 2rem" }}>
                  <Paper className="paper">
                    <Toolbar>
                      <h5>Costos por personal de TI</h5>
                    </Toolbar>
                    <TableContainer>
                      <Table aria-label="simple table" className="projects">
                        <TableHead>
                          <TableRow>
                            <TableCell>Descripcion</TableCell>
                            <TableCell align="right">Costo</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>
                              <p>
                                Cantidad de horas necesarias por año para
                                administracion de TI
                              </p>
                            </TableCell>
                            <TableCell align="right">
                              <p>50</p>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <p>Precio por hora para administracion de TI</p>
                            </TableCell>
                            <TableCell align="right">
                              <p>{(23).toLocaleString("en")}</p>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <p>Costo total en el tiempo</p>
                            </TableCell>
                            <TableCell align="right">
                              <p>{itcloud.toLocaleString("en")}</p>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </div>
              </Grid>
              {/*Costo total de Infraestrcutura on-premise en el tiempo establecio*/}
              <Grid item xs={6}>
                <div style={{ margin: "2rem 2rem 0 2rem" }}>
                  <Paper className="paper">
                    <Toolbar>
                      <h5>
                        Costo total de Infraestrcutura on-premise en el tiempo
                        establecido
                      </h5>
                    </Toolbar>
                    <TableContainer>
                      <Table aria-label="simple table" className="projects">
                        <TableHead>
                          <TableRow>
                            <TableCell>Costo total en el tiempo</TableCell>
                            <TableCell align="right">
                              {currencyFormat(onpremiseProjectTotal)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            {ProjectRadialGraph(onpremiseProjectTotal, [
                              {
                                label: "Server Costs",
                                amount: totalHwCostTime,
                                color: "#65C1E8",
                              },
                              {
                                label: "Software License Costs",
                                amount: totalSwCostTime,
                                color: "#D85B63",
                              },
                              {
                                label: "VM License Costs",
                                amount: totalVmLicCost,
                                color: "#D680AD",
                              },
                              {
                                label: "Database Costs",
                                amount: totalDBCost,
                                color: "#5C5C5C",
                              },
                              {
                                label: "Networking Costs",
                                amount: costRed,
                                color: "#FDC47D",
                              },
                              {
                                label: "Infrastructure Costs",
                                amount: costInfData,
                                color: "#C0BA80",
                              },
                              {
                                label: "Storage Costs",
                                amount: totalStorageOnPremOverTime,
                              },
                              {
                                label: "IT Management Team Costs",
                                amount: totalTeamPay * years,
                                color: "#17406E",
                              },

                              {
                                label: "Electric Costs",
                                amount:
                                  // powerCost(monthlyEnergy * 4 * 1000) *
                                  monthlyEnergy * 12 * years,
                                color: "#FDD017",
                              },
                            ])}
                          </TableRow>
                        </TableHead>
                      </Table>
                    </TableContainer>
                  </Paper>
                </div>
              </Grid>
              {/*Costo total de Infraestrcutura nube en el tiempo establecido */}
              <Grid item xs={6}>
                <div style={{ margin: "2rem 2rem 0 2rem" }}>
                  <Paper className="paper">
                    <Toolbar>
                      <h5>
                        Costo total de Infraestrcutura en la nube en el tiempo
                        establecido
                      </h5>
                    </Toolbar>
                    <TableContainer>
                      <Table aria-label="simple table" className="projects">
                        <TableHead>
                          <TableRow>
                            <TableCell>Costo total en el tiempo</TableCell>
                            <TableCell align="right">
                              {currencyFormat(cloudProjectTotal)}
                            </TableCell>
                          </TableRow>
                          {/* <TableRow>
                            
                          </TableRow> */}
                        </TableHead>
                      </Table>
                    </TableContainer>
                    {ProjectRadialGraph(cloudProjectTotal, [
                      {
                        label: "Virtual Machine Costs",
                        amount: rentvms * years,
                        color: "#65C1E8",
                      },
                      {
                        label: "Storage Costs",
                        amount: totalStorageCloudOverTime,
                        // color: "#D85B63",
                      },
                      // {
                      //   label: "VM Licenses Costs",
                      //   amount: netcloud,
                      //   color: "#D680AD",
                      // },
                      {
                        label: "Databases Costs",
                        amount: rentdb,
                        color: "#5C5C5C",
                      },
                      {
                        label: "Infrastructure Costs",
                        amount: datacencloud,
                        color: "#C0BA80",
                      },
                      {
                        label: "Cloud Networking Costs",
                        amount: netcloud,
                        color: "#FDC47D",
                      },
                      {
                        label: "IT Management Team Costs",
                        amount: itcloud,
                        color: "#17406E",
                      },
                    ])}
                  </Paper>
                </div>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </div>
  );
};

const dbCloudpriceshr = {
  mssql: 0.10083,
  postgres: 0.0816,
  mysql: 0.0816,
};

const vmCosts = {
  licvmware: 1268,
  costpermachine: 26.52,
};
const dbCosts = {
  sqlEnt2core: 14256,
  sqlStd2core: 3717,
  saEnt2core: 3546,
  saStd2core: 929.25,
};

const powerCost = (kwh) => {
  const usd = (val) => val / 60;
  if (kwh <= 200) {
    return kwh * usd(4.4);
  } else if (kwh <= 300) {
    return 200 * usd(4.4) + (kwh - 200) * usd(6.97);
  } else if (kwh <= 700) {
    return 200 * usd(4.4) + 100 * usd(6.97) + (kwh - 300) * usd(10.86);
  } else if (kwh > 700) {
    return kwh * usd(11.1);
  }
};

const storageKeywords = {
  nas: "NAS Device",
  0.0224: "Locally Redundant Storage (LRS)",
  0.0448: "Geo-Redundant Storage (GRS)",
  0.0569: "Read-Access Geo-Redundant Storage (RA-GRS)",
  "": "",
};

export default ReportPage;
