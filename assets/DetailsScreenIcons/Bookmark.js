import * as React from "react"
import Svg, { Path } from "react-native-svg"

function Bookmark(props) {
    return (
        <Svg
            xmlns="http://www.w3.org/2000/svg"
            width="800px"
            height="800px"
            viewBox="0 0 24 24"
            fill="none"
            {...props}
        >
            <Path
                d="M5 6.2c0-1.12 0-1.68.218-2.108a2 2 0 01.874-.874C6.52 3 7.08 3 8.2 3h7.6c1.12 0 1.68 0 2.108.218a2 2 0 01.874.874C19 4.52 19 5.08 19 6.2V21l-7-5-7 5V6.2z"
                stroke="#000"
                strokeWidth={2}
                strokeLinejoin="round"
            />
        </Svg>
    )
}

export default Bookmark
