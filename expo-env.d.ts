declare module 'expo/tsconfig.base' {
  const config: any;
  export default config;
}

declare module 'react/jsx-runtime' {
  const content: any;
  export default content;
}

declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.svg';
declare module '*.webp';
declare module '*.ttf';
declare module '*.otf';
declare module '*.woff';
declare module '*.woff2';

declare module '@babel/core';
declare module '@babel/generator';
declare module '@babel/template';
declare module '@babel/traverse';
declare module '@babel/parser';

declare module 'istanbul-lib-report';
declare module 'istanbul-reports';

declare module 'expo-asset';
declare module 'expo-font';
declare module 'expo-splash-screen';
declare module 'expo-status-bar';

declare module '*.json';

declare module 'react-native/Libraries/NewAppScreen';