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
        <div className={classes.creditCardsBox}>
            <CreditCard
                imageSrc={yuPortrait}
                description={'Idea, Design, Coding, Balance'}
                name={'Uladzimir Yahorau'}
                links={[{type: "tg", link: 'https://t.me/worstlosing'}, {type: "gh", link: 'https://github.com/Enerveen'}]}
            />
            <CreditCard
                imageSrc={yuPortrait}
                description={'Coding'}
                name={'Konstantin Kovalev'}
                links={[{type: "gh", link: 'https://github.com/IMConstant'}]}
            />
            <CreditCard
                imageSrc={yuPortrait}
                description={'Art'}
                name={'Darya Bahinskaya'}
                links={[{type: "ig", link: 'https://www.instagram.com/_.rikitikitavi/'}]}
            />
            <CreditCard
                imageSrc={yuPortrait}
                description={'Soundtrack'}
                name={'AlbertJohnson'}
                links={[{type: "sp", link: 'https://open.spotify.com/artist/33oIGbBLDi5nW4bcJhkHSN?si=jbJh4IWKTDqtzoWL-rVFCA'}]}
            />
        </div>

        <Button onClick={() => setCurrentScreen('MAIN')} className={classes.button}>
            BACK
        </Button>
    </div>
}

export default Credits