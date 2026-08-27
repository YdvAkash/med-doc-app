import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface MedivaLogoProps {
  width?: number;
  height?: number;
  color?: string;
}

export const MedivaLogo: React.FC<MedivaLogoProps> = ({ 
  width = 72, 
  height = 72, 
  color = '#0aa8c6' 
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 160 160" fill="none">
      <Path
        d="M 42 32 L 80 55 L 118 32 L 118 86 M 42 32 L 42 125 Q 42 130 47 130 L 92 130"
        fill="none"
        stroke={color}
        strokeWidth={11}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M 42 32 L 80 55 L 118 32"
        fill="none"
        stroke={color}
        strokeWidth={11}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M 89 78 H 101 V 90 H 113 V 102 H 101 V 114 H 89 V 102 H 77 V 90 H 89 Z"
        fill={color}
      />
    </Svg>
  );
};
