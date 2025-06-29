"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { ArrowLeftSquareIcon, Settings, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { CustomDeployment } from "./custom-deployment";
import { EasyDeployment } from "./easy-deployment";

export default function DeployPage() {
  const router = useRouter();

  return (

    <div className="h-full ">
      <div className="container max-w-5xl pt-8">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-4 flex items-center"
        >
          <ArrowLeftSquareIcon
            onClick={() => router.back()}
            className="h-8 w-8 mr-3 cursor-pointer"
          />
          <h1 className="text-3xl font-bold bg-slate-900 bg-clip-text text-transparent  ">
            Deploy Idle Funds
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-yellow-500/5 rounded-xl blur-xl -z-10" />

          <Tabs defaultValue="easy" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 p-1 bg-slate-100 h-full rounded-lg">
              <TabsTrigger
                value="easy"
                className="flex items-center gap-2 py-3 data-[state=active]:bg-white =active]:bg-slate-700 data-[state=active]:shadow-sm rounded-md transition-all duration-200"
              >
                <Zap className="h-4 w-4 text-yellow-500" />
                <span>Easy Mode</span>
              </TabsTrigger>
              <TabsTrigger
                disabled={true}
                value="custom"
                className="flex items-center gap-2 py-3 data-[state=active]:bg-white =active]:bg-slate-700 data-[state=active]:shadow-sm rounded-md transition-all duration-200 relative"
              >
                <Settings className="h-4 w-4 text-cyan-500" />
                <span>Custom Mode</span>
                <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
                  Coming Soon
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="easy">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-none shadow-lg bg-white/80 /80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
    
                  </CardHeader>
                  <CardContent className="pt-2">
                    <EasyDeployment />
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="custom">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-none shadow-lg bg-white/80 /80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Settings className="h-5 w-5 text-cyan-500" />
                      Custom Deployment
                    </CardTitle>
                    <CardDescription className="text-slate-600  text-base">
                      Browse all available protocols and choose which assets to
                      deploy.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <CustomDeployment />
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
        </div>
      </div>
  );
}
