import React, {useCallback, useState} from "react";
import classes from './Main.module.scss'
import {appPhase} from "../../types";
import SimulationSettings from "../../components/SimulationSettings/SimulationSettings";
import useSimConstantsStore from "../../stores/simConstantsStore";
import {defaultSimulationConstants} from "../../constants/simulation";

interface IMainProps {
    setAppPhase: (phase: appPhase) => void
}

const Main = ({setAppPhase}: IMainProps) => {
    const [isDefaultSettings, setIsDefaultSettings] = useState(true)
    const {constants, setConstants} = useSimConstantsStore()
    const [constantsValues, setConstantsValues] = useState(constants)

    const toggleSettingsCheckbox = useCallback(
        () => setIsDefaultSettings(prevState => !prevState), []
    )

    const onSimStart = useCallback(() => {
        setConstants(isDefaultSettings ? defaultSimulationConstants : constantsValues)
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