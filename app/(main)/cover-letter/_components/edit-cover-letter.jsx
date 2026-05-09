"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function EditCoverLetterClient({ coverLetter }) {
  const [activeTab, setActiveTab] = useState("edit");
  

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
        make dit page
        </TabsContent>
        <TabsContent value="password">
          Change your password here.
        </TabsContent>
      </Tabs>
    </div>
  );
}
