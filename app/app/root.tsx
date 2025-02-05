import React, { type ReactNode } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import "./global-styles.css";

import {APP_DESCRIPTION, APP_TITLE, GITHUB_PAGES_URL } from "./config";

export function HydrateFallback() {
  return (
    <div id="loading-splash">
      <div id="loading-splash-spinner" />
      <p>読み込み中、しばらくお待ちください...</p>
    </div>
  );
}

// アプリケーションの最上位のエラー境界。アプリがエラーをスローしたときにレンダリングされます。
// 詳細については、https://reactrouter.com/start/framework/route-module#errorboundaryを参照してください。
export type ErrorBoundaryProps = {
  error: unknown;
}

export function ErrorBoundary({
                                error,
                              }: ErrorBoundaryProps) {
  let message = "おっと！";
  let details = "予期しないエラーが発生しました。";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "エラー";
    details =
      error.status === 404
        ? "リクエストされたページが見つかりませんでした。"
        : error.statusText || details;
  } else if (
    import.meta.env.DEV &&
    error &&
    error instanceof Error
  ) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main id="error-page">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre>
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}

export function meta() {
  return [
    { title: APP_TITLE },
    {
      property: "og:title",
      content: APP_TITLE,
    },
    {
      name: "description",
      content: APP_DESCRIPTION,
    },
  ];
}

export function Layout({
                            }: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
    <head>
      <meta charSet="UTF-8" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
      />
      <Meta />
      <Links />
    </head>
    <body>
    <Outlet/>
    <ScrollRestoration />
    <Scripts />
    </body>
    </html>
  );
}

export default function App(){
  return <Outlet />
}