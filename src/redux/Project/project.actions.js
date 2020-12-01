import projectTypes from "./project.types";

export const addProjectStart = (projectData) => ({
  type: projectTypes.ADD_NEW_PROJECT_START,
  payload: projectData,
});

export const fetchProjectsStart = () => ({
  type: projectTypes.FETCH_PROJECTS_START,
});

export const setProjects = (projects) => ({
  type: projectTypes.SET_PROJECTS,
  payload: projects,
});

export const deleteProjectStart = (documentID) => ({
  type: projectTypes.DELETE_PROJECT_START,
  payload: documentID,
});

export const setProjectId = (documentID) => ({
  type: projectTypes.SET_CURRENT_PROJECT_ID,
  payload: documentID,
});

export const updateAppliancesStart = (documentID, appliances) => ({
  type: projectTypes.UPDATE_APPLIANCES_START,
  payload: {
    id: documentID,
    appliances: appliances,
  },
});

export const updateDatabasesStart = (documentID, dbs) => ({
  type: projectTypes.UPDATE_DATABASES_START,
  payload: {
    id: documentID,
    databases: dbs,
  },
});

export const updateVMsStart = (documentID, vms) => ({
  type: projectTypes.UPDATE_VMS_START,
  payload: {
    id: documentID,
    vms: vms,
  },
});

export const updateStorageStart = (documentID, storage) => ({
  type: projectTypes.UPDATE_STORAGE_START,
  payload: {
    id: documentID,
    storage: storage,
  },
});

export const fetchPowerValuesStart = (projectID) => ({
  type: projectTypes.FETCH_POWER_VALUES_START,
  payload: projectID,
});

export const setCurrentPowerValues = (power_values) => ({
  type: projectTypes.SET_CURRENT_POWER_VALUES,
  payload: power_values,
});

export const setProjectReport = (project) => ({
  type: projectTypes.SET_PROJECT_REPORT,
  payload: project,
});

export const updateProjectPropStart = (documentID, prop, value) => ({
  type: projectTypes.UPDATE_PROJECT_PROPERTY,
  payload: {
    id: documentID,
    prop,
    value,
  },
});

export const addSensorStart = (projectID, params) => ({
  type: projectTypes.ADD_NEW_SENSOR_START,
  payload: {
    projectID,
    params,
  },
});

export const deleteSensorStart = (projectID, sensorID) => ({
  type: projectTypes.DELETE_SENSOR_START,
  payload: { projectID, sensorID },
});

export const setZabbixToken = (token) => ({
  type: projectTypes.SET_ZABBIX_TOKEN_START,
  payload: token,
});
