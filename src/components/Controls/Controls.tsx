import React, {ChangeEvent, useEffect, useState} from "react";
import {observer} from "mobx-react-lite";
import classes from "./Controls.module.scss";
import {getReadableDate} from "../../utils/nameGen";
import {appPhase} from "../../types";
import Animal from "../../entities/Animal";
import {getRandomInRange} from "../../utils/utils";
import {getRandomPosition} from "../../utils/helpers";
import Slider from "../Slider/Slider";

interface IControlsProps {
    simulationSpeed: number
    setSimulationSpeed: (speed: number) => void,
    timestamp: number,
    setAppPhase: (state: appPhase) => void
    addAnimal: (animal: Animal) => void,
    animalMaxEnergy: number
}

const Controls = observer(({simulationSpeed, setSimulationSpeed, timestamp, setAppPhase, addAnimal, animalMaxEnergy}: IControlsProps) => {
    const [value, setValue] = useState(simulationSpeed)

    const createNewAnimal = () => {
        addAnimal(
            new Animal({
                id: `A${getRandomInRange(1, 10000)}`,
                position: getRandomPosition(500, 500),
                age: {current: 0, birthTimestamp: timestamp, deathTimestamp: undefined},
                energy: {current: animalMaxEnergy, max: animalMaxEnergy, breedingCD: 0}
            })
        )
    }

    useEffect(() => {
        setSimulationSpeed(value)
    }, [value, setSimulationSpeed])

    return <div className={classes.container}>
        <div className={classes.clock}>
            {getReadableDate(timestamp)}
        </div>
        <Slider
            label={'Speed'}
            id={'simulationSpeed'}
            value={value}
            min={0}
            max={10}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setValue(Number(e.target.value))}
            className={classes.sliderContainer}
        />
        <button onClick={createNewAnimal}>
            Goose!
        </button>
        <button onClick={() => setAppPhase('FINISHED')}>
            Fin
        </button>
    </div>
})

export default Controls