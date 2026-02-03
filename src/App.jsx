import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, TrendingUp, TrendingDown, Edit, Trash2, Filter, Calendar } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE_URL;
console.log("API BASE =", API_BASE)


function App() {
  const [stats, setStats] = useState({ income: 0, expense: 0, net: 0 })
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({ division: 'All', category: 'All', startDate: '', endDate: '' })
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [formData, setFormData] = useState({
    type: 'income',
    division: 'Office',
    category: 'Salary',
    amount: '',
    description: '',
    date: new Date().toISOString().slice(0, 16)
  })

  // All existing functions unchanged
  useEffect(() => { fetchData() }, [])
  
  const fetchData = async () => {
    try {
      setLoading(true)
      const [statsRes, transRes] = await Promise.all([
        axios.get(`${API_BASE}/stats`),
        axios.get(`${API_BASE}/transactions`)
      ])
      setStats(statsRes.data)
      setTransactions(transRes.data)
    } catch (error) {
      console.error('API Error:', error)
      setStats({ income: 0, expense: 0, net: 0 })
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction)
    setFormData({
      type: transaction.type,
      division: transaction.division,
      category: transaction.category,
      amount: transaction.amount,
      description: transaction.description,
      date: transaction.date
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingTransaction) {
        await axios.put(`${API_BASE}/transactions/${editingTransaction._id}`, formData)
      } else {
        await axios.post(`${API_BASE}/transactions`, formData)
      }
      setShowModal(false)
      setEditingTransaction(null)
      setFormData({
        type: 'income', division: 'Office', category: 'Salary', amount: '', description: '', 
        date: new Date().toISOString().slice(0, 16)
      })
      fetchData()
    } catch (error) {
      alert(error.response?.data?.error || 'Error saving transaction')
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Delete this transaction?')) {
      try {
        await axios.delete(`${API_BASE}/transactions/${id}`)
        fetchData()
      } catch (error) {
        alert('Delete failed')
      }
    }
  }

  const filteredTransactions = transactions.filter(t => {
    const matchesDivision = filters.division === 'All' || t.division === filters.division
    const matchesCategory = filters.category === 'All' || t.category === filters.category
    const matchesDateRange = !filters.startDate || !filters.endDate || 
      (new Date(t.date) >= new Date(filters.startDate) && new Date(t.date) <= new Date(filters.endDate))
    return matchesDivision && matchesCategory && matchesDateRange
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="max-w-sm w-full bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
          <div className="w-12 h-12 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-1">Loading</h2>
          <p className="text-sm text-gray-500">Connecting to database</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold text-gray-900">Financial Dashboard</h1>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">
                ₹{Math.abs(stats.net).toLocaleString()}
              </div>
              <div className="text-sm font-medium text-gray-600">
                {stats.net >= 0 ? 'Available Balance' : 'Overdrawn'}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Income</div>
                <div className="text-3xl font-bold text-emerald-600 mt-1">₹{stats.income.toLocaleString()}</div>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Expenses</div>
                <div className="text-3xl font-bold text-red-600 mt-1">₹{stats.expense.toLocaleString()}</div>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Transaction Count</div>
                <div className="text-3xl font-bold text-gray-900 mt-1">{transactions.length}</div>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Division</label>
                  <select 
                    value={filters.division} 
                    onChange={(e) => setFilters({...filters, division: e.target.value})}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option>All Divisions</option>
                    <option>Office</option>
                    <option>Personal</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
                  <select 
                    value={filters.category} 
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option>All Categories</option>
                    <option>Salary</option>
                    <option>Fuel</option>
                    <option>Food</option>
                    <option>Movie</option>
                    <option>Medical</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Date Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="date" 
                      value={filters.startDate} 
                      onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                      className="p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input 
                      type="date" 
                      value={filters.endDate} 
                      onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                      className="p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-gray-900">Transaction History</h2>
                  <div className="text-sm text-gray-600">
                    {filteredTransactions.length} of {transactions.length} transactions
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Division</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTransactions.map((t) => (
                      <tr key={t._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {t.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                            t.division === 'Office' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {t.division}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {t.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(t.date).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold">
                          <span className={`${
                            t.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                          }`}>
                            {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <button 
                            onClick={() => handleEdit(t)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded-lg hover:bg-blue-50"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(t._id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded-lg hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredTransactions.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          <div className="text-lg font-medium mb-2">No transactions found</div>
                          <div className="text-sm">Add a transaction to get started</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Transaction Button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg border border-blue-600 flex items-center justify-center z-40 transition-colors duration-200"
      >
        <Plus size={20} />
      </button>

      {/* Modal - Professional Form */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4" 
             onClick={() => {setShowModal(false); setEditingTransaction(null)}}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200" 
               onClick={(e) => e.stopPropagation()}>
            <div className="p-8 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                {editingTransaction ? 'Edit Transaction' : 'New Transaction'}
              </h3>
              <p className="text-gray-600">
                {editingTransaction ? 'Update transaction details' : 'Add a new financial transaction'}
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <fieldset className="grid md:grid-cols-2 gap-6">
                <legend className="text-sm font-medium text-gray-700 mb-4 sr-only">Transaction Type</legend>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, type: 'income'})}
                  className={`p-4 rounded-xl font-medium border-2 transition-all ${
                    formData.type === 'income'
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-md'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Income
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, type: 'expense'})}
                  className={`p-4 rounded-xl font-medium border-2 transition-all ${
                    formData.type === 'expense'
                      ? 'bg-red-500 border-red-500 text-white shadow-md'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Expense
                </button>
              </fieldset>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="0.00"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Division</label>
                  <select
                    value={formData.division}
                    onChange={(e) => setFormData({...formData, division: e.target.value})}
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  >
                    <option>Office</option>
                    <option>Personal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  >
                    <option>Salary</option>
                    <option>Fuel</option>
                    <option>Food</option>
                    <option>Movie</option>
                    <option>Medical</option>
                    <option>Loan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Enter transaction description"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-200"
                >
                  {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
                </button>
                <button 
                  type="button"
                  onClick={() => {setShowModal(false); setEditingTransaction(null)}}
                  className="px-8 py-3 border border-gray-300 bg-white hover:bg-gray-50 text-gray-900 rounded-xl font-medium transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default App
