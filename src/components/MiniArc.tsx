import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { colors } from '../theme';

export function MiniArc() {
  return (
    <Svg width={46} height={46} viewBox="0 0 46 46">
      <Circle
        cx={23}
        cy={23}
        r={19}
        fill="none"
        stroke={colors.line}
        strokeWidth={4}
      />
      <Path
        d="M23 4 A19 19 0 0 1 39 32"
        fill="none"
        stroke="url(#g1)"
        strokeWidth={4}
        strokeLinecap="round"
      />
      <Defs>
        <LinearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor={colors.plum} />
          <Stop offset="100%" stopColor={colors.gold} />
        </LinearGradient>
      </Defs>
      <Circle cx={39} cy={32} r={3} fill={colors.gold} />
    </Svg>
  );
}
