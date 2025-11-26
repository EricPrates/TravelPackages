export default function RegisterUserScreen() {
    const control = LoginController();
    const { email, password, error, name } = control.state;
    const { registerUser, setName, setEmail, setPassword } = control.actions;
    return (
        <View style={styles.container}>
            <View style={{ backgroundColor: '#ffffff', padding: 20, borderRadius: 10, elevation: 5, borderWidth: 1, borderColor: '#6796f3ff' }}>
                <Text style={styles.title}>Registrar novo usuário</Text>
                <View>
                    <TextInput
                        left={<TextInput.Icon icon='email' color="#6796f3ff" />}
                        label="Nome"
                        mode="outlined"
                        icon="email"
                        style={{ margin: 10 }}
                        value={name}
                        onChangeText={setName}
                    />
                    <TextInput
                        left={<TextInput.Icon icon='email' color="#6796f3ff" />}
                        label="Email"
                        mode="outlined"
                        icon="email"
                        style={{ margin: 10 }}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                    />
                    <TextInput
                        left={<TextInput.Icon icon='lock' color="#6796f3ff" />}
                        label="Password"
                        mode="outlined"
                        icon="lock"
                        style={{ margin: 10 }}
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />
                    {error && <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>}
                    <TouchableOpacity onPress={async () => await registerUser(email, password)}
                        style={{ backgroundColor: '#6796f3ff', padding: 10, margin: 10, borderRadius: 5 }}>
                        <Text style={{ color: '#fff', textAlign: 'center' }}>Registrar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}