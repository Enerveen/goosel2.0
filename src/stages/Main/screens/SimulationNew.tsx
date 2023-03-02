import React, {useCallback, useState} from "react";
import {validateSimulationConstants} from "../../../utils/validators";
import {defaultSimConstants} from "../../../constants/simulation";
import simulationStore from "../../../stores/simulationStore";
import classes from "../Main.module.scss";
import Button from "../../../components/Button/Button";
import Checkbox from "../../../components/Checkbox/Checkbox";
import {clsSum} from "../../../utils/utils";
import SimulationSettings from "../../../components/SimulationSettings/SimulationSettings";
import {appPhase} from "../../../types";
import {mainMenuScreens} from "../Main";

const localConstants = localStorage.getItem('simConstants')

interface ISimulationNewProps {
    setAppPhase: (phase: appPhase) => void,
    setCurrentScreen: (screen: mainMenuScreens) => void
}
const SimulationNew = ({setAppPhase, setCurrentScreen}: ISimulationNewProps) => {

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

    return <div className={classes.screenContainer}>
        <Button onClick={onSimStart} className={classes.button}>
            START!
        </Button>
        <Checkbox
            className={clsSum(isDefaultSettings ? classes.checkboxNotExpanded : null)}
            label={'Start with default settings'}
            onChange={toggleSettingsCheckbox}
            checked={isDefaultSettings}
        />
        {!isDefaultSettings ?
            <SimulationSettings constantsValues={constantsValues} setConstantsValues={setConstantsValues}/> : <></>}
        <Button onClick={() => setCurrentScreen('START')} className={classes.button}>
            BACK
        </Button>
    </div>
}

export default SimulationNew