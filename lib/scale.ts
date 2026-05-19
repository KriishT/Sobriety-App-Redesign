import { Dimensions, PixelRatio } from 'react-native';

const { width: W, height: H } = Dimensions.get('window');

// Design baseline — the screen size the UI was built on
const BASE_W = 390;
const BASE_H = 844;

/**
 * Scale a horizontal/general dimension proportionally to the screen width.
 * Use for icon sizes, container widths, border radii, horizontal padding.
 */
export function scale(n: number): number {
  return Math.round((W / BASE_W) * n);
}

/**
 * Scale a vertical dimension proportionally to the screen height.
 * Use for vertical padding, heights of fixed containers, margins.
 */
export function vs(n: number): number {
  return Math.round((H / BASE_H) * n);
}

/**
 * Moderate scale — less aggressive than scale(), good for font sizes and padding.
 * factor 0 = no scaling, factor 1 = full scaling. Default 0.45.
 */
export function ms(n: number, factor = 0.45): number {
  return Math.round(PixelRatio.roundToNearestPixel(n + (scale(n) - n) * factor));
}
