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
            plantName={'Yarrow'}
            posShift={'-75px'}
            description={'Totally inedible. Causes immediate, inevitable, and irreversible death'}
        />
        <PlantInfo
            plantName={'Peas'}
            posShift={'-150px'}
            description={'Causes diarrhea, making geese feel even more exhausted than before eating'}
        />
        <PlantInfo
            plantName={'Clover'}
            posShift={'-225px'}
            description={'Sometimes works as tonic, sometimes as sedative. It\'s all just a matter of luck'}
        />
        <PlantInfo
            plantName={'Strawberries'}
            posShift={'-300px'}
            description={'Fills geese with wonderful lovely energy, making them eager to make love immediately'}
        />
        <PlantInfo
            plantName={'Blueberry'}
            posShift={'-375px'}
            description={'Causes inexplicable changes in the brains of geese, affecting their sexual preferences'}
        />
    </div>
}



export default PlantsInfo