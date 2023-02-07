import React, {ChangeEvent, useEffect, useState} from "react";
import {observer} from "mobx-react-lite";
import classes from "./Controls.module.scss";
import {appPhase, SimulationConstants} from "../../types";
import Animal from "../../entities/Animal";
import {getRandomPosition} from "../../utils/helpers";
import Slider from "../Slider/Slider";
import Clock from "../Clock/Clock";
import Button from "../Button/Button";
import Checkbox from "../Checkbox/Checkbox";
import simulationStore from "../../stores/simulationStore";

interface IControlsProps {
    simulationSpeed: number
    setSimulationSpeed: (speed: number) => void
    timestamp: number
    setAppPhase: (state: appPhase) => void
    addAnimal: (animal: Animal) => void
    animalMaxEnergy: number
    getId: () => () => number
    logHidden: boolean,
    simulationConstants: SimulationConstants
}

const Controls = observer(({
                               simulationSpeed,
                               setSimulationSpeed,
                               timestamp,
                               setAppPhase,
                               addAnimal,
                               animalMaxEnergy,
                               getId,
                               logHidden,
                               simulationConstants
                           }: IControlsProps) => {
    const {fieldSize} = simulationConstants
    const [value, setValue] = useState(simulationSpeed)

    const createNewAnimal = () => {
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
            <Clock timestamp={timestamp}/>
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
})

export default Controls