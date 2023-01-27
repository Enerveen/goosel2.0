import React, {ChangeEvent, useCallback} from "react";
import classes from './SimulationSettings.module.scss'
import Slider from "../Slider/Slider";
import RangeSlider from "../RangeSlider/RangeSlider";
import {SimulationConstants} from "../../types";

interface ISimulationSettingsProps {
    constantsValues: SimulationConstants,
    setConstantsValues: (p: (prevValue: SimulationConstants) => any) => void
}

const SimulationSettings = ({constantsValues, setConstantsValues}:ISimulationSettingsProps) => {

    const updateSettingsValues =
        useCallback((key: string, value: number) =>
            setConstantsValues(prevValue => ({...prevValue, [key]: value})), [setConstantsValues])

    const updateBreedingRange = useCallback((values: number[]) =>
        setConstantsValues(prevValue =>
            ({...prevValue, breedingMinAge: values[0], breedingMaxAge: values[1]})), [setConstantsValues])

    const updateFoodNutritionRange = useCallback((values: number[]) =>
        setConstantsValues(prevValue =>
            ({...prevValue, foodNutritionMin: values[0], foodNutritionMax: values[1]})), [setConstantsValues])

    return <div className={classes.container}>
        <RangeSlider
            minGap={1}
            max={30}
            min={0}
            initialValues={[constantsValues.breedingMinAge, constantsValues.breedingMaxAge]}
            label={'Breeding period (years)'}
            className={classes.rangeSlider}
            onValuesChange={updateBreedingRange}
        />
        <RangeSlider
            minGap={50}
            max={3600}
            min={100}
            step={50}
            initialValues={[constantsValues.foodNutritionMin, constantsValues.foodNutritionMax]}
            label={'Food nutrition range'}
            className={classes.rangeSlider}
            onValuesChange={updateFoodNutritionRange}
        />
        <Slider
            label={'Days to finish breeding'}
            className={classes.slider}
            id={'breedingMaxProgress'}
            min={2}
            max={120}
            step={2}
            value={constantsValues.breedingMaxProgress / 10}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateSettingsValues('breedingMaxProgress', +e.target.value * 10)}
        />
        <Slider
            label={'Maximum Energy of Animals'}
            className={classes.slider}
            id={'animalMaxEnergy'}
            min={100}
            max={4800}
            step={100}
            value={constantsValues.animalMaxEnergy}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateSettingsValues('animalMaxEnergy', +e.target.value)}
        />
        <Slider
            label={'Initial food pieces count'}
            className={classes.slider}
            id={'initialFoodCount'}
            min={0}
            max={400}
            step={2}
            value={constantsValues.initialFoodCount}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateSettingsValues('initialFoodCount', +e.target.value)}
        />
        <Slider
            label={'Initial animals count'}
            className={classes.slider}
            id={'initialAnimalCount'}
            min={0}
            max={100}
            value={constantsValues.initialAnimalCount}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateSettingsValues('initialAnimalCount', +e.target.value)}
        />
        <Slider
            label={'Food spawn Coef'}
            className={classes.slider}
            id={'foodSpawnChanceK'}
            min={2}
            max={200}
            step={2}
            value={constantsValues.foodSpawnChanceK}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateSettingsValues('foodSpawnChanceK', +e.target.value)}
        />
    </div>
}

export default SimulationSettings