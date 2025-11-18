// Mock Supabase client for local development without backend
// Stores data in localStorage and simulates Supabase API

class MockStorage {
  constructor(bucketName) {
    this.bucketName = bucketName
  }

  async upload(path, file) {
    // Convert file to base64 for localStorage
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64data = reader.result
        localStorage.setItem(`storage:${this.bucketName}:${path}`, base64data)
        resolve({
          data: { path },
          error: null
        })
      }
      reader.readAsDataURL(file)
    })
  }

  getPublicUrl(path) {
    const data = localStorage.getItem(`storage:${this.bucketName}:${path}`)
    return {
      data: { publicUrl: data || '' }
    }
  }
}

class MockSupabaseClient {
  constructor() {
    this.storage = {
      from: (bucketName) => new MockStorage(bucketName)
    }
    this.currentUser = null
    this.authListeners = []

    // Load user from localStorage
    const savedUser = localStorage.getItem('mock:currentUser')
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser)
    }
  }

  from(table) {
    return {
      select: (columns = '*') => this.#createQuery(table, 'select', columns),
      insert: (data) => this.#createQuery(table, 'insert', data),
      update: (data) => this.#createQuery(table, 'update', data),
      delete: () => this.#createQuery(table, 'delete')
    }
  }

  #createQuery(table, operation, data) {
    const query = {
      table,
      operation,
      data,
      filters: [],
      orderBy: null,
      singleResult: false
    }

    const chainable = {
      select: (columns = '*') => {
        query.operation = 'select'
        query.data = columns
        return chainable
      },
      eq: (column, value) => {
        query.filters.push({ column, operator: 'eq', value })
        return chainable
      },
      order: (column, options = {}) => {
        query.orderBy = { column, ascending: options.ascending !== false }
        return chainable
      },
      single: () => {
        query.singleResult = true
        return chainable
      },
      then: (resolve) => {
        return this.#executeQuery(query).then(resolve)
      }
    }

    return chainable
  }

  async #executeQuery(query) {
    const { table, operation, data, filters, orderBy, singleResult } = query

    // Get data from localStorage
    const tableKey = `table:${table}`
    let tableData = JSON.parse(localStorage.getItem(tableKey) || '[]')

    // Apply user filter (RLS simulation)
    if (this.currentUser) {
      tableData = tableData.filter(row => row.user_id === this.currentUser.id)
    }

    // Apply filters
    filters.forEach(filter => {
      tableData = tableData.filter(row => {
        if (filter.operator === 'eq') {
          return row[filter.column] === filter.value
        }
        return true
      })
    })

    switch (operation) {
      case 'select': {
        // Apply ordering
        if (orderBy) {
          tableData.sort((a, b) => {
            const aVal = a[orderBy.column]
            const bVal = b[orderBy.column]
            if (aVal < bVal) return orderBy.ascending ? -1 : 1
            if (aVal > bVal) return orderBy.ascending ? 1 : -1
            return 0
          })
        }

        return {
          data: singleResult ? tableData[0] || null : tableData,
          error: null
        }
      }

      case 'insert': {
        const allData = JSON.parse(localStorage.getItem(tableKey) || '[]')
        const newRecords = Array.isArray(data) ? data : [data]

        newRecords.forEach(record => {
          const newRecord = {
            id: crypto.randomUUID(),
            user_id: this.currentUser?.id,
            created_at: new Date().toISOString(),
            ...record
          }
          allData.push(newRecord)
        })

        localStorage.setItem(tableKey, JSON.stringify(allData))
        return { data: newRecords, error: null }
      }

      case 'update': {
        // Update matching records
        const allRecords = JSON.parse(localStorage.getItem(tableKey) || '[]')
        let updated = false

        allRecords.forEach(record => {
          let matches = record.user_id === this.currentUser?.id
          filters.forEach(filter => {
            if (filter.operator === 'eq') {
              matches = matches && record[filter.column] === filter.value
            }
          })

          if (matches) {
            Object.assign(record, data)
            updated = true
          }
        })

        if (updated) {
          localStorage.setItem(tableKey, JSON.stringify(allRecords))
        }

        return { data: null, error: null }
      }

      case 'delete': {
        const remainingRecords = JSON.parse(localStorage.getItem(tableKey) || '[]')
          .filter(record => {
            let matches = record.user_id === this.currentUser?.id
            filters.forEach(filter => {
              if (filter.operator === 'eq') {
                matches = matches && record[filter.column] === filter.value
              }
            })
            return !matches
          })

        localStorage.setItem(tableKey, JSON.stringify(remainingRecords))
        return { data: null, error: null }
      }

      default:
        return { data: null, error: null }
    }
  }

  get auth() {
    return {
      signUp: async ({ email }) => {
        const user = {
          id: crypto.randomUUID(),
          email,
          created_at: new Date().toISOString()
        }
        this.currentUser = user
        localStorage.setItem('mock:currentUser', JSON.stringify(user))
        this.#notifyAuthListeners('SIGNED_IN', { user })
        return { data: { user }, error: null }
      },

      signInWithPassword: async ({ email }) => {
        // In mock mode, any email/password works
        const user = {
          id: crypto.randomUUID(),
          email,
          created_at: new Date().toISOString()
        }
        this.currentUser = user
        localStorage.setItem('mock:currentUser', JSON.stringify(user))
        this.#notifyAuthListeners('SIGNED_IN', { user })
        return { data: { user }, error: null }
      },

      signOut: async () => {
        this.currentUser = null
        localStorage.removeItem('mock:currentUser')
        this.#notifyAuthListeners('SIGNED_OUT', {})
        return { error: null }
      },

      getSession: async () => {
        return {
          data: {
            session: this.currentUser ? { user: this.currentUser } : null
          },
          error: null
        }
      },

      onAuthStateChange: (callback) => {
        this.authListeners.push(callback)

        // Immediately call with current state
        if (this.currentUser) {
          callback('SIGNED_IN', { user: this.currentUser })
        } else {
          callback('SIGNED_OUT', {})
        }

        // Return unsubscribe function
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                this.authListeners = this.authListeners.filter(l => l !== callback)
              }
            }
          }
        }
      }
    }
  }

  #notifyAuthListeners(event, session) {
    this.authListeners.forEach(listener => {
      listener(event, session)
    })
  }
}

export const mockSupabase = new MockSupabaseClient()
