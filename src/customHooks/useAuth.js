import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { firebaseConfig } from "../firebase/config";

const mapState = ({ user }) => ({
  currentUser: user.currentUser,
});

const useAuth = (props) => {
  const { currentUser } = useSelector(mapState);
  const history = useHistory();

  useEffect(() => {
    const userSession = `firebase:authUser:${firebaseConfig.apiKey}:[DEFAULT]`;
    if (!currentUser && !sessionStorage.getItem(userSession)) {
      history.push("/login");
    }
  }, [currentUser]);

  return currentUser;
};

export default useAuth;
