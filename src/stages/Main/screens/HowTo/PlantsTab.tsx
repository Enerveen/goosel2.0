import React from "react";
import classes from "./HowTo.module.scss";
import plantAtlas from '../../../../img/plantsAtlas.png'

interface IPlantInfoProps {
    plantName: string,
    posShift: string,
    description: string
}
const PlantInfo = ({plantName, posShift, description}:IPlantInfoProps) => <div className={classes.plantInfoContainer}>
    <div><span className={classes.special}>{plantName}</span>: {description}</div>
    <div className={classes.clippedImage}>
        <img src={plantAtlas} alt={plantName} style={{objectPosition: posShift}} />
    </div>
</div>
const PlantsInfo = () => {

    return <div className={classes.infoContent}>
        <PlantInfo
            plantName={'Goosegrass'}
            posShift={'0'}
            description={'Common geese food that makes their lives a bit better, provides fulfillment without any side effects'}
        />
        <PlantInfo
            plantName={'Goosegrass'}
            posShift={'-100px'}
            description={'Common geese food, provides fulfillment without any side effects'}
        />
        <PlantInfo
            plantName={'Goosegrass'}
            posShift={'-200px'}
            description={'Common geese food, provides fulfillment without any side effects'}
        />
        <PlantInfo
            plantName={'Goosegrass'}
            posShift={'-300px'}
            description={'Common geese food, provides fulfillment without any side effects'}
        />
        <PlantInfo
            plantName={'Goosegrass'}
            posShift={'-400px'}
            description={'Common geese food, provides fulfillment without any side effects'}
        />
        <PlantInfo
            plantName={'Goosegrass'}
            posShift={'-500px'}
            description={'Common geese food, provides fulfillment without any side effects'}
        />
    </div>
}



export default PlantsInfo