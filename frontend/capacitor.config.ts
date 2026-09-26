import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sih.coopgig',
  appName: 'Mistrify',
  webDir: 'out',
  plugins: {
    CapacitorCookies: {
      enabled: true,
    },
    CapacitorHttp: {
      enabled: true,
    },
  },
  server: {
    url: 'http://172.23.217.123:3000',
    cleartext: true,
  },
};

export default config;
