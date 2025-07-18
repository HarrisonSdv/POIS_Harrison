import React from "react";
import { StyleSheet, Text, SafeAreaView, Platform, StatusBar, View } from "react-native";
import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import MapView, { Marker, Callout } from "react-native-maps";
import axios from "axios";

export default function App() {
  const defaultRegion = {
    latitude: 43.7956669,
    longitude: -79.3502433,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  const category1 = "catering.restaurant";
  const category2 = "catering.cafe";
  const radius = 10000;
  const limit = 20;

  const apiKey = "b09df4b4ee614bf0961ae9037190548b";

  const mapReference = useRef(null);

  const [places, setPlaces] = useState([]);

  const [currentLocation, setCurrentLocation] = useState([]);

  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      // Handle denied permission here
      setCurrentLocation(defaultRegion);
    } else{
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        });
  
        if (location !== undefined) {
          console.log(`Current Location: ${JSON.stringify(location, null, 2)}`);
          setCurrentLocation(location);
  
          const currentLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.2,
            longitudeDelta: 0.2,
          };

          
  
          if (mapReference.current) {
            mapReference.current.animateToRegion(currentLocation);
          } else {
            console.log("MapView reference is not available!");
          }
          fetchPlaces(currentLocation.latitude, currentLocation.longitude);
        }
      } catch (error) {
        console.log(`Error while fetching current location: ${error.message}`);
      }
    }
  };


  const fetchPlaces = async (latitude, longitude) => {
    try {
      const url = `https://api.geoapify.com/v2/places?categories=${category1},${category2}&conditions=named&filter=circle:${longitude},${latitude},${radius}&limit=${limit}&apiKey=${apiKey}`;
      //console.log(`Fetching Places: ${url}`);
      const response = await axios.get(url);
      setPlaces(response.data.features);
      //console.log(`Found Places: ${JSON.stringify(response.data.features, null, 2)}`)
    
    } catch (error) {
      console.log("Error fetching the places", error);
    }
  };

    useEffect(() => {
      getCurrentLocation();
    }, []);
  

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.Heading}>What's Nearby?</Text>
      <Text style={styles.textColor}>Displaying restaurants and cafes near you</Text>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.mapView}
          initialRegion={defaultRegion}
          ref={mapReference}
        >
          <Marker
            coordinate={{
              latitude: currentLocation.coords ? currentLocation.coords.latitude : defaultRegion.latitude,
              longitude: currentLocation.coords ? currentLocation.coords.longitude : defaultRegion.longitude,
            }}
            title="Current Location"
            description="Your current location"
          />
          {places.map((place, index) => {
          return (
            <Marker
              key={index}
              coordinate={{
                latitude: place.geometry.coordinates[1],
                longitude: place.geometry.coordinates[0],
              }}
              title={place.properties.name || "Missing Name"}
              description={place.properties.address_line2 || "Missing Address"}
              image = {place.properties.categories.includes("catering.restaurant") ? require("./assets/restaurant.png") : require("./assets/cafe.png")}
            />
          );
        })}
        </MapView>
      </View>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    width: '90%',
    height: '80%',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#fff',
  },
  mapView: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    alignItems: "center",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  textColor: {
    color: "white",
  },
  Heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  calloutContainer: {
    width: 200,
     backgroundColor: 'white',
     borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom:-10
  },
    calloutTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
    calloutDescription: {
    fontSize: 12,
  },
});