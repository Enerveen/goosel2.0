import React, {useEffect, useState} from "react";
import {observer} from "mobx-react-lite";
import classes from './ActiveEntityInfo.module.scss'
import Animal from "../../entities/Animal";
import {simulationValuesMultipliers} from "../../constants/simulation";

interface IProps {
    activeEntity: Animal | null
    energy: number | undefined
}

const ActiveEntityInfo = observer(({activeEntity, energy}: IProps) => {
    const [entity, setEntity] = useState<null | Animal>(null)
    useEffect(() => {
        setEntity(activeEntity)
    }, [activeEntity])

    return <div className={classes.container}>
        {entity ? <div>
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
            <div className={classes.stat}>
                <b>Energy: </b>{energy}/{entity.energy.max}
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
                <b>FS: </b>
                {entity.stats.foodSensitivity} <i>({entity.stats.foodSensitivity * simulationValuesMultipliers.foodSensitivity} units)</i>
            </div>
            <div className={classes.stat}>
                <b>BS: </b>
                {entity.stats.breedingSensitivity} <i>({entity.stats.breedingSensitivity * simulationValuesMultipliers.breedingSensitivity} units)</i>
            </div>
            <div className={classes.stat}>
                <b>Hatching time: </b>
                {entity.stats.hatchingTime} <i>({entity.stats.hatchingTime * simulationValuesMultipliers.hatchingTime / 10} days)</i>
            </div>
            <div className={classes.stat}>
                <b>Activity: </b>
                {entity.currentActivity.activity} {entity.currentActivity.progress}/{entity.currentActivity.maxProgress}
            </div>
        </div> : <></>}
    </div>
});

export default ActiveEntityInfo

