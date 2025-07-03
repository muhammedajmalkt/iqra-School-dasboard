"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const LoginPage = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    const role = user?.publicMetadata.role;
    if (role) {
      router.push(`/${role}`);
    }
  }, [user, router]);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-black">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/bg.jpg"
          alt="Background"
          layout="fill"
          objectFit="cover"
          quality={100}
          className="z-0 opacity-60" 
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 z-10" />
      </div>

      {/* Login Form */}
      <div className="relative z-20 w-full max-w-md p-8 md:p-10 bg-white bg-opacity-90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200">
        <SignIn.Root>
          <SignIn.Step name="start" className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Image src="/yeslogo.png" alt="YES Logo" width={32} height={32} />
              <h1 className="text-lg md:text-xl font-semibold text-gray-800">
                YES PA Inamdar School Dashboard
              </h1>
            </div>

            <h2 className="text-sm text-gray-500">Sign in to your account</h2>
            <Clerk.GlobalError className="text-sm text-red-500" />

            <Clerk.Field name="identifier" className="space-y-1">
              <Clerk.Label className="text-sm font-medium text-gray-600">
                Username
              </Clerk.Label>
              <Clerk.Input
                type="text"
                required
                className="w-full p-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
              />
              <Clerk.FieldError className="text-xs text-red-500" />
            </Clerk.Field>

            <Clerk.Field name="password" className="space-y-1">
              <Clerk.Label className="text-sm font-medium text-gray-600">
                Password
              </Clerk.Label>
              <Clerk.Input
                type="password"
                required
                className="w-full p-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
              />
              <Clerk.FieldError className="text-xs text-red-500" />
            </Clerk.Field>

            <SignIn.Action
              submit
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded-md transition"
            >
              Sign In
            </SignIn.Action>
          </SignIn.Step>
        </SignIn.Root>
      </div>
      {/* Footer Credit */}
<div className="absolute bottom-4 w-full flex justify-center z-20">
  <div className="flex items-center gap-2 text-white text-sm font-medium">
    <span>Powered by</span>
    <Image src="/svg.png" alt="Cyberduce Logo" width={16} height={16} />
    <span>Cyberduce Technologies</span>
  </div>
</div>
    </div>
  );
};

export default LoginPage;
