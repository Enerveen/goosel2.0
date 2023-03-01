import {appPhase} from "../../../types";
import classes from "../Main.module.scss";
import Button from "../../../components/Button/Button";
import React from "react";
import {mainMenuScreens} from "../Main";

interface ISimulationStartProps {
    setAppPhase: (phase: appPhase) => void,
    setCurrentScreen: (screen: mainMenuScreens) => void
}

const SimulationStart = ({setCurrentScreen}: ISimulationStartProps) => {
    return <div className={classes.screenContainer}>
        <Button onClick={() => setCurrentScreen('START_NEW')} className={classes.button}>
            START A NEW SIM
        </Button>
        <Button onClick={() => setCurrentScreen('START_LOAD')} className={classes.button}>
            LOAD A SIM
        </Button>
        <Button onClick={() => setCurrentScreen('MAIN')} className={classes.button}>
            BACK
        </Button>
    </div>
}

export default SimulationStart