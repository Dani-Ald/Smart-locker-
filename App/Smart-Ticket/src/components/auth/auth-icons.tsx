import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';

type IconProps = {
  color: string;
  size?: number;
};

const strokeProps = {
  fill: 'none',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  strokeWidth: 1.6,
};

export function MailIcon({ color, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden>
      <Rect x="3" y="5" width="18" height="14" rx="3" stroke={color} {...strokeProps} />
      <Path d="m4.5 7 6.2 5a2.1 2.1 0 0 0 2.6 0l6.2-5" stroke={color} {...strokeProps} />
    </Svg>
  );
}

export function LockIcon({ color, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden>
      <Rect x="4" y="10" width="16" height="11" rx="3" stroke={color} {...strokeProps} />
      <Path d="M8 10V7a4 4 0 0 1 8 0v3" stroke={color} {...strokeProps} />
      <Line x1="12" y1="14.5" x2="12" y2="17" stroke={color} {...strokeProps} />
    </Svg>
  );
}

export function UserIcon({ color, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden>
      <Circle cx="12" cy="8" r="4" stroke={color} {...strokeProps} />
      <Path d="M4.5 21a7.5 7.5 0 0 1 15 0" stroke={color} {...strokeProps} />
    </Svg>
  );
}

export function EyeIcon({ color, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden>
      <Path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z" stroke={color} {...strokeProps} />
      <Circle cx="12" cy="12" r="2.5" stroke={color} {...strokeProps} />
    </Svg>
  );
}

export function EyeOffIcon({ color, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden>
      <Path d="M9.8 5.4A9.7 9.7 0 0 1 12 5.1c6.1 0 9.5 6.1 9.5 6.1a16 16 0 0 1-2.3 3.1M6.2 6.6C3.8 8.3 2.5 11.2 2.5 11.2s3.4 6.1 9.5 6.1c1.4 0 2.6-.3 3.7-.8M10.3 9.4a3.1 3.1 0 0 0 4.3 4.4M3 3l18 18" stroke={color} {...strokeProps} />
    </Svg>
  );
}

export function ArrowRightIcon({ color, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden>
      <Line x1="5" y1="12" x2="19" y2="12" stroke={color} {...strokeProps} />
      <Polyline points="14,7 19,12 14,17" stroke={color} {...strokeProps} />
    </Svg>
  );
}

export function AlertIcon({ color, size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden>
      <Circle cx="12" cy="12" r="9" stroke={color} {...strokeProps} />
      <Line x1="12" y1="7.5" x2="12" y2="12.5" stroke={color} {...strokeProps} />
      <Circle cx="12" cy="16.5" r="0.8" fill={color} />
    </Svg>
  );
}

export function GoogleIcon({ color, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden>
      <Path
        fill={color}
        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48Z"
      />
    </Svg>
  );
}

export function AppleIcon({ color, size = 21 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden>
      <Path
        fill={color}
        d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09ZM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701Z"
      />
    </Svg>
  );
}
