import { Dimensions, PixelRatio } from 'react-native';
const { width, height } = Dimensions.get('window');
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;
export const scale = (size: number) =>
 (width / BASE_WIDTH) * size;
export const verticalScale = (size: number) =>
 (height / BASE_HEIGHT) * size;
export const fontScale = (size: number) =>
 size * PixelRatio.getFontScale();