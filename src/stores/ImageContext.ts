import {createContext} from "react";

const ImageContext = createContext<{ [key: string]: string }>({})

export default ImageContext