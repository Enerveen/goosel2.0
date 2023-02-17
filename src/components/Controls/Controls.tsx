import React, {ChangeEvent, useEffect, useState} from "react";
import classes from "./Controls.module.scss";
import {appPhase} from "../../types";
import Animal from "../../entities/Animal";
import {getRandomPosition} from "../../utils/helpers";
import Slider from "../Slider/Slider";
import Clock from "../Clock/Clock";
import Button from "../Button/Button";
import Checkbox from "../Checkbox/Checkbox";
import simulationStore from "../../stores/simulationStore";

interface IControlsProps {
    setAppPhase: (state: appPhase) => void
}

const Controls = ({setAppPhase}: IControlsProps) => {
    const {fieldSize, animalMaxEnergy} = simulationStore.getSimulationConstants
    const simulationSpeed = simulationStore.getSimulationSpeed
    const {getId, addAnimal, setSimulationSpeed} = simulationStore
    const logHidden = simulationStore.getLogHidden
    const [value, setValue] = useState(simulationSpeed)

    const createNewAnimal = () => {
        const timestamp = simulationStore.getTimestamp
        addAnimal(
            new Animal({
                id: `A${getId()}`,
                position: getRandomPosition(fieldSize.width, fieldSize.height),
                age: {current: 0, birthTimestamp: timestamp, deathTimestamp: undefined},
                energy: {current: animalMaxEnergy, max: animalMaxEnergy, breedingCD: 0}
            })
        )
    }

    useEffect(() => {
        setSimulationSpeed(value)
    }, [value, setSimulationSpeed])

    return <div className={classes.container}>
        <div className={classes.timeBlock}>
            <Clock/>
            <Slider
                label={'Speed'}
                id={'simulationSpeed'}
                value={value}
                min={0}
                max={10}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setValue(+e.target.value)}
                className={classes.sliderContainer}
            />
        </div>
        <div>
            <Button className={classes.button} onClick={createNewAnimal}>
                Goose!
            </Button>
            <Button className={classes.button} onClick={() => setAppPhase('FINISHED')}>
                Fin
            </Button>
            <Checkbox
                label={'Hide logs'}
                onChange={simulationStore.toggleLogHidden}
                checked={logHidden}
            />
        </div>
    </div>
}

export default Controls