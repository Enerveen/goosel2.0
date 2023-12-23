import React, {ChangeEvent, useCallback} from "react";
import classes from './SimulationSettings.module.scss'
import Slider from "../Slider/Slider";
import RangeSlider from "../RangeSlider/RangeSlider";
import {SimulationConstants} from "../../types";
import {simConstantsRanges} from "../../constants/simulation";
import Checkbox from "../Checkbox/Checkbox";

interface ISimulationSettingsProps {
    constantsValues: SimulationConstants,
    setConstantsValues: (p: (prevValue: SimulationConstants) => any) => void
}

const SimulationSettings = ({constantsValues, setConstantsValues}: ISimulationSettingsProps) => {

    const updateSettingsValues =
        useCallback((key: string, value: number | boolean) =>
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
            max={simConstantsRanges.breedingAge.max}
            min={simConstantsRanges.breedingAge.min}
            initialValues={[constantsValues.breedingMinAge, constantsValues.breedingMaxAge]}
            label={'Breeding period (years)'}
            className={classes.rangeSlider}
            onValuesChange={updateBreedingRange}
            tooltipContent={'Life span, on which geese may be engaged in sexual activity'}
        />
        <RangeSlider
            minGap={simConstantsRanges.foodNutrition.step}
            max={simConstantsRanges.foodNutrition.max}
            min={simConstantsRanges.foodNutrition.min}
            step={simConstantsRanges.foodNutrition.step}
            initialValues={[constantsValues.foodNutritionMin, constantsValues.foodNutritionMax]}
            label={'Plants nutrition range'}
            className={classes.rangeSlider}
            onValuesChange={updateFoodNutritionRange}
            tooltipContent={'Range in which plants nutrition value may lie, plants nutrition defines how much energy will a goose receive after consuming a plant. It assigns randomly on plant generation'}
        />
        <Slider
            label={'Days to finish breeding'}
            tooltipContent={'Time, required to finish breeding process and lay eggs (Be careful: less time = less energy of a child on born!)'}
            className={classes.slider}
            id={'breedingMaxProgress'}
            min={simConstantsRanges.breedingMaxProgress.min * simConstantsRanges.breedingMaxProgress.multiplier}
            max={simConstantsRanges.breedingMaxProgress.max * simConstantsRanges.breedingMaxProgress.multiplier}
            step={simConstantsRanges.breedingMaxProgress.step * simConstantsRanges.breedingMaxProgress.multiplier}
            value={constantsValues.breedingMaxProgress * simConstantsRanges.breedingMaxProgress.multiplier}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateSettingsValues('breedingMaxProgress', +e.target.value / simConstantsRanges.breedingMaxProgress.multiplier)}
        />
        <Slider
            label={'Maximum Energy of Animals'}
            className={classes.slider}
            id={'animalMaxEnergy'}
            min={simConstantsRanges.animalMaxEnergy.min}
            max={simConstantsRanges.animalMaxEnergy.max}
            step={simConstantsRanges.animalMaxEnergy.step}
            value={constantsValues.animalMaxEnergy}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateSettingsValues('animalMaxEnergy', +e.target.value)}
        />
        <Slider
            label={'Initial food pieces count'}
            className={classes.slider}
            id={'initialFoodCount'}
            min={simConstantsRanges.initialFoodCount.min}
            max={simConstantsRanges.initialFoodCount.max}
            step={simConstantsRanges.initialFoodCount.step}
            value={constantsValues.initialFoodCount}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateSettingsValues('initialFoodCount', +e.target.value)}
        />
        <Slider
            label={'Initial animals count'}
            className={classes.slider}
            id={'initialAnimalCount'}
            min={simConstantsRanges.initialAnimalCount.min}
            max={simConstantsRanges.initialAnimalCount.max}
            step={simConstantsRanges.initialAnimalCount.step}
            value={constantsValues.initialAnimalCount}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateSettingsValues('initialAnimalCount', +e.target.value)}
        />
        <Slider
            label={'Field width'}
            className={classes.slider}
            id={'fieldWidth'}
            min={simConstantsRanges.fieldWidth.min}
            max={simConstantsRanges.fieldWidth.max}
            step={simConstantsRanges.fieldWidth.step}
            value={constantsValues.fieldSize.width}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateFieldDimensions('width', +e.target.value)}
        />
        <Slider
            label={'Field height'}
            className={classes.slider}
            id={'fieldHeight'}
            min={simConstantsRanges.fieldHeight.min}
            max={simConstantsRanges.fieldHeight.max}
            step={simConstantsRanges.fieldHeight.step}
            value={constantsValues.fieldSize.height}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateFieldDimensions('height', +e.target.value)}
        />
        <Slider
            label={'Plant spawn chance'}
            tooltipContent={'Chance of spawning a plant on a single tick (1/10 of a day).'}
            className={classes.slider}
            id={'foodSpawnChance'}
            min={simConstantsRanges.foodSpawnChance.min * simConstantsRanges.foodSpawnChance.multiplier}
            max={simConstantsRanges.foodSpawnChance.max * simConstantsRanges.foodSpawnChance.multiplier}
            step={simConstantsRanges.foodSpawnChance.step * simConstantsRanges.foodSpawnChance.multiplier}
            value={Math.round(constantsValues.foodSpawnChance * simConstantsRanges.foodSpawnChance.multiplier)}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateSettingsValues('foodSpawnChance', +e.target.value / simConstantsRanges.foodSpawnChance.multiplier)}
        />
        <Slider
            label={'Mutation chance'}
            tooltipContent={'Chance of each new animal to slightly change their stats. Chance to change a gene is half percent lower than that value'}
            className={classes.slider}
            id={'mutationChance'}
            min={simConstantsRanges.mutationChance.min * simConstantsRanges.mutationChance.multiplier}
            max={simConstantsRanges.mutationChance.max * simConstantsRanges.mutationChance.multiplier}
            step={simConstantsRanges.mutationChance.step * simConstantsRanges.mutationChance.multiplier}
            value={Math.round(constantsValues.mutationChance * simConstantsRanges.mutationChance.multiplier)}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateSettingsValues('mutationChance', +e.target.value / simConstantsRanges.mutationChance.multiplier)}
        />
        <Checkbox label={'Balance gender diversity'}
                  onChange={(e => updateSettingsValues('isBalancedGenderDiff', e.target.checked))}
                  checked={constantsValues.isBalancedGenderDiff}
                  tooltipContent={'While enabled, balances chances of gender on birth based on gender diversity of current population'}
        />
    </div>
}

export default SimulationSettings