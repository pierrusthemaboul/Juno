import { StyleSheet } from 'react-native';
import { colors } from '../styles/colors';

export default StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.lightBlue,
    padding: 15,
    paddingTop: 50,
  },
  content: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between',
  },
  previousEventContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 10,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  previousEventTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  previousEventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.darkText,
    marginBottom: 5,
  },
  previousEventDate: {
    fontSize: 14,
    color: colors.darkText,
  },
  previousEventImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  newEventContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    flex: 1,
  },
  newEventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.darkText,
    marginBottom: 15,
    textAlign: 'center',
  },
  newEventImage: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 10,
    marginBottom: 15,
  },
  choiceButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  choiceButton: {
    backgroundColor: colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  choiceButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#F44336',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 10,
  },
  buttonClose: {
    backgroundColor: colors.accent,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  },
  eventPrompt: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  promptText: {
    fontSize: 18,
    color: 'black',
    marginVertical: 5,
  },
  retryButton: {
    backgroundColor: colors.lightBlue,
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
  },
});