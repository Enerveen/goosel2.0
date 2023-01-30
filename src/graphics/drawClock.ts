import {clockColors} from "../constants/colors"
import {getReadableDate} from "../utils/nameGen";

const drawClock = (timestamp: number, ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const angle = Math.floor((timestamp * 3) / 10) % 360
    const tickInterval = 6 // Defines padding between ticks, should be multiple of 30
    const centerX = width / 2
    const centerY = height / 2
    const radius = width / 2 - 10
    ctx.clearRect(0, 0, width, height)

    ctx.beginPath()
    ctx.strokeStyle = '#fafafa'
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    ctx.stroke()

    // Assuming that we have 4 colors, one for each month
    clockColors.forEach((color, index) => {
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.arc(
            centerX,
            centerY,
            radius,
            (index * 90 - 90) * (Math.PI / 180),
            (index * 90) * (Math.PI / 180),
            false
        )
        ctx.lineTo(centerX, centerY)
        ctx.fill()
    })

    ctx.beginPath()
    ctx.strokeStyle = "black"
    ctx.lineWidth = 3

    for (let i = 0; i < 360; i += tickInterval) {
        const [tickX, tickY] = [
            centerX + (radius - 5) * Math.cos((i - 90) * (Math.PI / 180)),
            centerY + (radius - 5) * Math.sin((i - 90) * (Math.PI / 180))
        ]

        if (i % 30 === 0) {
            ctx.moveTo(
                centerX + (radius - 25) * Math.cos((i - 90) * (Math.PI / 180)),
                centerY + (radius - 25) * Math.sin((i - 90) * (Math.PI / 180))
            )
            ctx.lineTo(tickX, tickY)
        } else {
            ctx.moveTo(
                centerX + (radius - 15) * Math.cos((i - 90) * (Math.PI / 180)),
                centerY + (radius - 15) * Math.sin((i - 90) * (Math.PI / 180))
            )
            ctx.lineTo(tickX, tickY)
        }
    }
    ctx.stroke()

    ctx.strokeStyle = "rgba(34,34,34,0.7)"
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    const [handX, handY] = [
        centerX + radius * 0.8 * Math.cos((angle - 90) * (Math.PI / 180)),
        centerY + radius * 0.8 * Math.sin((angle - 90) * (Math.PI / 180))
    ]
    ctx.lineTo(handX, handY)
    ctx.lineWidth = 5
    ctx.stroke()
    ctx.fillStyle = '#000000'
    ctx.textAlign = 'center'
    ctx.font = '22px ComicSansMS'
    const {date, year} = getReadableDate(timestamp)
    ctx.fillText(date, centerX, centerY - 11)
    ctx.fillText(year, centerX, centerY + 22)
}

export default drawClock