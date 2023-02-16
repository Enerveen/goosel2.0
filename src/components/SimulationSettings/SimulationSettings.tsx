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

    const updateFieldDimensions =
        useCallback((key: 'width' | 'height', value: number) =>
            setConstantsValues(prevValue => ({...prevValue, fieldSize: {...prevValue.fieldSize, [key]: value}})),
            [setConstantsValues])

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
            tooltipContent={'Life span, on which geese may be engaged in sexual activity'}
        />
        <RangeSlider
            minGap={50}
            max={3600}
            min={100}
            step={50}
            initialValues={[constantsValues.foodNutritionMin, constantsValues.foodNutritionMax]}
            label={'Plants nutrition range'}
            className={classes.rangeSlider}
            onValuesChange={updateFoodNutritionRange}
            tooltipContent={'Range in which plants nutrition value may lie, plants nutrition defines how much energy will a goose receive after consuming a plant. It assigns randomly on plant generation'}
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
            label={'Field width'}
            className={classes.slider}
            id={'fieldWidth'}
            min={200}
            max={4200}
            step={100}
            value={constantsValues.fieldSize.width}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateFieldDimensions('width', +e.target.value)}
        />
        <Slider
            label={'Field height'}
            className={classes.slider}
            id={'fieldHeight'}
            min={200}
            max={2000}
            step={100}
            value={constantsValues.fieldSize.height}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateFieldDimensions('height', +e.target.value)}
        />
        <Slider
            label={'Plant spawn Coef'}
            className={classes.slider}
            id={'foodSpawnChanceK'}
            min={1}
            max={5}
            value={constantsValues.foodSpawnChanceK}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateSettingsValues('foodSpawnChanceK', +e.target.value)}
        />
        <Slider
            label={'Mutation chance'}
            className={classes.slider}
            id={'mutationChance'}
            min={2}
            max={100}
            step={2}
            value={Math.round(constantsValues.mutationChance * 100)}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateSettingsValues('mutationChance', +e.target.value / 100)}
        />
    </div>
}

export default SimulationSettings