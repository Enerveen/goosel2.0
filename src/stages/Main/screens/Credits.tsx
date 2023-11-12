import classes from "../Main.module.scss";
import Button from "../../../components/Button/Button";
import React from "react";
import {mainMenuScreens} from "../Main";
import CreditCard from "../../../components/CreditCard/CreditCard";
import yuPortrait from '../../../img/yu_portrait.png'
import ajPortrait from '../../../img/aj_portrait.png'
import dbPortrait from '../../../img/db_portrait.png'
import kkPortrait from '../../../img/kk_portrait.png'
import usePreloadedImages from "../../../hooks/useImagePreload";
import Loader from "../../../components/Loader/Loader";

interface ICreditsProps {
    setCurrentScreen: (screen: mainMenuScreens) => void
}

const Credits = ({setCurrentScreen}: ICreditsProps) => {
    const [, isImagesPreloaded] = usePreloadedImages({yuPortrait, ajPortrait, dbPortrait, kkPortrait})
    return <div className={classes.screenContainer}>
        {isImagesPreloaded ? <>
            <div className={classes.creditCardsBox}>
                <CreditCard
                    imageSrc={yuPortrait}
                    description={'Idea, Design, Coding, Balance'}
                    name={'Uladzimir Yahorau'}
                    links={[{type: "tg", link: 'https://t.me/worstlosing'}, {
                        type: "gh",
                        link: 'https://github.com/Enerveen'
                    }]}
                />
                <CreditCard
                    imageSrc={kkPortrait}
                    description={'Coding'}
                    isDead={true}
                    name={'Konstantin Kovalev'}
                    links={[{type: "gh", link: 'https://github.com/IMConstant'}]}
                />
                <CreditCard
                    imageSrc={dbPortrait}
                    description={'Art'}
                    name={'Darya Bahinskaya'}
                    links={[{type: "ig", link: 'https://www.instagram.com/_.rikitikitavi/'}]}
                />
                <CreditCard
                    imageSrc={ajPortrait}
                    description={'Soundtrack'}
                    name={'AlbertJohnson'}
                    links={[{
                        type: "sp",
                        link: 'https://open.spotify.com/artist/33oIGbBLDi5nW4bcJhkHSN?si=jbJh4IWKTDqtzoWL-rVFCA'
                    }]}
                />
            </div>
            <Button onClick={() => setCurrentScreen('MAIN')} className={classes.button}>
                BACK
            </Button></> : <Loader/>}


    </div>
}

export default Credits