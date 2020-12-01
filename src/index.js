import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/createStore";
import { ToastProvider } from "react-toast-notifications";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import App from "./App";

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#000000",
    },
    secondary: {
      main: "#FFFFFF",
    },
  },
});
ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <ToastProvider placement="top-left">
        <BrowserRouter>
          <MuiThemeProvider theme={theme}>
            <App />
          </MuiThemeProvider>
        </BrowserRouter>
      </ToastProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
