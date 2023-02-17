import Animal from "../entities/Animal";
import Plant from "../entities/Plant";

const generateStatistics = (animals: Animal[], plants: Plant[]) => {
    let animalStats = {
        averageStats: {
            breedingCD: 0,
            breedingSensitivity: 0,
            hatchingTime: 0,
            foodSensitivity: 0,
            speed: 0,
            immunity: 0,
            curiosity: 0
        },
        gender: {
            male: 0,
            female: 0
        },
        age: {
            child: 0,
            teen: 0,
            mature: 0,
            elder: 0
        }
    }

    const stats = Object.keys(animalStats.averageStats) as
        ('breedingCD' | 'breedingSensitivity' | 'hatchingTime' | 'foodSensitivity' | 'speed' | 'immunity' | 'curiosity')[]

    animals.forEach(animal => {
        stats.forEach((stat) => {
            animalStats.averageStats[stat] += animal.stats[stat]
        })
        animal.gender === "male" ? animalStats.gender.male += 1 : animalStats.gender.female += 1
        if (animal.age.current >= 0 && animal.age.current < 5) {
            animalStats.age.child += 1
        }

        if (animal.age.current >= 5 && animal.age.current < 10) {
            animalStats.age.teen += 1
        }

        if (animal.age.current >= 10 && animal.age.current < 15) {
            animalStats.age.mature += 1
        }

        if (animal.age.current >= 15) {
            animalStats.age.elder += 1
        }
    })

    const totalNutrition = plants.reduce((acc, elem) => acc + elem.nutritionValue, 0)
    stats.forEach(stat =>
        animalStats.averageStats[stat] = +(animalStats.averageStats[stat] / animals.length).toFixed(3))
    return {...animalStats, plantsStats: {totalNutrition, count: plants.length}, animalsCount: animals.length}

}

export default generateStatistics

