"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

import { DataTable } from "@/modules/customers/components/data-table"
import { CustomerStatCards } from "@/modules/customers/components/customer-stat-cards"
import {
  addCustomer,
  deleteCustomer,
  getCustomers,
  getCustomerStats,
  updateCustomer,
} from "@/modules/customers/services/customer-services"
import type { Customer } from "@/modules/customers/services/types/customer-types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const customerList = await getCustomers()
        setCustomers(customerList)
      } catch (error) {
        console.error("Failed to load customers:", error)
      } finally {
        setLoading(false)
      }
    }

    loadCustomers()
  }, [])

  const handleAddCustomer = async (newCustomer: Customer) => {
    try {
      const docId = await addCustomer(newCustomer)
      setCustomers(prev => [{ ...newCustomer, id: docId }, ...prev])
      toast.success("Customer created successfully")
    } catch (error) {
      console.error("Failed to add customer:", error)
      toast.error("Failed to create customer")
    }
  }

  const handleDeleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id))
  }

  const handleEditCustomer = async (updatedCustomer: Customer) => {
    if (!updatedCustomer.id) return
    try {
      await updateCustomer(updatedCustomer.id, updatedCustomer)
      setCustomers(prev =>
        prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c)
      )
      toast.success("Customer updated successfully")
    } catch (error) {
      console.error("Failed to update customer:", error)
      toast.error("Failed to update customer")
    }
  }

  const stats = getCustomerStats(customers)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading customers...</div>
      </div>
    )
  }

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col gap-2 px-4 md:px-6">
        <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground">
          Manage and nurture your customer relationships in one place.
        </p>
      </div>

      {/* Mobile view placeholder */}
      <div className="md:hidden px-4 md:px-6">
        <div className="flex items-center justify-center h-96 border rounded-lg bg-muted/20">
          <div className="text-center p-8">
            <h3 className="text-lg font-semibold mb-2">Customers Dashboard</h3>
            <p className="text-muted-foreground">
              Please use a larger screen to view the full customers interface.
            </p>
          </div>
        </div>
      </div>

      {/* Desktop view */}
      <div className="hidden h-full flex-1 flex-col space-y-6 px-4 md:px-6 md:flex">
        {/* Stats Cards */}
        <CustomerStatCards stats={stats} />

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Management</CardTitle>
            <CardDescription>
              View, filter, and manage all your customers and leads in one place.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={customers}
              onAddCustomer={handleAddCustomer}
              onDeleteCustomer={handleDeleteCustomer}
              onEditCustomer={handleEditCustomer}
            />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
