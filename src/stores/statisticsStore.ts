import {create} from "zustand";
import {Statistics} from "../types";

interface StatisticsStore {
    age: { child: number, teen: number, mature: number, elder: number, year: number }[],
    gender: { male: number, female: number, year: number }[]
    averageStats: {
        breedingCD: number,
        breedingSensitivity: number,
        hatchingTime: number,
        foodSensitivity: number,
        speed: number,
        year: number
    }[]
    populationChange: {value: number, year: number}[]
    plantStats: {year: number, count: number, totalNutrition: number}[]
    animalCount: number[],
    updateStatistics: (statistics: Statistics, currentYear: number) => void
}

const useStatisticsStore = create<StatisticsStore>((set) => ({
    age: [],
    gender: [],
    averageStats: [],
    populationChange: [],
    plantStats: [],
    animalCount: [],
    updateStatistics: (statistics: Statistics, currentYear: number) => set(state => {
        const {gender, age, averageStats, animalsCount, plantsStats} = statistics
        const populationChange = animalsCount - (state.animalCount.at(-1) || 0)
        return  {
            age: [...state.age, {year: currentYear, ...age}],
            gender: [...state.gender, {year: currentYear, ...gender}],
            averageStats: [...state.averageStats, {year: currentYear, ...averageStats}],
            populationChange: [...state.populationChange, {year: currentYear, value: populationChange}],
            animalCount: [...state.animalCount, animalsCount],
            plantStats: [...state.plantStats, {year: currentYear, ...plantsStats}],
        }
    })
}))

export default useStatisticsStore