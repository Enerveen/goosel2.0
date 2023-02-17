import React, {memo, useCallback, useState} from "react";
import classes from './Main.module.scss'
import {appPhase} from "../../types";
import SimulationSettings from "../../components/SimulationSettings/SimulationSettings";
import simulationStore from "../../stores/simulationStore";
import {appConstants, defaultSimConstants} from "../../constants/simulation";
import BackgroundScene from "../../components/BackgroundScene/BackgroundScene";
import Checkbox from "../../components/Checkbox/Checkbox";
import Button from "../../components/Button/Button";
import {validateSimulationConstants} from "../../utils/validators";

interface IMainProps {
    setAppPhase: (phase: appPhase) => void
}

const localConstants = localStorage.getItem('simConstants')

const MemoizedBackground = memo(BackgroundScene)

const Version = () => <span className={classes.version}>v. {appConstants.version}</span>

const Main = ({setAppPhase}: IMainProps) => {
    const [isDefaultSettings, setIsDefaultSettings] = useState(true)
    const [constantsValues, setConstantsValues] = useState(() => localConstants ?
        validateSimulationConstants(JSON.parse(localConstants)) : defaultSimConstants
    )

    const toggleSettingsCheckbox = useCallback(
        () => setIsDefaultSettings(prevState => !prevState), []
    )

    const onSimStart = useCallback(() => {
        if (!isDefaultSettings) {
            simulationStore.setSimulationConstants(constantsValues)
        }
        localStorage.setItem('simConstants', JSON.stringify(constantsValues))
        setAppPhase('STARTED')
    }, [constantsValues, setAppPhase, isDefaultSettings])

    return <>
        <Version/>
        <MemoizedBackground/>
        <div className={classes.container}>
            <h1>
                MAIN
            </h1>
            <Button onClick={onSimStart} className={classes.button}>
                Go To Sim
            </Button>
            <Checkbox
                label={'Start with default settings'}
                onChange={toggleSettingsCheckbox}
                checked={isDefaultSettings}
            />
            {!isDefaultSettings ?
                <SimulationSettings constantsValues={constantsValues} setConstantsValues={setConstantsValues}/> : <></>}
        </div>
    </>
}

export default Main