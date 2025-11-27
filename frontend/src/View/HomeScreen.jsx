import { FlatList, View } from "react-native";
import { Searchbar } from "react-native-paper";
import { useState } from "react";

export default function HomeScreen() {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <View style={{ padding: 16 }}>
            <Searchbar
                placeholder="Buscar destinos..."
                onChangeText={setSearchQuery}
                value={searchQuery}
            />
            <FlatList>
                {/* Render list of travel packages here based on searchQuery */}
            </FlatList>
        </View>
    );
}