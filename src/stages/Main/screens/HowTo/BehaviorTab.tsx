import classes from "./HowTo.module.scss";

const BehaviorInfo = ({setTab}: { setTab: (id: string) => void }) => {
    return <div className={classes.infoContent}>
        <p>The main characters of the scene are coming through different periods in life. The behave differently through
            each of them.</p>
        <h2>Egg</h2>
        <div className={classes.bottomText}>The purest form</div>
        <p>
            As always, it all begins with the egg. In this form Geese have not much of a choice, basically the only
            available action to them is just lying and waiting.
            The amount of time they spend like that is defined by their <span className={classes.link}
                                                                              onClick={() => setTab('stats')}>Hatching time </span> parameter.
        </p>
        <h2>Child</h2>
        <div className={classes.bottomText}>Innocent days</div>
        <p>
            Just after the hatching small goslings trying to find the food and tend to follow their parents if they are
            satiated.
            However, there is a chance based on their <span className={classes.link}
                                                            onClick={() => setTab('stats')}>Curiosity</span> parameter
            that they will try to find some adventures elsewhere.
            The prolongation of the geese childhood can be anywhere between fleeting and everlasting depending on the
            selected simulation settings
        </p>
        <h2>Adulthood</h2>
        <div className={classes.bottomText}>When the real game begins (no)</div>
        <p>
            Reaching the adult life geese continue to grow, however their priorities will stay the same until the very
            death - feeding and breeding.
            Consequently, they prefer to stay near their latest place of repast and their latest breeding partner.
            Though, some of the most curious can decide that the can no longer live like that and try to look for
            another life, finally finding themselves doing exactly the same but in the other place.
        </p>
        <h2>Corpse</h2>
        <div className={classes.bottomText}>The final state of everything that breathes.</div>
        <p>
            Geese can reach this state during every single period of their life. There are many ways to do it,
            the most common though are: <span className={classes.link}
                                              onClick={() => setTab('plants')}>Food poisoning</span>, Malnutrition and
            Aging. There are only two ways from this condition - one is to become a nutrition for the plants, another - to become a nutrition for the carnivour geese
        </p>
    </div>
}

export default BehaviorInfo