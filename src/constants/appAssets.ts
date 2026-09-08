import { Asset } from "expo-asset";

export const APP_LOGO = require("../../assets/DMB_APP.png");

let logoLoaded = false;

export async function preloadAppAssets() {
  if (logoLoaded) return;

  await Asset.loadAsync(APP_LOGO);

  logoLoaded = true;
}