import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { RecoilRoot } from "recoil";
import { QueryClient } from "@tanstack/query-core";
import { QueryClientProvider } from "@tanstack/react-query";
import { Amplify } from "aws-amplify";
import "./index.css";
import { AnimatePresence } from "framer-motion";

const queryClient = new QueryClient();

Amplify.configure({
  Auth: {
    region: import.meta.env.VITE_APP_REGION,
    userPoolId: import.meta.env.VITE_APP_USER_POOL_ID,
    userPoolWebClientId: import.meta.env.VITE_APP_USER_POOL_CLIENT_ID,
    mandatorySignIn: false,
    oauth: {
      domain: `${
        import.meta.env.VITE_APP_COGNITO_DOMAIN +
        ".auth." +
        import.meta.env.VITE_APP_REGION +
        ".amazoncognito.com"
      }`,
      scope: ["email", "profile", "openid", "aws.cognito.signin.user.admin"],
      redirectSignIn: import.meta.env.PROD
        ? import.meta.env.VITE_APP_BASE_URL
        : "http://localhost:5173/", // Make sure to use the exact URL
      redirectSignOut: import.meta.env.PROD
        ? import.meta.env.VITE_APP_BASE_URL
        : "http://localhost:5173/", // Make sure to use the exact URL
      responseType: "token", // or 'token', note that REFRESH token will only be generated when the responseType is code
    },
  },
  API: {
    endpoints: [
      {
        name: "api",
        endpoint: import.meta.env.VITE_APP_API_URL,
        region: import.meta.env.VITE_APP_REGION,
      },
    ],
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="mobile-web-app-capable" content="yes" />

    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <AnimatePresence mode="wait" initial={true}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AnimatePresence>
      </QueryClientProvider>
    </RecoilRoot>
  </React.StrictMode>
);
