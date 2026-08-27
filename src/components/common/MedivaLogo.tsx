import React from 'react';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, G } from 'react-native-svg';

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
    <Svg width={width} height={height} viewBox="0 0 112 112" fill="none">
      <Defs>
        <LinearGradient id="medivaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={color} stopOpacity="1" />
          <Stop offset="100%" stopColor="#0056b3" stopOpacity="0.8" />
        </LinearGradient>
      </Defs>
      <Circle cx="56" cy="56" r="50" fill="url(#medivaGrad)" opacity={0.15} />
      <Circle cx="56" cy="56" r="40" fill="url(#medivaGrad)" opacity={0.25} />
      <Path
        d="M62 38H50V50H38V62H50V74H62V62H74V50H62V38Z"
        fill="url(#medivaGrad)"
      />
    </Svg>
  );
};
