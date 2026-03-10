import { StyleSheet } from "react-native";

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E3A8A",
  },

  logo: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,

    borderWidth: 1,
    borderColor: "#D9E6FF",

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,

    elevation: 2,
  },

  nome: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },

  details: {
    marginTop: 10,
  },

  info: {
    fontSize: 15,
    marginTop: 4,
    color: "#374151",
  },

});

export { styles };