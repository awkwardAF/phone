import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import * as SQLite from 'expo-sqlite';

import { Button } from '@rneui/themed';
import { ToastAndroid } from 'react-native';
import styles from "./welcome.style";
import { icons, SIZES } from "../../../constants";
import * as Location from 'expo-location';

const jobTypes = ["Full-time", "Part-time", "Contractor"];

async function detectLocation() {
  let result = await Location.requestForegroundPermissionsAsync();
  if (result.status !== "granted") {
    alert("sorry, no location")
  } else {
    let location = await Location.getCurrentPositionAsync({});
    alert("success\n" + JSON.stringify(location));
  }
  console.log(result);
}

function openDatabase() {
  if (Platform.OS === "web") {
    return {
      transaction: () => {
        return {
          executeSql: () => { },
        };
      },
    };
  }

  const db = SQLite.openDatabase("db.db");
  return db;
}

export const db = openDatabase();

const Welcome = ({ searchTerm, setSearchTerm, handleClick }) => {
  const [dbIsLoading, setDbIsLoading] = useState(false);
  const [lastRefesh, setLastRefresh] = (useState([]));
  const [lastRefreshDate, setLastRefreshDate] = useState(undefined);

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql('CREATE TABLE IF NOT EXISTS names (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)')
    });

    db.transaction(tx => {
      tx.executeSql('SELECT * FROM names', null,
        (txObj, resultSet) => { resultSet.rows.__array && setLastRefreshDate(resultSet.rows._array[resultSet.rows._array.length - 1].name) },
      );
    });

  }, []);

  if (dbIsLoading) {
    return (
      <View style={styles.welcomeMessage}>
        <Text>Loading last refresh...</Text>
      </View>
    )
  }
  const router = useRouter();
  const [activeJobType, setActiveJobType] = useState("Full-time");

  return (
    <View>
      <View style={styles.container}>
        <Button
          title="Detect location"
          onPress={detectLocation}
          buttonStyle={{ backgroundColor: '#FF7754', borderRadius: 10, overflow: 'hidden' }}
          containerStyle={{
            height: 40,
            width: 200,
            marginHorizontal: 70,
            marginVertical: 10,
          }} />
        <Text style={styles.userName}>Hello!</Text>
        <Text style={styles.welcomeMessage}>Here are some jobs that might be interesting for you</Text>
        <Text style={styles.welcomeMessageH2}>Last time updated: {lastRefreshDate}</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <TextInput
            style={styles.searchInput}
            value={searchTerm}
            onChangeText={(text) => setSearchTerm(text)}
            placeholder='What are you looking for?'
          />
        </View>

        <TouchableOpacity style={styles.searchBtn} onPress={handleClick}>
          <Image
            source={icons.search}
            resizeMode='contain'
            style={styles.searchBtnImage}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        <FlatList
          data={jobTypes}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.tab(activeJobType, item)}
              onPress={() => {
                setActiveJobType(item);
                router.push(`/search/${item}`);
              }}
            >
              <Text style={styles.tabText(activeJobType, item)}>{item}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
          contentContainerStyle={{ columnGap: SIZES.small }}
          horizontal
        />
      </View>
    </View>
  );
};

export default Welcome;
