import {index, layout, prefix, route, type RouteConfig } from "@react-router/dev/routes";
import {APP_NAME, BASE } from "./config";

export default [
  layout("routes/base-layout.tsx", [
    ...prefix(BASE, [
      layout("routes/home-layout.tsx",[
        index("routes/home.tsx"),
        ...prefix(APP_NAME, [
          layout('routes/dialog.tsx', [
            index('routes/storageBundles.tsx'),
            route(":storageBundleName/:sourceHostName/:countryAdminMatrix/download",'routes/download.tsx'),
            route(":storageBundleName/:sourceHostName/:countryAdminMatrix?", 'routes/countryAdmins.tsx'),
            route(":storageBundleName", './routes/sourceHosts.tsx'),
          ])
        ])
      ])
    ])
  ])
] satisfies RouteConfig;
