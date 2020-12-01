import { combineReducers } from "redux";

import userReducer from "./User/user.reducer";
import projectReducer from "./Project/project.reducer";

export default combineReducers({
  user: userReducer,
  projectData: projectReducer,
});
