// CoffeeBackground.tsx
import React, { ReactNode } from "react";
import { ImageBackground, StyleSheet } from "react-native";

type CoffeeBackgroundProps = {
  children?: ReactNode;
};

const CoffeeBackground: React.FC<CoffeeBackgroundProps> = ({ children }) => {
  return (
    <ImageBackground
      source={require("../assets/coffee-background.jpg")}
      style={styles.background}
      imageStyle={{ opacity: 0.05 }} // very light
    >
      {children}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
});

export default CoffeeBackground;
