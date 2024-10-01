import { Suspense } from 'react';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import BaseLayout from "@/components/BaseLayout";
import UserProfile from "./UserProfile";
import Posts from "./Posts";
import PostSkeleton from "@/components/skeletons/PostSkeleton";
import prisma from "@/db/prisma";
import { notFound } from "next/navigation";
import { User } from "@prisma/client";

async function getCurrentUser(): Promise<User | null> {
  const { getUser } = getKindeServerSession();
  const kindeUser = await getUser();
  if (!kindeUser) return null;
  
  return prisma.user.findUnique({
    where: { id: kindeUser.id }
  });
}

export default async function Home() {
  const currentUser = await getCurrentUser();

  if (!currentUser) return notFound();

  return (
    <BaseLayout>
      <div className="scrollbar-hide h-screen overflow-y-auto"> 
        <UserProfile />
        <Suspense fallback={
          <div className="mt-10 px-3 flex flex-col gap-10">
            {[...Array(3)].map((_, i) => (
              <PostSkeleton key={i} />
            ))}
          </div>
        }>
          <Posts 
            isSubscribed={currentUser.isSubscribed} 
            currentUser={currentUser}
          />
        </Suspense>
      </div>
    </BaseLayout>
  );
}
