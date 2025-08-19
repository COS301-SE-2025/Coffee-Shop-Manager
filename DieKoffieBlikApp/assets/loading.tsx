import React from "react";
import { View, StyleSheet, Dimensions, Modal } from "react-native";
import LottieView from "lottie-react-native";

const { width } = Dimensions.get("window");

type CoffeeLoadingProps = {
  visible: boolean;
};

export default function CoffeeLoading({ visible }: CoffeeLoadingProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <LottieView
          source={require("../assets/coffee-loading.json")}
          autoPlay
          loop
          style={styles.animation}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255, 166, 94, 0.04)",
    justifyContent: "center",
    alignItems: "center",
  },
  animation: {
    width: width * 0.5,
    height: width * 0.5,
  },
});
