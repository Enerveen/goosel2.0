import React from "react";
import classes from "./HowTo.module.scss";
import plantAtlas from '../../../../img/plantsAtlas.png'

interface IPlantInfoProps {
    plantName: string,
    posShift: string,
    description: string
}
const PlantInfo = ({plantName, posShift, description}:IPlantInfoProps) => <div className={classes.plantInfoContainer}>
    <div><span className={classes.special}>{plantName}</span> - {description}</div>
    <div className={classes.clippedImage}>
        <img src={plantAtlas} alt={plantName} style={{objectPosition: posShift}} />
    </div>
</div>
const PlantsInfo = () => {

    return <div className={classes.infoContent}>
        <h2>Common</h2>
        <PlantInfo
            plantName={'Goosegrass'}
            posShift={'0'}
            description={'Common geese food that makes their lives a bit better, provides fulfillment without any side effects'}
        />
        <PlantInfo
            plantName={'Strawberry'}
            posShift={'-66px'}
            description={'A little more nutritious than goose grass, the geese love it'}
        />
        <PlantInfo
            plantName={'Blueberry'}
            posShift={'-132px'}
            description={'The geese\'s favourite treat, every goose in the world would sell their soul for it.'}
        />
        <h2>Peculiar</h2>
        <PlantInfo
            plantName={'Clover'}
            posShift={'-198px'}
            description={'Sometimes works as tonic, sometimes as sedative. It\'s all just a matter of luck'}
        />
        <PlantInfo
            plantName={'Yarrow'}
            posShift={'-264px'}
            description={'Fills geese with wonderful lovely energy, making them eager to make love immediately'}
        />
        <PlantInfo
            plantName={'Peas'}
            posShift={'-330px'}
            description={'Causes inexplicable changes in the brains of geese, affecting their sexual preferences'}
        />
        <h2>Harmful</h2>
        <PlantInfo
            plantName={'Henbane'}
            posShift={'-396px'}
            description={'Totally inedible. Causes immediate, inevitable, and irreversible death'}
        />
        <PlantInfo
            plantName={'Sagebrush'}
            posShift={'-462px'}
            description={'Causes diarrhea, making geese feel even more exhausted than before eating'}
        />
    </div>
}



export default PlantsInfo