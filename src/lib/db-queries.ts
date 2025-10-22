import 'server-only'
import prisma from './prisma'
import { withTryCatch } from './utils'
import { Prisma } from '@prisma/client'

type CreateUser = {
  businessName: string
  email: string
}

export function createUser({ businessName, email }: CreateUser) {
  return withTryCatch(() => {
    return prisma.user.create({
      data: {
        email,
        businessName,
      },
    })
  })
}

export function getUser(email: string) {
  return withTryCatch(() => {
    return prisma.user.findUnique({
      where: { email },
    })
  })
}

type CreateBusinessDataset = Prisma.BusinessDatasetUncheckedCreateInput

export function createBusinessDataset(_data: CreateBusinessDataset) {
  const { name, userId, data, sliceTypes } = _data
  return withTryCatch(async () => {
    return await prisma.businessDataset.create({
      data: { name, userId, data, sliceTypes },
    })
  })
}

export function getLatestDataset(userId: string) {
  return withTryCatch(() => {
    return prisma.businessDataset.findFirst({
      where: { userId },
      orderBy: { uploadedAt: 'desc' },
    })
  })
}
