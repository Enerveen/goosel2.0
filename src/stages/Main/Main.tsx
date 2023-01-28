import React, {useCallback, useState} from "react";
import classes from './Main.module.scss'
import {appPhase} from "../../types";
import SimulationSettings from "../../components/SimulationSettings/SimulationSettings";
import simulationStore from "../../stores/simulationStore";
import useImagePreload from "../../hooks/useImagePreload";
import bgSrc from '../../img/background.jpg'
import plantSrc from '../../img/plant.png'
import animalTextureAtlasSrc from '../../img/animalTextureAtlas.png'
import eggSrc from '../../img/egg.png'
import egg2Src from '../../img/egg2.png'
import heartSrc from '../../img/heart.png'

interface IMainProps {
    setAppPhase: (phase: appPhase) => void
}

const Main = ({ setAppPhase }: IMainProps) => {
    const [isDefaultSettings, setIsDefaultSettings] = useState(true)
    const isImagesPreloaded = useImagePreload([bgSrc, plantSrc, animalTextureAtlasSrc, eggSrc, heartSrc, egg2Src])
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
        if (!isDefaultSettings) {
            simulationStore.setSimulationConstants(constantsValues)
        }
        setAppPhase('STARTED')
    }, [constantsValues, setAppPhase, isDefaultSettings])

    return <div className={classes.container}>
        <h1>
            MAIN
        </h1>
        {isImagesPreloaded ? <button onClick={onSimStart}>
            Go To Sim
        </button> : <h2>Images Loading...</h2>}
        <div className={classes.settingsSectionCheckbox}>
            <span>Start with default settings</span>
            <input type={'checkbox'} onChange={toggleSettingsCheckbox} checked={isDefaultSettings}/>
        </div>
        {!isDefaultSettings ? <SimulationSettings constantsValues={constantsValues} setConstantsValues={setConstantsValues}/> : <></>}
    </div>
}

export default Main