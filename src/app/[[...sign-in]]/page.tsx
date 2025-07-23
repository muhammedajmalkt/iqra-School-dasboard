// "use client";

// import * as Clerk from "@clerk/elements/common";
// import * as SignIn from "@clerk/elements/sign-in";
// import { useUser } from "@clerk/nextjs";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { useEffect } from "react";

// const LoginPage = () => {
//   const { isLoaded, isSignedIn, user } = useUser();
//   const router = useRouter();

//   useEffect(() => {
//     const role = user?.publicMetadata.role;
//     if (role) {
//       router.push(`/${role}`);
//     }
//   }, [user, router]);

//   if (!isLoaded) {
//     return (
//       <div className="min-h-screen w-full flex items-center justify-center bg-white">
//         <div className="relative z-20 flex items-center justify-center">
//           <div className="w-8 h-8 border-4 border-t-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="relative min-h-screen w-full flex items-center justify-center bg-black">
//       {/* Background Image */}
//       <div className="absolute inset-0">
//         <Image
//           src="/bg.jpg"
//           alt="Background"
//           layout="fill"
//           objectFit="cover"
//           quality={100}
//           className="z-0 opacity-60"
//         />
//         <div className="absolute inset-0 bg-black bg-opacity-50 z-10" />
//       </div>

//       {/* Login Form */}
//       <div className="relative z-20 w-full max-w-md p-8 md:p-10 bg-white bg-opacity-90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200">
//         <SignIn.Root>
//           <SignIn.Step name="start" className="space-y-6">
//             <div className="flex items-center gap-3 mb-2">
//               <Image src="/yeslogo.png" alt="YES Logo" width={32} height={32} />
//               <h1 className="text-lg md:text-xl font-semibold text-gray-800">
//                 YES PA Inamdar School Dashboard
//               </h1>
//             </div>

//             <h2 className="text-sm text-gray-500">Sign in to your account</h2>
//             <Clerk.GlobalError className="text-sm text-red-500" />

//             <Clerk.Field name="identifier" className="space-y-1">
//               <Clerk.Label className="text-sm font-medium text-gray-600">
//                 Username
//               </Clerk.Label>
//               <Clerk.Input
//                 type="text"
//                 required
//                 className="w-full p-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
//               />
//               <Clerk.FieldError className="text-xs text-red-500" />
//             </Clerk.Field>

//             <Clerk.Field name="password" className="space-y-1">
//               <Clerk.Label className="text-sm font-medium text-gray-600">
//                 Password
//               </Clerk.Label>
//               <Clerk.Input
//                 type="password"
//                 required
//                 className="w-full p-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
//               />
//               <Clerk.FieldError className="text-xs text-red-500" />
//             </Clerk.Field>

//             <SignIn.Action
//               submit
//               className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded-md transition"
//             >
//               Sign In
//             </SignIn.Action>
//           </SignIn.Step>
//         </SignIn.Root>
//       </div>
//       {/* Footer Credit */}
//       <div className="absolute bottom-4 w-full flex justify-center z-20">
//         <div className="flex items-center gap-2 text-white text-sm font-medium">
//           <span>Powered by</span>
//           <Image src="/svg.png" alt="Cyberduce Logo" width={16} height={16} />
//           <span>Cyberduce Technologies</span>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;
"use client"

import * as Clerk from "@clerk/elements/common"
import * as SignIn from "@clerk/elements/sign-in"
import { useUser } from "@clerk/nextjs"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

const LoginPage = () => {
  const { isLoaded, isSignedIn, user } = useUser()
  const router = useRouter()

  useEffect(() => {
    const role = user?.publicMetadata.role
    if (role) {
      router.push(`/${role}`)
    }
  }, [user, router])

  if (!isLoaded) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white">
        <div className="relative z-20 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-t-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Side - Background Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <Image src="/bg.jpg" alt="School Background" fill className="object-cover" quality={100} />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-slate-900/80" />

        {/* Overlay Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 text-white ">
          <div className="max-w-xl">
            <h1 className="text-3xl font-bold mb-6">Welcome to YES PA Inamdar School</h1>
            <p className="text-lg text-blue-100 leading-relaxed">
              Access your personalized dashboard to manage your academic journey and stay connected with your school
              community.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12  rounded-xl flex items-center justify-center">
                <Image src="/yeslogo.png" alt="YES Logo" width={32} height={32} className="" />
              </div>
              <div className="text-left ">
                <h1 className="text-xl font-bold text-slate-900">YES PA Inamdar</h1>
                <p className="text-sm text-slate-500">School Dashboard</p>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Sign in to your account</h2>
            <p className="text-slate-600">Enter your credentials to access your dashboard</p>
          </div>

          {/* Login Form */}
          <SignIn.Root>
            <SignIn.Step name="start" className="space-y-6">
              <Clerk.GlobalError className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3" />

              <div className="space-y-4">
                <Clerk.Field name="identifier" className="space-y-2">
                  <Clerk.Label className="block text-sm font-semibold text-slate-700">Username</Clerk.Label>
                  <Clerk.Input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white text-slate-900 placeholder-slate-400"
                    placeholder="Enter your username"
                  />
                  <Clerk.FieldError className="text-sm text-red-600" />
                </Clerk.Field>

                <Clerk.Field name="password" className="space-y-2">
                  <Clerk.Label className="block text-sm font-semibold text-slate-700">Password</Clerk.Label>
                  <Clerk.Input
                    type="password"
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white text-slate-900 placeholder-slate-400"
                    placeholder="Enter your password"
                  />
                  <Clerk.FieldError className="text-sm text-red-600" />
                </Clerk.Field>
              </div>

              <SignIn.Action
                submit
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 outline-none"
              >
                Sign In
              </SignIn.Action>

            </SignIn.Step>
          </SignIn.Root>

          {/* Footer */}
          <div className="pt-8 border-t border-slate-200">
            <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
              <span>Powered by</span>
              <div className="flex items-center gap-1">
                <Image src="/svg.png" alt="Cyberduce Logo" width={16} height={16} />
                <span className="font-medium text-slate-700">Cyberduce Technologies</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Background Overlay */}
      <div className="lg:hidden absolute inset-0 z-0">
        <Image src="/bg.jpg" alt="School Background" fill className="object-cover opacity-10" quality={100} />
      </div>
    </div>
  )
}

export default LoginPage
