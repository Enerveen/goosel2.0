import React, {memo, useCallback, useState} from "react";
import classes from './Main.module.scss'
import {appPhase} from "../../types";
import SimulationSettings from "../../components/SimulationSettings/SimulationSettings";
import simulationStore from "../../stores/simulationStore";
import {defaultSimConstants} from "../../constants/simulation";
import BackgroundScene from "../../components/BackgroundScene/BackgroundScene";

interface IMainProps {
    setAppPhase: (phase: appPhase) => void
}

const MemoizedBackground = memo(BackgroundScene)

const Main = ({setAppPhase}: IMainProps) => {
    const [isDefaultSettings, setIsDefaultSettings] = useState(true)
    const localConstants = localStorage.getItem('simConstants')
    const [constantsValues, setConstantsValues] = useState(localConstants ?
        JSON.parse(localConstants) : defaultSimConstants
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
        <MemoizedBackground/>
        <div className={classes.container}>
            <h1>
                MAIN
            </h1>
            <button onClick={onSimStart}>
                Go To Sim
            </button>
            <div className={classes.settingsSectionCheckbox}>
                <span>Start with default settings</span>
                <input type={'checkbox'} onChange={toggleSettingsCheckbox} checked={isDefaultSettings}/>
            </div>
            {!isDefaultSettings ?
                <SimulationSettings constantsValues={constantsValues} setConstantsValues={setConstantsValues}/> : <></>}
        </div>
    </>
}

export default Main