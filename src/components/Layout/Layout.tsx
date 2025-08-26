import React from "react";
import Sidebar from "./Sidebar"; // ahora sí Sidebar es un módulo válido

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "1rem" }}>{children}</main>
    </div>
  );
}

export default Layout;
