import projectTypes from "./project.types";

const INITIAL_STATE = {
  projects: [],
  currentProject: "",
  currentPowerValues: [],
  projectReport: {},
  zabbixToken: "",
};
const projectReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case projectTypes.SET_PROJECTS:
      return {
        ...state,
        projects: action.payload,
      };
    case projectTypes.SET_CURRENT_PROJECT_ID:
      return {
        ...state,
        currentProject: action.payload,
      };
    case projectTypes.SET_CURRENT_POWER_VALUES:
      return {
        ...state,
        currentPowerValues: action.payload,
      };
    case projectTypes.SET_PROJECT_REPORT:
      return {
        ...state,
        projectReport: action.payload,
      };
    case projectTypes.SET_ZABBIX_TOKEN_START:
      return {
        ...state,
        zabbixToken: action.payload,
      };
    default:
      return state;
  }
};

export default projectReducer;
