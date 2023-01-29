import React, {useCallback, useState} from "react";
import classes from './Main.module.scss'
import {appPhase} from "../../types";
import SimulationSettings from "../../components/SimulationSettings/SimulationSettings";
import simulationStore from "../../stores/simulationStore";

interface IMainProps {
    setAppPhase: (phase: appPhase) => void
}

const Main = ({setAppPhase}: IMainProps) => {
    const [isDefaultSettings, setIsDefaultSettings] = useState(true)
    const [constantsValues, setConstantsValues] = useState(simulationStore.simulationConstants)

    const toggleSettingsCheckbox = useCallback(
        () => setIsDefaultSettings(prevState => !prevState), []
    )

    const onSimStart = useCallback(() => {
        if (!isDefaultSettings) {
            simulationStore.setSimulationConstants(constantsValues)
        }
        setAppPhase('STARTED')
    }, [constantsValues, setAppPhase, isDefaultSettings])

    return <div className={classes.container}>
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
}

export default Main