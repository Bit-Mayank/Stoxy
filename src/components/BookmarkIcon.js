import React from 'react';
import Svg, { Path } from 'react-native-svg';

const BookmarkIcon = ({
    width = 24,
    height = 24,
    stroke = '#000',
    fill = 'none',
    strokeWidth = 2,
    ...props
}) => {
    return (
        <Svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            {...props}
        >
            <Path
                d="M6 6.2c0-1.12 0-1.68.218-2.108a2 2 0 01.874-.874C7.52 3 8.08 3 9.2 3h5.6c1.12 0 1.68 0 2.108.218a2 2 0 01.874.874C18 4.52 18 5.08 18 6.2V21l-6-4.5L6 21V6.2z"
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeLinejoin="round"
                fill={fill}
            />
        </Svg>
    );
};

export default BookmarkIcon;
