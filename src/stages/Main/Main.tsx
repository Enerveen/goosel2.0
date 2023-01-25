import React, {useCallback, useState} from "react";
import classes from './Main.module.scss'
import {appPhase} from "../../types";
import SimulationSettings from "../../components/SimulationSettings/SimulationSettings";
import simulationStore from "../../stores/simulationStore";

interface IMainProps {
    setAppPhase: (phase: appPhase) => void
}

const Main = ({ setAppPhase }: IMainProps) => {
    const [isDefaultSettings, setIsDefaultSettings] = useState(true)
    const [constantsValues, setConstantsValues] = useState({
        breedingMinAge: 5,
        breedingMaxAge: 15,
        foodNutritionMin: 300,
        foodNutritionMax: 800,
        breedingMaxProgress: 200,
        animalMaxEnergy: 1200,
        foodSpawnChanceK: 50,
        initialFoodCount: 200,
        initialAnimalCount: 8
    })

    const toggleSettingsCheckbox = useCallback(
        () => setIsDefaultSettings(prevState => !prevState), []
    )

    const onSimStart = useCallback(() => {
        simulationStore.setSimulationConstants(constantsValues)
        setAppPhase('STARTED')
    }, [constantsValues, setAppPhase])

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
        {!isDefaultSettings ? <SimulationSettings constantsValues={constantsValues} setConstantsValues={setConstantsValues}/> : <></>}
    </div>
}

export default Main