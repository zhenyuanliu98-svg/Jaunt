import { getSupabaseClient } from './supabase'
import { BookingType, PendingBookingStatus } from '@/types/enums'

type Where<T> = Partial<T>

async function single<T>(table: string, where: Where<T>) {
  const supabase = getSupabaseClient()
  const query = Object.entries(where).reduce((q, [key, value]) => q.eq(key, value as never), supabase.from(table).select('*'))
  const { data, error } = await query.single()
  if (error) return null
  return data as T
}

async function many<T>(table: string, where?: Where<T>, orderBy?: { column: string; ascending: boolean }) {
  const supabase = getSupabaseClient()
  let query = supabase.from(table).select('*')
  if (where) {
    Object.entries(where).forEach(([key, value]) => {
      query = query.eq(key, value as never)
    })
  }
  if (orderBy) {
    query = query.order(orderBy.column, { ascending: orderBy.ascending })
  }
  const { data } = await query
  return (data as T[]) || []
}

async function insert<T>(table: string, values: Partial<T>) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from(table).insert(values).select().single()
  if (error) throw error
  return data as T
}

async function updateWhere<T>(table: string, where: Where<T>, values: Partial<T>) {
  const supabase = getSupabaseClient()
  let query = supabase.from(table).update(values)
  Object.entries(where).forEach(([key, value]) => {
    query = query.eq(key, value as never)
  })
  const { data, error, count } = await query.select('*', { count: 'exact' })
  if (error) throw error
  return { data: (data as T[]) || [], count: count ?? data?.length ?? 0 }
}

async function deleteWhere<T>(table: string, where: Where<T>) {
  const supabase = getSupabaseClient()
  let query = supabase.from(table).delete()
  Object.entries(where).forEach(([key, value]) => {
    query = query.eq(key, value as never)
  })
  const { data, error, count } = await query.select('*', { count: 'exact' })
  if (error) throw error
  return { data: (data as T[]) || [], count: count ?? data?.length ?? 0 }
}

export const prisma = {
  user: {
    findUnique: async ({ where }: { where: any }) => single<any>('users', where),
    create: async ({ data }: { data: any }) => insert<any>('users', data),
    update: async ({ where, data }: { where: any; data: any }) => {
      const updated = await updateWhere<any>('users', where, data)
      return updated.data[0] ?? null
    }
  },
  trip: {
    findFirst: async ({ where }: { where: any }) => {
      const records = await many<any>('trips', where, { column: 'startDate', ascending: false })
      return records[0] ?? null
    },
    findMany: async ({ where, orderBy }: { where: any; orderBy?: any }) => {
      const order = orderBy ? { column: Object.keys(orderBy)[0], ascending: orderBy.startDate !== 'desc' } : undefined
      return many<any>('trips', where, order)
    },
    create: async ({ data }: { data: any }) => insert<any>('trips', data),
    updateMany: async ({ where, data }: { where: any; data: any }) => updateWhere<any>('trips', where, data),
    deleteMany: async ({ where }: { where: any }) => deleteWhere<any>('trips', where),
    update: async ({ where, data }: { where: any; data: any }) => {
      const updated = await updateWhere<any>('trips', where, data)
      return updated.data[0] ?? null
    }
  },
  booking: {
    create: async ({ data }: { data: any }) => insert<any>('bookings', data),
    deleteMany: async ({ where }: { where: any }) => deleteWhere<any>('bookings', where)
  },
  pendingBooking: {
    findMany: async ({ where, orderBy }: { where: any; orderBy?: any }) => {
      const order = orderBy
        ? { column: Object.keys(orderBy)[0], ascending: orderBy.createdAt !== 'desc' }
        : { column: 'createdAt', ascending: false }
      return many<any>('pending_bookings', where, order)
    },
    create: async ({ data }: { data: any }) => insert<any>('pending_bookings', data),
    updateMany: async ({ where, data }: { where: any; data: any }) => updateWhere<any>('pending_bookings', where, data),
    deleteMany: async ({ where }: { where: any }) => deleteWhere<any>('pending_bookings', where)
  },
  attachment: {
    create: async ({ data }: { data: any }) => insert<any>('attachments', data)
  }
}

export { BookingType, PendingBookingStatus }
