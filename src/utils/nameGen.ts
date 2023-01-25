import {animalFemaleFirstNames, animalMaleFirstNames, animalSurnames, monthNames} from "../constants/names";
import {gender} from "../types";
import {timeConstants} from "../constants/simulation";

export const generateAnimalName = (gender: gender) =>
    `${generateAnimalFirstName(gender)} ${animalSurnames[Math.round(Math.random() * (animalSurnames.length - 1))]}`

export const generateAnimalFirstName = (gender: gender) =>
    gender === 'male' ? animalMaleFirstNames[Math.round(Math.random() * (animalMaleFirstNames.length - 1))] : animalFemaleFirstNames[Math.round(Math.random() * (animalMaleFirstNames.length - 1))]

export const getReadableDate = (timestamp: number) => {
    const year = Math.floor(timestamp / timeConstants.yearLength)
    const month = Math.floor((timestamp - year * timeConstants.yearLength) / timeConstants.monthLength)
    const day = Math.ceil((timestamp - year * timeConstants.yearLength - month * timeConstants.monthLength + 1) / timeConstants.dayLength)
    return `${day} ${monthNames[month]} ${year} y.`
}
