import classes from "../Main.module.scss";
import Button from "../../../components/Button/Button";
import React from "react";
import {mainMenuScreens} from "../Main";

interface ICreditsProps {
    setCurrentScreen: (screen: mainMenuScreens) => void
}

const Credits = ({setCurrentScreen}: ICreditsProps) => {
    return <div className={classes.screenContainer}>
        <h2>Nothing to see here</h2>
        <h2>yet...</h2>
        <Button onClick={() => setCurrentScreen('MAIN')} className={classes.button}>
            BACK
        </Button>
    </div>
}

export default Credits