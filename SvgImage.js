// @flow

import React, { forwardRef, useEffect, useState } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { WebView } from "react-native-webview";

// iOS sizes the svg in viewport units, Android in percent of the body.
const svgWidth = Platform.OS === "ios" ? "100vw" : "100%";
const svgHeight = Platform.OS === "ios" ? "100vh" : "100%";

const getHTML = (svgContent) => `
<html>
  <head>
    <style>
      html, body {
        margin: 0;
        padding: 0;
        height: 100%;
        width: 100%;
        overflow: hidden;
        background-color: transparent;
      }
      svg {
        position: fixed;
        top: 0;
        left: 0;
        height: ${svgHeight};
        width: ${svgWidth};
        overflow: hidden;
        object-fit: contain;
      }
    </style>
  </head>
  <body>
    ${svgContent}
  </body>
</html>
`;

const SvgImage = forwardRef(function SvgImage(
  { source, onLoadStart, onLoadEnd, style, containerStyle },
  ref
) {
  const [svgContent, setSvgContent] = useState(null);
  // The WebView stays invisible until its first load, so the svg doesn't flash.
  const [loaded, setLoaded] = useState(false);

  const uri = source && source.uri;
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    async function doFetch() {
      if (uri) {
        onLoadStart && onLoadStart();
        if (uri.match(/^data:image\/svg/)) {
          const index = uri.indexOf("<svg");
          setSvgContent(uri.slice(index));
        } else {
          try {
            const res = await fetch(uri, { signal });
            const text = await res.text();
            setSvgContent(text);
          } catch (err) {
            if (err.name !== "AbortError") {
              console.error("got error", err);
            }
          }
        }
        onLoadEnd && onLoadEnd();
      }
    }

    doFetch();

    return () => {
      controller.abort();
    };
  }, [uri]);

  if (svgContent) {
    const html = getHTML(svgContent);

    return (
      <View
        ref={ref}
        pointerEvents="none"
        style={[style, containerStyle]}
        renderToHardwareTextureAndroid={true}
      >
        <WebView
          originWhitelist={["*"]}
          style={[
            StyleSheet.flatten(style),
            { opacity: loaded ? 1 : 0, flex: 1 },
          ]}
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          source={{ html }}
          // Scripts inside a remote svg must not run.
          javaScriptEnabled={false}
          onLoadEnd={() => !loaded && setLoaded(true)}
        />
      </View>
    );
  } else {
    return (
      <View
        ref={ref}
        pointerEvents="none"
        style={[containerStyle, style]}
        renderToHardwareTextureAndroid={true}
      />
    );
  }
});

export default SvgImage;
