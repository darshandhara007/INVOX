// import { ReactNode } from 'react'
// import {isAuthenticated} from "@/lib/actions/auth.action";
// import {redirect} from "next/navigation";

// const AuthLayout = async ({ children }: { children: ReactNode  }) => {
//     const isUserAuthenticated = await isAuthenticated();

//     if(isUserAuthenticated) redirect('/');

//     return (
//         <div className="auth-layout">{children}</div>
//     )
// }

// export default AuthLayout


import { ReactNode } from "react";
import { isAuthenticated } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation";
import AuthAnimationWrapper from "@/components/AuthAnimationWrapper";

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const isUserAuthenticated = await isAuthenticated();

  if (isUserAuthenticated) redirect("/");

  return <AuthAnimationWrapper>{children}</AuthAnimationWrapper>;
}