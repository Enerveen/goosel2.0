import classes from "../Main.module.scss";
import Button from "../../../components/Button/Button";
import React from "react";
import {mainMenuScreens} from "../Main";
import CreditCard from "../../../components/CreditCard/CreditCard";
import yuPortrait from '../../../img/yu_portrait.png'

interface ICreditsProps {
    setCurrentScreen: (screen: mainMenuScreens) => void
}

const Credits = ({setCurrentScreen}: ICreditsProps) => {
    return <div className={classes.screenContainer}>
        <CreditCard
            imageSrc={yuPortrait}
            description={'Idea, Coding, Balance'}
            name={'Uladzimir Yahorau'}
            links={[{type: "tg", link: 'https://t.me/worstlosing'}, {type: "gh", link: 'https://github.com/Enerveen'}]}
        />
        <Button onClick={() => setCurrentScreen('MAIN')} className={classes.button}>
            BACK
        </Button>
    </div>
}

export default Credits