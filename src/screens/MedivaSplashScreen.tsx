import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

const splashHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport"
      content="width=device-width,
               initial-scale=1.0,
               maximum-scale=1.0,
               user-scalable=no" />

<title>Mediva Mobile Splash</title>

<style>

:root {
  --cyan: #0A4A8F;
  --cyan-light: #20D5EA;
  --navy: #09213F;
  --muted: #61768B;
  --white: #FFFFFF;
}

* {
  box-sizing: border-box;
}

html,
body {
  width: 100%;
  height: 100%;
  margin: 0;
}

body {
  overflow: hidden;

  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    Arial,
    sans-serif;

  background:
    radial-gradient(
      circle at 50% 43%,
      rgba(32, 213, 234, 0.14),
      rgba(32, 213, 234, 0.035) 30%,
      transparent 55%
    ),

    linear-gradient(
      180deg,
      #FFFFFF 0%,
      #F7FCFE 100%
    );
}


/* ========================================
   MOBILE SPLASH
======================================== */

.splash {

  position: relative;

  width: 100vw;
  height: 100vh;

  min-height: 560px;

  display: flex;

  align-items: center;
  justify-content: center;

  overflow: hidden;
}


/* ========================================
   BACKGROUND GLOW
======================================== */

.glow {

  position: absolute;

  width: 300px;
  height: 300px;

  border-radius: 50%;

  background:
    radial-gradient(
      circle,
      rgba(10,74,143,.13),
      rgba(10,74,143,.04) 45%,
      transparent 70%
    );

  filter: blur(30px);

  animation:
    glowPulse 4s ease-in-out infinite;
}


/* ========================================
   CONTENT
======================================== */

.content {

  position: relative;

  width: 100%;

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  text-align: center;

  transform: translateY(-2%);
}


/* ========================================
   LOGO
======================================== */

.logo-container {

  position: relative;

  width: 190px;
  height: 190px;

  display: flex;

  align-items: center;
  justify-content: center;

  margin-bottom: 22px;

  animation:
    logoEnter 1.1s
    cubic-bezier(.16,1,.3,1)
    forwards;
}


/* subtle ring */

.logo-ring {

  position: absolute;

  width: 175px;
  height: 175px;

  border-radius: 50%;

  border:
    1px solid
    rgba(10,74,143,.10);

  animation:
    ringPulse 3s ease-in-out infinite;
}


/* second ring */

.logo-ring::after {

  content: "";

  position: absolute;

  inset: 12px;

  border-radius: 50%;

  border:
    1px solid
    rgba(10,74,143,.045);
}


/* ========================================
   SVG LOGO
======================================== */

.logo-svg {

  width: 145px;
  height: 145px;

  overflow: visible;
}


/* document */

.logo-line {

  fill: none;

  stroke: var(--cyan);

  stroke-width: 10;

  stroke-linecap: round;

  stroke-linejoin: round;

  stroke-dasharray: 360;

  stroke-dashoffset: 360;

  animation:
    drawLogo 1.25s
    cubic-bezier(.65,0,.25,1)
    .25s
    forwards;
}


/* medical plus */

.medical-cross {

  fill: var(--cyan);

  opacity: 0;

  transform-origin: center;

  transform-box: fill-box;

  animation:
    crossAppear
    .45s
    ease-out
    1.15s
    forwards;
}


/* ========================================
   MEDIVA NAME
======================================== */

.brand {

  opacity: 0;

  transform:
    translateY(16px);

  animation:
    brandEnter
    .8s
    ease-out
    1.25s
    forwards;
}


.brand-name {

  margin: 0;

  color: var(--navy);

  font-size: 46px;

  font-weight: 750;

  line-height: 1;

  letter-spacing: .18em;

  padding-left: .18em;
}


/* ========================================
   TAGLINE
======================================== */

.tagline {

  margin:

    17px

    0

    0;

  color: var(--muted);

  font-size: 9px;

  font-weight: 600;

  letter-spacing: .25em;

  padding-left: .25em;

  white-space: nowrap;
}


/* ========================================
   LOADING INDICATOR
======================================== */

.loading {

  width: 80px;

  height: 2px;

  margin-top: 48px;

  border-radius: 100px;

  background:
    rgba(8,168,198,.10);

  overflow: hidden;

  opacity: 0;

  animation:
    fadeIn
    .5s
    ease
    1.7s
    forwards;
}


.loading::after {

  content: "";

  display: block;

  width: 32px;

  height: 100%;

  border-radius: inherit;

  background:
    linear-gradient(
      90deg,
      var(--cyan),
      var(--cyan-light)
    );

  animation:
    loadingMove
    1.7s
    ease-in-out
    1.7s
    infinite;
}


/* ========================================
   BOTTOM BRAND MESSAGE
======================================== */

.bottom-text {

  position: absolute;

  bottom: 30px;

  width: 100%;

  text-align: center;

  color: #9AAAB9;

  font-size: 8px;

  font-weight: 600;

  letter-spacing: .18em;

  opacity: 0;

  animation:
    fadeIn
    .7s
    ease
    1.9s
    forwards;
}


/* ========================================
   ANIMATIONS
======================================== */

@keyframes logoEnter {

  0% {

    opacity: 0;

    transform:
      scale(.65)
      translateY(25px);

  }

  70% {

    opacity: 1;

    transform:
      scale(1.04)
      translateY(0);

  }

  100% {

    opacity: 1;

    transform:
      scale(1)
      translateY(0);

  }

}


@keyframes drawLogo {

  to {

    stroke-dashoffset: 0;

  }

}


@keyframes crossAppear {

  0% {

    opacity: 0;

    transform: scale(.5);

  }

  70% {

    opacity: 1;

    transform: scale(1.08);

  }

  100% {

    opacity: 1;

    transform: scale(1);

  }

}


@keyframes brandEnter {

  to {

    opacity: 1;

    transform:
      translateY(0);

  }

}


@keyframes fadeIn {

  to {

    opacity: 1;

  }

}


@keyframes glowPulse {

  0%,
  100% {

    transform: scale(.85);

    opacity: .6;

  }

  50% {

    transform: scale(1.1);

    opacity: 1;

  }

}


@keyframes ringPulse {

  0%,
  100% {

    transform: scale(.98);

    opacity: .45;

  }

  50% {

    transform: scale(1.04);

    opacity: 1;

  }

}


@keyframes loadingMove {

  0% {

    transform:
      translateX(-80px);

  }

  50% {

    transform:
      translateX(80px);

  }

  100% {

    transform:
      translateX(-80px);

  }

}


/* ========================================
   SMALL PHONES
======================================== */

@media (max-height: 650px) {

  .logo-container {

    width: 150px;
    height: 150px;

    margin-bottom: 12px;
  }

  .logo-svg {

    width: 115px;
    height: 115px;
  }

  .logo-ring {

    width: 140px;
    height: 140px;
  }

  .brand-name {

    font-size: 38px;
  }

  .loading {

    margin-top: 30px;
  }

}


/* ========================================
   VERY SMALL WIDTH
======================================== */

@media (max-width: 340px) {

  .brand-name {

    font-size: 34px;

  }

  .tagline {

    font-size: 7px;

  }

}

</style>
</head>


<body>

<div class="splash">

  <div class="glow"></div>

  <div class="content">

    <!-- ==================================
         MEDIVA LOGO
    =================================== -->

    <div class="logo-container">

      <div class="logo-ring"></div>

      <svg
        class="logo-svg"
        viewBox="0 0 160 160"
        xmlns="http://www.w3.org/2000/svg"
      >

        <!-- Medical document -->

        <path
          class="logo-line"
          d="
            M42 32
            L80 55
            L118 32
            L118 86

            M42 32
            L42 125

            Q42 130
            47 130

            L92 130
          "
        />


        <!-- Medical cross -->

        <path
          class="medical-cross"
          d="
            M89 78
            H101
            V90

            H113
            V102

            H101
            V114

            H89
            V102

            H77
            V90

            H89
            Z
          "
        />

      </svg>

    </div>


    <!-- ==================================
         BRAND
    =================================== -->

    <div class="brand">

      <h1 class="brand-name">
        MEDIVA
      </h1>

      <p class="tagline">
        YOUR HEALTH, REMEMBERED.
      </p>

    </div>


    <!-- Loading -->

    <div
      class="loading"
      aria-hidden="true">
    </div>

  </div>


  <!-- Bottom -->

  <div class="bottom-text">
    PRIVATE&nbsp;&nbsp;&bull;&nbsp;&nbsp;INTELLIGENT&nbsp;&nbsp;&bull;&nbsp;&nbsp;PERSONAL
  </div>

</div>

</body>
</html>`;

export const MedivaSplashScreen = () => {
  return (
    <View style={styles.container}>
      <WebView
        source={{ html: splashHtml }}
        style={styles.webview}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        bounces={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    height: height,
    backgroundColor: '#FFFFFF',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
