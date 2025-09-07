import * as React from "react"
import Svg, { Path } from "react-native-svg"

function TrendDown(props) {
    return (
        <Svg
            xmlns="http://www.w3.org/2000/svg"
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ee1717"
            {...props}
        >
            <Path
                d="M22 17l-7.869-7.869c-.396-.396-.594-.594-.822-.668a1 1 0 00-.618 0c-.228.074-.426.272-.822.668L9.13 11.87c-.396.396-.594.594-.822.668a1 1 0 01-.618 0c-.228-.074-.426-.272-.822-.668L2 7m20 10h-7m7 0v-7"
                stroke="#fa0000"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    )
}

export default TrendDown
