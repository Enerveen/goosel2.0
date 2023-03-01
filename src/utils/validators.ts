import {SimulationConstants} from "../types";
import {defaultSimConstants, simConstantsRanges} from "../constants/simulation";

// Probably can be implemented sorta better, idgaf
export const validateSimulationConstants = (constants: SimulationConstants) => {
    try {
        Object.keys(constants).forEach(key => {
            if (key === 'breedingMinAge' || key === 'breedingMaxAge') {
                (constants as any)[key] = (constants as any)[key] > simConstantsRanges.breedingAge.max ?
                    simConstantsRanges.breedingAge.max : (constants as any)[key] < simConstantsRanges.breedingAge.min ?
                        simConstantsRanges.breedingAge.min : (constants as any)[key];
                (constants as any)[key] = (constants as any)[key] === 'breedingMinAge' ?
                    Math.min((constants as any)[key], simConstantsRanges.breedingAge.max - 1) : Math.max((constants as any)[key], simConstantsRanges.breedingAge.min + 1);
                return
            }
            if (key === 'foodNutritionMin' || key === 'foodNutritionMax') {
                (constants as any)[key] = (constants as any)[key] > simConstantsRanges.foodNutrition.max ?
                    simConstantsRanges.foodNutrition.max : (constants as any)[key] < simConstantsRanges.foodNutrition.min ?
                        simConstantsRanges.foodNutrition.min : (constants as any)[key];
                (constants as any)[key] = (constants as any)[key] === 'foodNutritionMin' ?
                    Math.min((constants as any)[key], simConstantsRanges.foodNutrition.max - simConstantsRanges.foodNutrition.step) :
                    Math.max((constants as any)[key], simConstantsRanges.foodNutrition.min + simConstantsRanges.foodNutrition.step);
                return;
            }
            if (key === 'fieldSize') {
                constants.fieldSize.width = constants.fieldSize.width > simConstantsRanges.fieldWidth.max ?
                    simConstantsRanges.fieldWidth.max : constants.fieldSize.width < simConstantsRanges.fieldWidth.min ?
                        simConstantsRanges.fieldWidth.min : constants.fieldSize.width;
                constants.fieldSize.height = constants.fieldSize.height > simConstantsRanges.fieldHeight.max ?
                    simConstantsRanges.fieldHeight.max : constants.fieldSize.height < simConstantsRanges.fieldHeight.min ?
                        simConstantsRanges.fieldHeight.min : constants.fieldSize.height;
                return;
            }
            (constants as any)[key] = (constants as any)[key] > (simConstantsRanges as any)[key].max ?
                (simConstantsRanges as any)[key].max : (constants as any)[key] < (simConstantsRanges as any)[key].min ?
                    (simConstantsRanges as any)[key].min : (constants as any)[key]
        })
        return constants
    } catch (error: unknown) {
        console.error('Failed to validate localStorage, loading default simulation constants', (error as Error).message)
        return defaultSimConstants
    }
}