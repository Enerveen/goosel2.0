export const getRandomInRange = (start: number, end: number) =>
    start + Math.floor(Math.random() * (end - start))

export const coinFlip = () => Math.random() > 0.5

export const rollNPercentChance = (percent: number) => Math.random() < percent

export const clsSum = (...classes: (string | null | undefined)[]): string => classes.filter(elem => !!elem).join(' ')
