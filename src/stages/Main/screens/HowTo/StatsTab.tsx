import classes from "./HowTo.module.scss";
import {simulationValuesMultipliers} from "../../../../constants/simulation";

const StatsInfo = () => {

    return <div className={classes.infoContent}>
        <p>
            As Gooselection is a simulation of a natural selection, genes play one of the most important roles.
            Genes can be inherited from a parent, yet also can be changed due to the mutation or geese experience.
            In the context of this simulation, we can divide genes into 2 groups: parameters and traits.
        </p>
        <h2>Parameters</h2>
        <p>
            Parameters - are numeric values, that are defining the different aspects of a certain goose's possibilities.
            Basic value of all parameters is equal to <span className={classes.special}>1</span>.
            Increase of a parameter results in higher energy consumption
        </p>
        <p>
            <span className={classes.special}>Speed</span> - parameter, that defines how fast goose is moving, basic value is equal to <span className={classes.special}>60 units per second</span>
        </p>
        <p>
            <span className={classes.special}>Food sense</span> - parameter, that defines how far goose can sense food, basic value is equal to <span className={classes.special}>{simulationValuesMultipliers.foodSensitivity} units</span>
        </p>
        <p>
            <span className={classes.special}>Breeding sense</span> - parameter, that defines how far goose can sense potential breeding partner, basic value is equal to <span className={classes.special}>{simulationValuesMultipliers.breedingSensitivity} units</span>
        </p>
        <p>
            <span className={classes.special}>Immunity</span> - parameter, that defines chances of goose to avoid effects of a consumed food (regardless negative or positive),
            basic value is equal to <span className={classes.special}>{simulationValuesMultipliers.immunity * 100}%</span>
        </p>
        <p>
            <span className={classes.special}>Curiosity</span> - parameter, that defines chances of goose to break away from their current life and go search for adventures,
            basic value is equal to <span className={classes.special}>{simulationValuesMultipliers.curiosity * 100}%</span>
        </p>
        <p>
            <span className={classes.special}>Hatching time</span> - parameter, that defines how much time goose need to stay inside the egg before the hatching, basic value is <span className={classes.special}>{simulationValuesMultipliers.hatchingTime / 300}</span> month
        </p>
        <p>
            <span className={classes.special}>Breeding time</span> - parameter, that defines how much time goose need to rest after the breeding until they will be ready for another round, basic value is <span className={classes.special}>{simulationValuesMultipliers.breedingCD / 300}</span> month
        </p>
        <h2>Traits</h2>
        <p>
            Traits - are boolean values, that are defining the different aspects of a certain goose's behavior.
            Basically all geese don't have any special traits.
        </p>
        <p>
            <span className={classes.special}>Homosexuality</span> - trait, that defines sexual preferences of a goose, by default all geese are <span className={classes.special}>heterosexual</span>.
        </p>
        <p>
            <span className={classes.special}>Carnivorousness</span> - trait, that defines food preferences of a goose. Vegetarian geese prefer plants, while carnivore ones prefer corpses. By default all geese are <span className={classes.special}>vegetarian</span>.
        </p>
    </div>
}

export default StatsInfo