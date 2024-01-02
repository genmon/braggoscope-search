import type { LinksFunction } from "partymix";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import stylesheet from "~/tailwind.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          lineHeight: "1.8",
          minHeight: "100dvh",
        }}
        className="relative bg-white flex flex-col min-h-screen justify-between items-between w-full"
      >
        <main className="isolate mx-auto grow flex flex-col max-w-7xl p-6 justify-start items-start h-full w-full">
          <Outlet />
          <ScrollRestoration />
          <Scripts />
          {process.env.NODE_ENV === "development" && <LiveReload />}
        </main>
      </body>
    </html>
  );
}
