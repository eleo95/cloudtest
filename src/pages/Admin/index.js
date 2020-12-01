import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Redirect, useHistory } from "react-router-dom";
import {
  addProjectStart,
  fetchProjectsStart,
  deleteProjectStart,
  setProjectId,
  setCurrentPowerValues,
} from "./../../redux/Project/project.actions";
import Modal from "./../../components/Modal";
import FormInput from "./../../components/forms/FormInput";
import Button from "./../../components/forms/Button";
import {
  TableCell,
  TableRow,
  TableHead,
  Table,
  TableContainer,
  TableBody,
} from "@material-ui/core/";
import "./styles.scss";

const mapState = ({ projectData }) => ({
  projects: projectData.projects,
});

const Admin = (props) => {
  const { projects } = useSelector(mapState);
  const history = useHistory();
  const dispatch = useDispatch();
  const [hideModal, setHideModal] = useState(true);
  const [projectName, setProjectName] = useState("");
  const [projectCompany, setProjectCompany] = useState("");
  const [projectContact, setProjectContact] = useState("");

  useEffect(() => {
    dispatch(fetchProjectsStart());
    dispatch(setCurrentPowerValues([]));
  }, []);

  const toggleModal = () => setHideModal(!hideModal);

  const configModal = {
    hideModal,
    toggleModal,
  };

  const resetForm = () => {
    setHideModal(true);
    setProjectName("");
    setProjectCompany("");
    setProjectContact("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    dispatch(
      addProjectStart({
        projectName,
        projectCompany,
        projectContact,
      })
    );
    resetForm();
  };

  const handleOpenProject = (id) => {
    dispatch(setProjectId(id));
    history.push(`/dashboard/${id}`);
  };

  return (
    <div className="admin">
      <div className="callToActions">
        <ul>
          <li>
            <Button onClick={() => toggleModal()}>Add new project</Button>
          </li>
        </ul>
      </div>

      <Modal {...configModal}>
        <div className="addNewProjectForm">
          <form onSubmit={handleSubmit}>
            <h2>Add new project</h2>

            <FormInput
              label="Name"
              type="text"
              value={projectName}
              handleChange={(e) => setProjectName(e.target.value)}
            />

            <FormInput
              label="Company"
              type="text"
              value={projectCompany}
              handleChange={(e) => setProjectCompany(e.target.value)}
            />

            <FormInput
              label="Contact"
              type="text"
              value={projectContact}
              handleChange={(e) => setProjectContact(e.target.value)}
            />

            <Button type="submit">Add project</Button>
          </form>
        </div>
      </Modal>

      <div className="manageProjects">
        {/* <table border="0" cellPadding="0" cellSpacing="0">
          <tbody>
            <tr>
              <th>
                <h1>Manage Projects</h1>
              </th>
            </tr>
            <tr>
              <td>
                <table
                  className="results"
                  border="0"
                  cellPadding="10"
                  cellSpacing="0"
                >
                  <tbody>
                    {projects.map((project, index) => {
                      const {
                        projectName,
                        projectCompany,
                        projectContact,
                        documentID,
                      } = project;

                      return (
                        <tr key={index}>
                          <td onClick={() => handleOpenProject(documentID)}>
                            {projectName}
                          </td>
                          <td>{projectCompany}</td>
                          <td>{projectContact}</td>
                          <td>
                            <Button
                              onClick={() =>
                                dispatch(deleteProjectStart(documentID))
                              }
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table> */}

        <TableContainer>
          <Table aria-label="simple table" className="projects">
            <TableHead>
              <TableRow>
                <TableCell>Project</TableCell>
                <TableCell align="right">Company</TableCell>
                <TableCell align="right">Contact</TableCell>
                <TableCell align="right">Project ID</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.map((row, index) => (
                <TableRow key={index} hover={true}>
                  <TableCell
                    scope="row"
                    onClick={() => handleOpenProject(row.documentID)}
                  >
                    <p>{row.projectName}</p>
                  </TableCell>
                  <TableCell align="right">
                    <p>{row.projectCompany}</p>
                  </TableCell>
                  <TableCell align="right">
                    <p>{row.projectContact}</p>
                  </TableCell>
                  <TableCell align="right">
                    <p>{row.documentID}</p>
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      onClick={() =>
                        dispatch(deleteProjectStart(row.documentID))
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
      </div>
    </div>
  );
};

export default Admin;
