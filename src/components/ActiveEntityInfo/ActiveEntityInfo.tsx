import React from "react";
import classes from './ActiveEntityInfo.module.scss'
import {simulationValuesMultipliers} from "../../constants/simulation";
import simulationStore from "../../stores/simulationStore";
import {observer} from "mobx-react-lite";

const ActiveEntityInfo = observer(() => {
    const entity = simulationStore.getActiveEntity
    const energy = simulationStore.getActiveEntityEnergy

    return entity ? <div className={classes.container}>
        <div>
            <h2 className={entity.gender === 'male' ? classes.maleName : classes.femaleName}>
                {entity.name}
            </h2>
            <div className={classes.stat}><b>ID: </b>{entity.id}</div>
            {entity.parents ? <>
                <div className={classes.stat}>
                    <b>Father: </b>{entity.parents.father.name}
                </div>
                <div className={classes.stat}>
                    <b>Mother: </b>{entity.parents.mother.name}
                </div>
            </> : <div className={classes.stat}>Homunculus</div>}
            <div className={classes.stat}>{entity.genes.gay ? 'Gay' : 'Hetero'}</div>
            <div className={classes.stat}>
                <b>Energy: </b>{energy?.toFixed(2)}/{entity.energy.max}
            </div>
            <div className={classes.stat}>
                <b>Breeding CD: </b>
                {entity.energy.breedingCD}/{entity.stats.breedingCD * simulationValuesMultipliers.breedingCD}
            </div>
            <div className={classes.stat}>
                <b>Speed: </b>
                {entity.stats.speed}
            </div>
            <div className={classes.stat}>
                <b>Curiosity: </b>
                {entity.stats.curiosity}
            </div>
            <div className={classes.stat}>
                <b>Immunity: </b>
                {entity.stats.immunity}
            </div>
            <div className={classes.stat}>
                <b>FS: </b>
                {entity.stats.foodSensitivity} <i>({(entity.stats.foodSensitivity * simulationValuesMultipliers.foodSensitivity).toFixed(2)} units)</i>
            </div>
            <div className={classes.stat}>
                <b>BS: </b>
                {entity.stats.breedingSensitivity} <i>({(entity.stats.breedingSensitivity * simulationValuesMultipliers.breedingSensitivity).toFixed(2)} units)</i>
            </div>
            <div className={classes.stat}>
                <b>Hatching time: </b>
                {entity.stats.hatchingTime} <i>({entity.stats.hatchingTime * simulationValuesMultipliers.hatchingTime / 10} days)</i>
            </div>
            <div className={classes.stat}>
                <b>Activity: </b>
                {entity.currentActivity.activity} {entity.currentActivity.progress}/{entity.currentActivity.maxProgress}
            </div>
        </div>
    </div> : <></>
})
export default ActiveEntityInfo

