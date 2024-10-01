"use server";

import prisma from "@/db/prisma";
import { centsToDollars } from "@/lib/utils";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

type PostArgs = {
  text: string;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  isPublic: boolean;
};

// Allow both authenticated users and admins to create a post
export async function createPostAction({ isPublic, mediaUrl, mediaType, text }: PostArgs) {
  const user = await checkIfAuthenticatedUser();  // Allow any authenticated user

  if (!user) {
    throw new Error("Unauthorized");
  }

  const newPost = await prisma.post.create({
    data: {
      text,
      mediaUrl,
      mediaType,
      isPublic,
      userId: user.id, 
    },
  });

  return { success: true, post: newPost };
}

// Admin-specific action to get all products
export async function getAllProductsAction() {
  const products = await prisma.product.findMany();
  return products;
}

type ProductArgs = {
  name: string;
  image: string;
  price: string;
};

// Allow both authenticated users and admins to add products
export async function addNewProductToStoreAction({ name, image, price }: ProductArgs) {
  const user = await checkIfAuthenticatedUser();  

  if (!user) {
    throw new Error("Unauthorized");
  }

  if (!name || !image || !price) {
    throw new Error("Please provide all the required fields");
  }

  const priceInCents = Math.round(parseFloat(price) * 100);

  if (isNaN(priceInCents)) {
    throw new Error("Price must be a number");
  }

  const newProduct = await prisma.product.create({
    data: {
      image,
      price: priceInCents,
      name,  
    },
  });

  return { success: true, product: newProduct };
}

// Admin-specific action to toggle product archive status
export async function toggleProductArchiveAction(productId: string) {
  const isAdmin = await checkIfAdmin();
  if (!isAdmin) {
    throw new Error("Unauthorized");
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });

  if (!product) {
    throw new Error("Product not found");
  }

  const updatedProduct = await prisma.product.update({
    where: { id: productId },
    data: {
      isArchived: !product.isArchived,
    },
  });

  return { success: true, product: updatedProduct };
}

// Dashboard data for admins
export async function getDashboardData() {
  const totalRevenuePromise = Promise.all([
    prisma.order.aggregate({
      _sum: {
        price: true,
      },
    }),
    prisma.subscription.aggregate({
      _sum: {
        price: true,
      },
    }),
  ]);

  const totalSalesPromise = prisma.order.count();
  const totalSubscriptionsPromise = prisma.subscription.count();

  const recentSalesPromise = prisma.order.findMany({
    take: 4,
    orderBy: {
      orderDate: "desc",
    },
    select: {
      user: {
        select: {
          name: true,
          email: true,
          image: true,
        },
      },
      price: true,
      orderDate: true,
    },
  });

  const recentSubscriptionsPromise = prisma.subscription.findMany({
    take: 4,
    orderBy: {
      startDate: "desc",
    },
    select: {
      user: {
        select: {
          name: true,
          email: true,
          image: true,
        },
      },
      price: true,
      startDate: true,
    },
  });

  const [totalRevenueResult, totalSales, totalSubscriptions, recentSales, recentSubscriptions] = await Promise.all([
    totalRevenuePromise,
    totalSalesPromise,
    totalSubscriptionsPromise,
    recentSalesPromise,
    recentSubscriptionsPromise,
  ]);

  const totalRevenue = (totalRevenueResult[0]._sum.price || 0) + (totalRevenueResult[1]._sum.price || 0);

  return {
    totalRevenue: centsToDollars(totalRevenue),
    totalSales,
    totalSubscriptions,
    recentSales,
    recentSubscriptions,
  };
}

// Helper function to check if a user is authenticated
async function checkIfAuthenticatedUser() {
  const { getUser } = getKindeServerSession();

  try {
    const user = await getUser();
    
    if (!user) {
      console.error("User session could not be retrieved.");
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error fetching user session:", error);
    return null;
  }
}

async function checkIfAdmin() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  const isAdmin = user?.email === process.env.ADMIN_EMAIL;

  if (!user || !isAdmin) return null;

  return user;
}
