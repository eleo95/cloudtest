import React from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { signOutUserStart } from "./../redux/User/user.actions";

import Header from "./../components/Header";
import VerticalNav from "./../components/VerticalNav";
import Footer from "./../components/Footer";
import { BrowserView, MobileView, isMobile } from "react-device-detect";
import Icon from "@material-ui/core/Icon";

const DashBoardLayout = (props) => {
  const dispatch = useDispatch();

  const signOut = () => {
    dispatch(signOutUserStart());
  };

  return (
    <div className="dashboardLayout">
      <Header {...props} />
      <div
        className="controlPanel"
        style={isMobile === true ? { padding: "0 0 0 5rem" } : {}}
      >
        <BrowserView>
          <div className="sidebar">
            <VerticalNav>
              <ul>
                <li>
                  <Link to="/dashboard">Home</Link>
                </li>
                <li>
                  <span className="signOut" onClick={() => signOut()}>
                    Sign Out
                  </span>
                </li>
              </ul>
            </VerticalNav>
          </div>
        </BrowserView>
        <MobileView>
          <div className="sidebar" style={{ width: "6rem" }}>
            <VerticalNav>
              <Link to="/dashboard">
                <Icon
                  style={{
                    fontSize: "5rem",
                    margin: ".5rem auto",
                    color: "black",
                  }}
                >
                  home
                </Icon>
              </Link>

              <Icon
                style={{
                  fontSize: "5rem",
                  margin: ".5rem auto",
                  cursor: "pointer",
                }}
                onClick={() => signOut()}
              >
                exit_to_app
              </Icon>
            </VerticalNav>
          </div>
        </MobileView>
        <div className="content">{props.children}</div>
      </div>
      <Footer />
    </div>
  );
};

export default DashBoardLayout;
