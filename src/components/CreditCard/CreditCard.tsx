import React from "react";
import classes from './CreditCard.module.scss'
import Github from "../../icons/Github";
import Instagram from "../../icons/Instagram";
import Spotify from "../../icons/Spotify";
import Telegram from "../../icons/Telegram";


type CreditsLink = {
    type: 'ig' | 'gh' | 'sp' | 'tg',
    link:string
}
interface ICreditCardProps {
    imageSrc: string,
    description: string,
    name: string,
    links: CreditsLink[]
    isDead?: boolean
}

const CreditCard = ({imageSrc, description, links, name, isDead = false}: ICreditCardProps) => <div className={classes.cardContainer}>
    <img src={imageSrc} alt={name}/>
    <div className={`${classes.name} ${isDead ? classes.ripFrame : ''}`}>{name}</div>
    <div className={classes.description}>{description}</div>
    <div className={classes.linksBox}>
        {links.map(({type, link}:CreditsLink) => {
            switch (type) {
                case "gh":
                    return <a href={link} key={type}>
                        <Github/>
                    </a>
                case "ig":
                    return <a href={link} key={type}>
                        <Instagram/>
                    </a>
                case "sp":
                    return <a href={link} key={type}>
                        <Spotify/>
                    </a>
                default:
                    return <a href={link} key={type}>
                        <Telegram/>
                    </a>
            }
        })}
    </div>
</div>

export default CreditCard