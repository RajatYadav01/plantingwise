import AsyncStorage from "@react-native-async-storage/async-storage";

/** The platform adapter is isolated so storage behavior can be unit-tested without native modules. */
export const nativeStorage = AsyncStorage;
