import React, {useState} from 'react';
import {
  Alert,
  SafeAreaView,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  Platform,
  Dimensions,
  useColorScheme,
  View,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import axios from 'axios';
import Config from 'react-native-config';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import PermissionsService, {isIOS} from './Permissions';

axios.interceptors.request.use(
  async config => {
    let request = config;
    request.headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    request.url = configureUrl(config.url);
    return request;
  },
  error => error,
);

export const {height, width} = Dimensions.get('window');

export const configureUrl = url => {
  let authUrl = url;
  if (url && url[url.length - 1] === '/') {
    authUrl = url.substring(0, url.length - 1);
  }
  return authUrl;
};

export const fonts = {
  Bold: {fontFamily: 'Roboto-Bold'},
};

const options = {
  mediaType: 'photo',
  quality: 1,
  width: 256,
  height: 256,
  includeBase64: true,
};

const App = () => {
  const [result, setResult] = useState('');
  const [label, setLabel] = useState('');
  const sButton = () => {
    if(label=='Early Blight'){
      Alert.alert('Symptoms',
      'The first symptoms of early blight appear as small, circular or irregular, dark-brown to black spots on the older (lower).\nThese spots enlarge up to 3/8 inch in diameter and gradually may become angular-shaped. Initial lesions on young, fully expanded leaves may be confused with brown spot lesions.These first lesions appear about two to three days after infection, with further sporulation on the surface of these lesions occurring three to five days later.')
    }
    else{
        if(label=='Late Blight'){
          Alert.alert('Symptoms','The first symptoms of late blight in the field are small, light to dark green, circular to irregular-shaped water-soaked spots.\nThese lesions usually appear first on the lower leaves.\nLesions often begin to develop near the leaf tips or edges, where dew is retained the longest. During cool, moist weather, these lesions expand rapidly into large, dark brown or black lesions, often appearing greasy (Figure 2).\nLeaf lesions also frequently are surrounded by a yellow chlorotic halo.')
        }
        else{
            if(label=='Healthy'){
               Alert.alert('Symptoms','Normal')
              }
            else{
              Alert.alert('Symptoms',
              'Go Back & Firstly Select Image.')
              }
            }
        }
  };
  const tButton = () => {
    if(label=='Early Blight'){
      Alert.alert('Treatments','Select a late-season variety with a lower susceptibility to early blight.(Resistance is associated with plant maturity and early maturing cultivars are more susceptible).\nTime irrigation to minimize leaf wetness duration during cloudy weather and allow sufficient time for leaves to dry prior to nightfall.\nAvoid nitrogen and phosphorus deficiency.\nScout fields regularly for infection beginning after plants reach 12 inches in height.\nPay particular attention to edges of fields that are adjacent to fields planted to potato the previous year.'
      )
    }
    else{
      if(label=='Late Blight'){
        Alert.alert('Treatments','Destroy all cull and volunteer potatoes.\nPlant late blight-free seed tubers.\nDo not mix seed lots because cutting can transmit late blight.\nUse a seed piece fungicide treatment labeled for control of late blight (current list of fungicides can be found in the NDSU Fungicide Guide,PP622). Recommended seed treatments include Revus, Reason and mancozeb.\nAvoid planting problem areas that may remain wet for extended periods or may be difficult to spray (the center of the pivot, along powerlines and tree lines).\nAvoid excessive and/or nighttime irrigation.\nEliminate sources of inoculum such as hairy nightshade weed species and volunteer potatoes.\nScout fields regularly, especially in low, wet areas, along tree lines, at the center of the pivot and other areas that remain wet for longer periods where late blight first may occur.\nUse foliar fungicides on a regular and continuing schedule.\nOnce late blight is present, only foliar fungicide applications can manage late blight in the field. (A current list of fungicides can be found in the NDSU Fungicide Guide,PP622).')
      }
      else{
          if(label=='Healthy'){
             Alert.alert('Treatments','Nothing')
            }
          else{
            Alert.alert('Treatments',
            'Go Back & Firstly Select Image.')
            }
          }
      }
};
  const isDarkMode = useColorScheme() === 'dark';
  const [image, setImage] = useState('');
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const getPredication = async params => {
    return new Promise((resolve, reject) => {
      var bodyFormData = new FormData();
      bodyFormData.append('file', params);
      const url = Config.URL;
      return axios
        .post(url, bodyFormData)
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          setLabel('Failed');
          reject('err', error);
        });
    });
  };

  const manageCamera = async type => {
    try {
      if (!(await PermissionsService.hasCameraPermission())) {
        return [];
      } else {
        if (type === 'Camera') {
          openCamera();
        } else {
          openLibrary();
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const openCamera = async () => {
    launchCamera(options, async response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        const uri = response?.assets[0]?.uri;
        const path = Platform.OS !== 'ios' ? uri : 'file://' + uri;
        getResult(path, response);
      }
    });
  };

  const clearOutput = () => {
    setResult('');
    setImage('');
  };

  const getResult = async (path, response) => {
    setImage(path);
    setLabel('Predicting...');
    setResult('');
    const params = {
      uri: path,
      name: response.assets[0].fileName,
      type: response.assets[0].type,
    };
    const res = await getPredication(params);
    if (res?.data?.class) {
      setLabel(res.data.class);
      setResult(res.data.confidence);
    } else {
      setLabel('Failed to predict');
    }
  };

  const openLibrary = async () => {
    launchImageLibrary(options, async response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        const uri = response.assets[0].uri;
        const path = Platform.OS !== 'ios' ? uri : 'file://' + uri;
        getResult(path, response);
      }
    });
  };

  return (
    <View style={[backgroundStyle, styles.outer]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ImageBackground
        blurRadius={10}
        source={{uri: 'background'}}
        style={{height: height, width: width}}
      />
      <Text style={styles.title}>{'Potato Disease \nPrediction App'}</Text>
      <TouchableOpacity onPress={clearOutput} style={styles.clearStyle}>
        <Image source={{uri: 'clean'}} style={styles.clearImage} />
      </TouchableOpacity>
      {(image?.length && (
        <Image source={{uri: image}} style={styles.imageStyle} />
      )) ||
        null}
      {(result && label && (
        <View style={styles.mainOuter}>
          <Text style={[styles.space, styles.labelText]}>
            {'Label: \n'}
            <Text style={styles.resultText}>{label}</Text>
          </Text>
          <Text style={[styles.space, styles.labelText]}>
            {'Confidence: \n'}
            <Text style={styles.resultText}>
              {parseFloat(result).toFixed(2) + '%'}
            </Text>
          </Text>
        </View>
      )) ||
        (image && <Text style={styles.emptyText}>{label}</Text>) || (
          <Text style={styles.emptyText}>
            Use below buttons to select a picture of a potato plant leaf.
          </Text>
        )}
        <View style={styles.stbtn}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={sButton}
          style={styles.stbtnStyle}>
          <Text style={styles.stText}>Symptoms</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={tButton}
          style={styles.stbtnStyle}>
          <Text style={styles.stText}>Treatments</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.btn}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => manageCamera('Camera')}
          style={styles.btnStyle}>
          <Image source={{uri: 'camera'}} style={styles.imageIcon} />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => manageCamera('Photo')}
          style={styles.btnStyle}>
          <Image source={{uri: 'gallery'}} style={styles.imageIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    alignSelf: 'center',
    position: 'absolute',
    top: (isIOS && 35) || 10,
    fontSize: 30,
    ...fonts.Bold,
    color: '#FFF',
  },
  clearImage: {height: 40, width: 40, tintColor: '#FFF'},
  mainOuter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    top: height / 1.7,
    alignSelf: 'center',
  },
  outer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stbtn: {
    position: 'absolute',
    bottom: 130,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  btn: {
    position: 'absolute',
    bottom: 10,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  stbtnStyle: {
    backgroundColor: '#FFF',
    opacity: 0.8,
    marginHorizontal: 30,
    padding: 10,
    borderRadius: 10,
  },
  btnStyle: {
    backgroundColor: '#FFF',
    opacity: 0.8,
    marginHorizontal: 30,
    padding: 20,
    borderRadius: 20,
  },
  imageStyle: {
    marginBottom: 50,
    width: width / 1.5,
    height: width / 1.5,
    borderRadius: 20,
    position: 'absolute',
    borderWidth: 0.3,
    borderColor: '#FFF',
    top: height / 5.7,
  },
  clearStyle: {
    position: 'absolute',
    top: 65,
    right: 30,
    tintColor: '#FFF',
    zIndex: 10,
  },
  space: {marginVertical: 10, marginHorizontal: 10},
  labelText: {color: '#FFF', fontSize: 20, ...fonts.Bold},
  resultText: {fontSize: 32, ...fonts.Bold},
  imageIcon: {height: 40, width: 40, tintColor: '#000'},
  stText: {color:'#000000',textAlign:'center', ...fonts.Bold},
  emptyText: {
    position: 'absolute',
    top: height / 1.7,
    alignSelf: 'center',
    color: '#FFF',
    fontSize: 20,
    maxWidth: '70%',
    ...fonts.Bold,
  },
});

export default App;
