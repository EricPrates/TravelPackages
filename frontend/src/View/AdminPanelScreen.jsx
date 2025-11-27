import { TouchableOpacity } from "react-native";

export default function AdminPanelScreen() {
    return (
        <View style={styles.container}>
            <TouchableOpacity>
                <Text>Criar Pacote</Text>
            </TouchableOpacity>
            <TouchableOpacity>
                <Text>Editar Pacote</Text>
            </TouchableOpacity>
            <TouchableOpacity>
                <Text>Criar Usuário</Text>
            </TouchableOpacity>
            <TouchableOpacity>
                <Text>Editar Usuário</Text>
            </TouchableOpacity>
        </View>
    );
}
