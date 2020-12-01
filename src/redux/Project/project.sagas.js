import { auth } from "./../../firebase/utils";
import { takeLatest, put, all, call } from "redux-saga/effects";
import projectTypes from "./project.types";
import {
  handleAddProject,
  handleFetchProjects,
  handleDeleteProject,
  handleAddAppliances,
  handleAddDatabases,
  handleAddStorage,
  handleAddVMs,
  handleFetchPowerValues,
  handleUpdateProjectProp,
  handleAddSensor,
  handleDeleteSensor,
} from "./project.helpers";
import {
  setProjects,
  fetchProjectsStart,
  fetchPowerValuesStart,
  setCurrentPowerValues,
} from "./project.actions";
export function* addProject({
  // payload: { projectCategory, projectName, projectThumbnail, projectPrice },
  payload: { projectName, projectCompany, projectContact },
}) {
  try {
    const timestamp = new Date();
    yield handleAddProject({
      projectName,
      projectCompany,
      projectContact,
      projectAdminUID: auth.currentUser.uid,
      createdDate: timestamp,
      netbw: 100,
      power: [],
      equipos: [],
      storage: [],
      databases: [],
      vms: [],
      years: 5,
      netprice: 0.15,
    });
    yield put(fetchProjectsStart());
  } catch (error) {
    // console.log(error)
  }
}

export function* onAddProjectStart() {
  yield takeLatest(projectTypes.ADD_NEW_PROJECT_START, addProject);
}

export function* fetchProjects() {
  try {
    const projects = yield handleFetchProjects();
    yield put(setProjects(projects));
  } catch (error) {
    // console.log(error)
  }
}

export function* onFetchProjectsStart() {
  yield takeLatest(projectTypes.FETCH_PROJECTS_START, fetchProjects);
}

export function* deleteProject({ payload }) {
  try {
    yield handleDeleteProject(payload);
    yield put(fetchProjectsStart());
  } catch (error) {
    // console.log(error)
  }
}

export function* onDeleteProjectStart() {
  yield takeLatest(projectTypes.DELETE_PROJECT_START, deleteProject);
}

export function* updateAppliances({ payload: { id, appliances } }) {
  try {
    console.log(`firepayload->${"id"}`);
    console.log("next object");
    // console.log(payload);
    yield handleAddAppliances(id, appliances);
    yield put(fetchProjectsStart());
  } catch (error) {
    // console.log(error)
  }
}

export function* onUpdateAppliancesStart() {
  yield takeLatest(projectTypes.UPDATE_APPLIANCES_START, updateAppliances);
}

export function* updateDatabases({ payload: { id, databases } }) {
  try {
    console.log(`firepayload->${"id"}`);
    console.log("next object");
    // console.log(payload);
    yield handleAddDatabases(id, databases);
    yield put(fetchProjectsStart());
  } catch (error) {
    // console.log(error)
  }
}

export function* onUpdateDatabasesStart() {
  yield takeLatest(projectTypes.UPDATE_DATABASES_START, updateDatabases);
}

export function* updateVMs({ payload: { id, vms } }) {
  try {
    console.log(`firepayload->${"id"}`);
    console.log("next object");
    // console.log(payload);
    yield handleAddVMs(id, vms);
    yield put(fetchProjectsStart());
  } catch (error) {
    // console.log(error)
  }
}

export function* onUpdateVMsStart() {
  yield takeLatest(projectTypes.UPDATE_VMS_START, updateVMs);
}

export function* updateStorage({ payload: { id, storage } }) {
  try {
    console.log(`firepayload->${"id"}`);
    console.log("next object");
    // console.log(payload);
    yield handleAddStorage(id, storage);
    yield put(fetchProjectsStart());
  } catch (error) {
    // console.log(error)
  }
}

export function* onUpdateStorageStart() {
  yield takeLatest(projectTypes.UPDATE_STORAGE_START, updateStorage);
}

export function* fetchPowerValues({ payload }) {
  try {
    console.log("hashdjksahdhkasd");
    console.log(payload);
    const powerValues = yield handleFetchPowerValues(payload);

    console.log("sagaaaaa");
    yield put(setCurrentPowerValues(powerValues));
  } catch (error) {
    // console.log(error)
  }
}

export function* onFetchPowerValuesStart() {
  yield takeLatest(projectTypes.FETCH_POWER_VALUES_START, fetchPowerValues);
}

export function* updateProyectProp({ payload: { id, prop, value } }) {
  try {
    yield handleUpdateProjectProp(id, prop, value);
    yield put(fetchProjectsStart());
  } catch (error) {
    // console.log(error)
  }
}

export function* onupdateProyectPropStart() {
  yield takeLatest(projectTypes.UPDATE_PROJECT_PROPERTY, updateProyectProp);
}

export function* addSensor({ payload: { projectID, params } }) {
  try {
    yield handleAddSensor(projectID, params);

    // yield put(fetchPowerValuesStart());

    // yield put(fetchProjectsStart());
  } catch (error) {
    // console.log(error)
  }
}

export function* onAddSensorStart() {
  yield takeLatest(projectTypes.ADD_NEW_SENSOR_START, addSensor);
}

export function* deleteSensor({ payload: { projectID, sensorID } }) {
  try {
    yield handleDeleteSensor(projectID, sensorID);
    // yield put(fetchProjectsStart());
  } catch (error) {
    // console.log(error)
  }
}

export function* onDeleteSensorStart() {
  yield takeLatest(projectTypes.DELETE_SENSOR_START, deleteSensor);
}

export default function* projectSagas() {
  yield all([
    call(onAddProjectStart),
    call(onFetchProjectsStart),
    call(onDeleteProjectStart),
    call(onUpdateAppliancesStart),
    call(onUpdateDatabasesStart),
    call(onUpdateStorageStart),
    call(onUpdateVMsStart),
    call(onFetchPowerValuesStart),
    call(onupdateProyectPropStart),
    call(onAddSensorStart),
    call(onDeleteSensorStart),
  ]);
}
