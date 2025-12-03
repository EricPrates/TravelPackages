import { useAuth } from "../AuthContext";
import { useState } from 'react';
import UserForm from "../components/UserForm"
import { useNavigation } from "@react-navigation/native";

export default function RegisterScreen() {
    const navigation = useNavigation();

    return (
        <UserForm roleAgent="customer" />
    );
}
              