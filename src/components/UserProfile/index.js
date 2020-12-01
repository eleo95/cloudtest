import React from "react";
import "./styles.scss";
import userIMG from "./../../assets/user.png";
import { BrowserView, MobileView, isMobile } from "react-device-detect";
const UserProfile = (props) => {
  const { currentUser } = props;
  const { displayName } = currentUser;

  return (
    <div className="userProfile">
      <BrowserView>
        <ul>
          <li>
            <div className="img">
              <img src={userIMG} />
            </div>
          </li>
          <li>
            <span className="displayName">{displayName && displayName}</span>
          </li>
        </ul>
      </BrowserView>
      <MobileView>
        <img src={userIMG} style={{ width: "5rem", margin: ".5rem auto" }} />
      </MobileView>
    </div>
  );
};

export default UserProfile;
