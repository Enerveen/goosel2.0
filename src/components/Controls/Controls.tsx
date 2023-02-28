import React, {ChangeEvent, useCallback} from "react";
import classes from "./Controls.module.scss";
import {appPhase} from "../../types";
import Animal from "../../entities/Animal";
import {getRandomPosition} from "../../utils/helpers";
import Slider from "../Slider/Slider";
import Clock from "../Clock/Clock";
import Button from "../Button/Button";
import Checkbox from "../Checkbox/Checkbox";
import simulationStore from "../../stores/simulationStore";
import {observer} from "mobx-react-lite";
import {simConstantsRanges} from "../../constants/simulation";
import RangeSlider from "../RangeSlider/RangeSlider";

interface IControlsProps {
    setAppPhase: (state: appPhase) => void
}

const Controls = observer(({setAppPhase}: IControlsProps) => {
    const {fieldSize, animalMaxEnergy} = simulationStore.getSimulationConstants
    const simulationSpeed = simulationStore.getSimulationSpeed
    const simulationConstants = simulationStore.getSimulationConstants
    const {getId, addAnimal, setSimulationSpeed} = simulationStore
    const logHidden = simulationStore.getLogHidden

    const createNewAnimal = () => {
        const timestamp = simulationStore.getTimestamp
        addAnimal(
            new Animal({
                id: `A${getId()}`,
                position: getRandomPosition(fieldSize.width, fieldSize.height),
                age: {current: 0, birthTimestamp: timestamp},
                energy: {current: animalMaxEnergy, max: animalMaxEnergy, breedingCD: 0}
            })
        )
    }

    const updateConstantValue = useCallback((key: string, value: number) => {
        simulationStore.setSimulationConstants({...simulationConstants, [key]: value})
    }, [simulationConstants])

    const updateFoodNutritionRange = useCallback((values: number[]) => {
        simulationStore.setSimulationConstants(
            {...simulationConstants, foodNutritionMin: values[0], foodNutritionMax: values[1]}
        )
    }, [JSON.stringify(simulationConstants)])

    return <div className={classes.container}>
        <div className={classes.timeBlock}>
            <Clock/>
        </div>
        <div className={classes.buttonBlock}>
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
        <div className={classes.sliderBlock}>
            <Slider
                label={'Speed'}
                id={'simulationSpeed'}
                value={simulationSpeed}
                min={0}
                max={10}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSimulationSpeed(+e.target.value)}
                className={classes.slider}
            />
            <Slider
                label={'Plant spawn chance'}
                tooltipContent={'Chance of spawning a plant on a single tick (1/10 of a day).'}
                className={classes.slider}
                id={'foodSpawnChance'}
                min={simConstantsRanges.foodSpawnChance.min * simConstantsRanges.foodSpawnChance.multiplier}
                max={simConstantsRanges.foodSpawnChance.max * simConstantsRanges.foodSpawnChance.multiplier}
                step={simConstantsRanges.foodSpawnChance.step * simConstantsRanges.foodSpawnChance.multiplier}
                value={Math.round(simulationConstants.foodSpawnChance * simConstantsRanges.foodSpawnChance.multiplier)}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    updateConstantValue('foodSpawnChance', +e.target.value / simConstantsRanges.foodSpawnChance.multiplier)}
            />
            <RangeSlider
                minGap={simConstantsRanges.foodNutrition.step}
                max={simConstantsRanges.foodNutrition.max}
                min={simConstantsRanges.foodNutrition.min}
                step={simConstantsRanges.foodNutrition.step}
                initialValues={[simulationConstants.foodNutritionMin, simulationConstants.foodNutritionMax]}
                label={'Plants nutrition range'}
                className={classes.slider}
                onValuesChange={updateFoodNutritionRange}
                tooltipContent={'Range in which plants nutrition value may lie, plants nutrition defines how much energy will a goose receive after consuming a plant. It assigns randomly on plant generation'}
            />
            <Slider
                label={'Mutation chance'}
                tooltipContent={'Chance of each new animal to slightly change their stats. Chance to change a gene is half percent lower than that value'}
                className={classes.slider}
                id={'mutationChance'}
                min={simConstantsRanges.mutationChance.min * simConstantsRanges.mutationChance.multiplier}
                max={simConstantsRanges.mutationChance.max * simConstantsRanges.mutationChance.multiplier}
                step={simConstantsRanges.mutationChance.step * simConstantsRanges.mutationChance.multiplier}
                value={Math.round(simulationConstants.mutationChance * simConstantsRanges.mutationChance.multiplier)}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    updateConstantValue('mutationChance', +e.target.value / simConstantsRanges.mutationChance.multiplier)}
            />
        </div>
    </div>
})

export default Controls