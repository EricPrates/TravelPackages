## Quick context

- This is a small Expo React Native app (Expo SDK ~54) with a single entrypoint `index.js` that registers `App` from `App.js`.
- Navigation is provided by `@react-navigation/drawer` and screens live under `src/View/` (example: `src/View/HomeScreen.jsx`).
- Key commands are in `package.json` (start, android, ios, web, tunnel). Use `npm run start` / `npm run tunnel` for bundler workflows.

## What this agent should know (high value, actionable items)

- Entry/bootstrapping
  - `index.js` uses `registerRootComponent(App)`. Changes to app-level providers should be done in `App.js`.
  - `App.js` builds a `NavigationContainer` + `Drawer.Navigator` and registers screens there.

- Where to add new screens
  - Create a new file under `src/View/`, export a default React component (functional component). Example: `src/View/AboutScreen.jsx`.
  - In `App.js` add a drawer entry: `import AboutScreen from './src/View/AboutScreen';` then `<Drawer.Screen name="About" component={AboutScreen} />`.

- Conventions and patterns observed
  - Screens are simple default exports (no named exports used). Follow the same style.
  - Minimal styling is used inline or via `StyleSheet.create` in `App.js`. Mirror that style for small screens.
  - No global state manager (Redux / Context) currently in repo — prefer local state or add Context under `src/context/` if needed and document it.

- Dev / run commands
  - Start Metro with Expo: `npm run start` (alias for `expo start`).
  - Run on device/emulator: `npm run android` / `npm run ios` (Expo-managed flows).
  - Use tunnel for remote device debugging: `npm run tunnel` (runs `expo start --tunnel`).

- Dependencies & integration points
  - `expo`, `react`, `react-native`, `@react-navigation/drawer`, `react-native-gesture-handler`, `react-native-reanimated` are key packages. Changes to native modules may require ejecting from Expo.
  - `ngrok` is present in `package.json` (likely for tunneling) — when adjusting networking, prefer `npm run tunnel` which leverages the bundler tunnel mode.

## Examples (copy-ready)

- Add a new screen file at `src/View/AboutScreen.jsx`:

  ```jsx
  import { View, Text } from 'react-native';
  export default function AboutScreen() {
    return (
      <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
        <Text>About</Text>
      </View>
    );
  }
  ```

- Register it in `App.js`:

  ```js
  import AboutScreen from './src/View/AboutScreen';
  // inside <Drawer.Navigator>
  <Drawer.Screen name="About" component={AboutScreen} />
  ```

## What *not* to assume

- There is currently no established global state or API module; do not introduce architectural-wide tools without documenting them.
- Do not assume extra native configuration (there is no `android`/`ios` native project files here) — project is managed by Expo.

## Where to look for more context

- `App.js` — navigation and app-level composition.
- `index.js` — app bootstrap.
- `package.json` — scripts and dependency list.
- `src/View/*` — example screens and component style.

---
If you'd like, I can:
- add a short example `src/View/README.md` documenting screen conventions,
- or wire a simple Context provider and show how to register it in `App.js`.

Please tell me if any project-specific conventions are missing or if you want a longer (or shorter) set of Copilot instructions.
