import React from 'react';
import { Image, Platform } from 'react-native';
import SvgImage from './SvgImage';

const MyImage = React.forwardRef(({ style = {}, ...props }, ref) => {
  // Image.resolveAssetSource replaces the deep import of
  // react-native/Libraries/Image/resolveAssetSource; web has no asset registry.
  const source = Platform.OS === 'web' ? props.source : Image.resolveAssetSource(props.source);
  if (source && source.uri && source.uri.match('.svg')) {
    if (source.__packager_asset && typeof style !== 'number') {
      if (!style.width) {
        style.width = source.width;
      }
      if (!style.height) {
        style.height = source.height;
      }
    }
    return <SvgImage ref={ref} {...props} source={source} style={style} />;
  } else {
    return <Image ref={ref} {...props} source={source} style={style} resizeMode="contain" />;
  }
});

export default MyImage;
