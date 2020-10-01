import {
  Box,
  Card,
  CardContent,
  Grid,
  IconButton,
  makeStyles,
  Typography,
} from "@material-ui/core";
import React from "react";
import CancelIcon from "@material-ui/icons/Cancel";
import { OperatorGoalData } from "../operator-goals";
import ItemStack from "./ItemStack";

const useStyles = makeStyles((theme) => ({
  deleteIconButton: {
    position: "absolute",
    top: theme.spacing(-3),
    right: theme.spacing(-3),
  },
  goalOuterGridContainer: {
    alignItems: "center",
  },
}));

interface GoalProps {
  goal: OperatorGoalData;
  onDelete: (goal: OperatorGoalData) => void;
}

export default function Goal(props: GoalProps): React.ReactElement {
  const { goal, onDelete } = props;
  const classes = useStyles();
  return (
    <Box mb={1} position="relative">
      <Card>
        <CardContent>
          <Grid container className={classes.goalOuterGridContainer}>
            <Grid item xs={3} md={2} lg={4}>
              <Box alignSelf="center">
                <Typography component="h4" variant="h5">
                  {goal.operatorName}
                </Typography>
                <Typography component="h5" variant="subtitle1">
                  {goal.name}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={8}>
              <Grid container>
                {goal.requiredItems.map((item) => (
                  <Grid item xs={3} md={2} lg={3} key={item.name}>
                    <ItemStack
                      name={item.name}
                      quantity={item.quantity}
                      size={75}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
          <IconButton
            aria-label="Delete this goal"
            className={classes.deleteIconButton}
            onClick={() => onDelete(goal)}
          >
            <CancelIcon />
          </IconButton>
        </CardContent>
      </Card>
    </Box>
  );
}
