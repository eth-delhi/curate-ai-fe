import React from "react";

export default function PostRevampLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="post-revamp-layout">{children}</div>;
}
