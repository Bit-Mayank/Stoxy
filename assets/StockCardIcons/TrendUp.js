import * as React from "react"
import Svg, { Path } from "react-native-svg"

function TrendUp(props) {
    return (
        <Svg
            xmlns="http://www.w3.org/2000/svg"
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            {...props}
        >
            <Path
                d="M3 17l6-6 4 4 8-8m0 0v5m0-5h-5"
                stroke="#18cc00"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    )
}

export default TrendUp
