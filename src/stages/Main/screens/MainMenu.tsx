import classes from "../Main.module.scss";
import Button from "../../../components/Button/Button";
import React from "react";
import {mainMenuScreens} from "../Main";

interface IMainMenuProps {
    setCurrentScreen: (screen: mainMenuScreens) => void
}

const MainMenu = ({setCurrentScreen}: IMainMenuProps) => {
    return <div className={classes.screenContainer}>
        <Button onClick={() => setCurrentScreen('START')} className={classes.button}>
            START SIMULATION
        </Button>
        <Button onClick={() => setCurrentScreen('HOW_TO')} className={classes.button}>
            SIMULATION PRINCIPLES
        </Button>
        <Button onClick={() => setCurrentScreen('CREDITS')} className={classes.button}>
            CREDITS
        </Button>
    </div>
}

export default MainMenu