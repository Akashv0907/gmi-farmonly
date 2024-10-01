import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CoverImage from "./CoverImage";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import prisma from "@/db/prisma";
import { getUserProfileAction } from "@/app/update-profile/actions";

const UserProfile = async () => {
  const admin = await prisma.user.findUnique({
    where: {
      email: process.env.ADMIN_EMAIL!,
    },
  });

  const currentUser = await getUserProfileAction();

  const isAdmin = currentUser?.email === admin?.email;

  return (
    <div className='flex flex-col'>
      <CoverImage adminName={admin?.name!} />

      {isAdmin ? (
        // Render Admin Profile
        <div className='flex flex-col p-4'>
          <div className='flex flex-col md:flex-row gap-4 justify-between'>
            <Avatar className='w-20 h-20 border-2 -mt-10'>
              <AvatarImage src={admin?.image || "/user-placeholder.png"} className='object-cover' />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className='flex'>
              {currentUser?.isSubscribed ? (
                <Button className='rounded-full flex gap-10'>
                  <span className='uppercase font-semibold tracking-wide'>Subscribed</span>
                </Button>
              ) : (
                <Button asChild className='rounded-full flex gap-10 bg-red-500 hover:bg-red-600 text-white'>
                  <Link href={"/pricing"}>
                    <span className='uppercase font-semibold tracking-wide'>subscribe</span>
                  </Link>
                </Button>
              )}
            </div>
          </div>

          <div className='flex flex-col mt-4'>
            <p className='text-lg font-semibold'>{admin?.name}</p>
            <p className='text-sm mt-2 md:text-md'>
              {admin?.bio ||
                "Discover daily tips and tricks for horse health and care, along with insights into my personal routine with my horses. Subscribe now to gain access to exclusive content and become part of the community."}
            </p>
          </div>
        </div>
      ) : (
        // Render User Profile
        <div className='flex flex-col p-4'>
          <div className='flex flex-col md:flex-row gap-4 justify-between'>
            <Avatar className='w-20 h-20 border-2 -mt-10'>
              <AvatarImage src={currentUser?.image || "/user-placeholder.png"} className='object-cover' />
              <AvatarFallback>UC</AvatarFallback>
            </Avatar>
            <div className='flex'>
              {currentUser?.isSubscribed ? (
                <Button className='rounded-full flex gap-10'>
                  <span className='uppercase font-semibold tracking-wide'>Subscribed</span>
                </Button>
              ) : (
                <Button asChild className='rounded-full flex gap-10 bg-red-500 hover:bg-red-600 text-white'>
                  <Link href={"/pricing"}>
                    <span className='uppercase font-semibold tracking-wide'>Subscribe</span>
                  </Link>
                </Button>
              )}
            </div>
          </div>

          <div className='flex flex-col mt-4'>
            <p className='text-lg font-semibold'>{currentUser?.name}</p>
            <p className='text-sm mt-2 md:text-md'>
              {currentUser?.bio ||
                "Welcome to your profile! Here, you can find personalized tips and insights related to your interests."}
            </p>
          </div>
        </div>
      )}

      <div aria-hidden='true' className='h-2 w-full bg-muted' />
    </div>
  );
};

export default UserProfile;
