import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 20
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20
  },

  title: {
    fontSize: 24,
    fontWeight: "bold"
  },

  logo: {
    width: 40,
    height: 40,
    resizeMode: "contain"
  },

  list: {
    paddingBottom: 20
  },

    card: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,

    borderWidth: 1,
    borderColor: "#649AFA",

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 2,
  },

  data: {
    fontSize: 18,
    fontWeight: "bold"
  },

  details: {
    marginTop: 10
  },

  text: {
    fontSize: 15,
    marginBottom: 4,
    color: '#555'
  },

  missao: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 6
  },

  info: {
    marginTop: 6
  }

});