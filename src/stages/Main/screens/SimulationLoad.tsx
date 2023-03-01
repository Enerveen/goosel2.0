import React, {useCallback, useState} from "react";
import simulationStore, {SimulationStore} from "../../../stores/simulationStore";
import {validateSimulationConstants} from "../../../utils/validators";
import classes from "../Main.module.scss";
import DragAndDropUploader from "../../../components/DndUpload/DndUpload";
import Notification from "../../../components/Notification/Notification";
import Button from "../../../components/Button/Button";
import {appPhase} from "../../../types";
import {mainMenuScreens} from "../Main";


interface ISimulationLoadProps {
    setAppPhase: (phase: appPhase) => void,
    setCurrentScreen: (screen: mainMenuScreens) => void
}
const SimulationLoad = ({setAppPhase, setCurrentScreen}: ISimulationLoadProps) => {
    const [error, setError] = useState('')
    const onSimLoad = useCallback((data: SimulationStore) => {
        simulationStore.set(data)
        localStorage.setItem('simConstants', JSON.stringify(validateSimulationConstants(data.simulationConstants)))
        setAppPhase('STARTED')
    }, [setAppPhase])

    return <div className={classes.screenContainer}>
        <DragAndDropUploader onFileLoad={onSimLoad} onError={(errorMessage) => setError(errorMessage)}/>
        {error ? <Notification type={'error'} className={classes.notification}>
            {error}
        </Notification> : <></>}
        <Button onClick={() => setCurrentScreen('START')} className={classes.button}>
            BACK
        </Button>
    </div>
}

export default SimulationLoad