import { Text, TextInput } from "react-native";
import { useAuth } from "../AuthContext";
import { Button } from "react-native-paper";
import UserForm from "../components/UserForm";
export default function CreateUserScreen() {
    
    return (
        <UserForm roleAgent="agent" />
    )
}