import React, { useEffect } from "react";
import "./styles.scss";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  fetchProjectsStart,
  setProjectId,
  setCurrentPowerValues,
} from "./../../redux/Project/project.actions";
import {
  TableCell,
  TableRow,
  TableHead,
  Table,
  TableContainer,
  TableBody,
} from "@material-ui/core/";
const mapState = ({ projectData }) => ({
  projects: projectData.projects,
});

const Dashboard = (props) => {
  const history = useHistory();
  const { projects } = useSelector(mapState);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchProjectsStart());
    dispatch(setCurrentPowerValues([]));
  }, []);

  const handleOpenProject = (id) => {
    dispatch(setProjectId(id));
    history.push(`/dashboard/${id}`);
  };

  return (
    <div style={{ maxHeight: "100vh", overflow: "auto" }}>
      <TableContainer>
        <Table aria-label="simple table" className="projects">
          <TableHead>
            <TableRow>
              <TableCell>Project</TableCell>
              <TableCell align="right">Company</TableCell>
              <TableCell align="right">Contact</TableCell>
              <TableCell align="right">Project ID</TableCell>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
    // <>
    //   <Grid container spacing={2}>
    //     {projects.map((elem) => (
    //       <Grid item xs={12} sm={6} md={3} key={elem.documentID}>
    //         <Card>
    //           <CardActionArea
    //             onClick={() => console.log(`${elem.projectName}-> to details`)}
    //           >
    //             <CardHeader
    //               style={{ flex: "1 0 auto" }}
    //               title={`${elem.projectName}`}
    //               subheader={`${elem.projectCompany}`}
    //               avatar={
    //                 <Avatar
    //                   aria-label="recipe"
    //                   alt={`${elem.projectName}`}
    //                   // src=""
    //                 />
    //               }
    //               // action={
    //               //   <IconButton
    //               //     aria-label="settings"
    //               //     onClick={() =>
    //               //       console.log(`${elem.projectName}: menu click`)
    //               //     }
    //               //   >
    //               //     <MoreVertIcon />
    //               //   </IconButton>
    //               // }
    //             />
    //             <CardContent>
    //               <Typography>{`${elem.projectName}`}</Typography>
    //             </CardContent>
    //             <CardMedia>
    //               <Avatar
    //                 aria-label="recipe"
    //                 alt={`${elem.projectName}`}
    //                 // src=""
    //               />
    //             </CardMedia>
    //           </CardActionArea>
    //           {/* <CardContent>
    //           <Typography variant="h5" gutterBottom>
    //             Hello World
    //           </Typography>
    //         </CardContent> */}
    //         </Card>
    //       </Grid>
    //     ))}
    //   </Grid>
    // </>
  );
};

export default Dashboard;
