import { NextResponse } from 'next/server'

// export async function GET(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url)
//     const period = parseInt(searchParams.get('period') || '30')
//     const type = searchParams.get('type') || 'full' // full, revenue, clients, services

//     // TODO: Replace with actual database queries based on the period
//     // Example:
//     /*
//     const data = await db.appointments.findMany({
//       where: {
//         createdAt: {
//           gte: new Date(Date.now() - period * 24 * 60 * 60 * 1000)
//         }
//       },
//       include: {
//         client: true,
//         service: true
//       }
//     })
//     */

//     // Mock data for export (replace with real data)
//     const exportData = {
//       full: [
//         ['Date', 'Revenue', 'Appointments', 'New Clients', 'Service', 'Client Type'],
//         ['2024-06-01', '$2,100', '12', '3', 'Hair Cut & Style', 'New'],
//         ['2024-06-02', '$1,850', '8', '2', 'Color Treatment', 'Returning'],
//         ['2024-06-03', '$2,400', '15', '4', 'Beard Trim', 'New'],
//         // Add more rows based on actual data
//       ],
//       revenue: [
//         ['Date', 'Revenue', 'Appointments', 'Average Order Value'],
//         ['2024-06-01', '$2,100', '12', '$175'],
//         ['2024-06-02', '$1,850', '8', '$231'],
//         ['2024-06-03', '$2,400', '15', '$160'],
//         // Add more rows
//       ],
//       clients: [
//         ['Client Name', 'Email', 'Total Visits', 'Total Spent', 'Last Visit', 'Status'],
//         ['John Doe', 'john@example.com', '5', '$450', '2024-06-15', 'Active'],
//         ['Jane Smith', 'jane@example.com', '3', '$275', '2024-06-14', 'Active'],
//         ['Bob Johnson', 'bob@example.com', '8', '$720', '2024-06-13', 'VIP'],
//         // Add more rows
//       ],
//       services: [
//         ['Service Name', 'Total Bookings', 'Revenue', 'Average Price', 'Popularity %'],
//         ['Hair Cut & Style', '85', '$6,375', '$75', '31.8%'],
//         ['Color Treatment', '32', '$4,800', '$150', '12.0%'],
//         ['Beard Trim', '67', '$1,675', '$25', '25.1%'],
//         ['Deep Conditioning', '18', '$900', '$50', '6.7%'],
//         ['Consultation', '25', '$0', '$0', '9.4%'],
//       ]
//     }

//     // Get the appropriate data based on type
//     const dataToExport = exportData[type as keyof typeof exportData] || exportData.full

//     // Convert to CSV format
//     const csvContent = dataToExport
//       .map(row => row.map(cell => `"${cell}"`).join(','))
//       .join('\n')

//     // Create response with CSV data
//     const response = new NextResponse(csvContent, {
//       status: 200,
//       headers: {
//         'Content-Type': 'text/csv',
//         'Content-Disposition': `attachment; filename="analytics-${type}-${period}days-${new Date().toISOString().split('T')[0]}.csv"`
//       }
//     })

//     return response
//   } catch (error) {
//     console.error('Export API Error:', error)
//     return NextResponse.json(
//       { error: 'Failed to export analytics data' },
//       { status: 500 }
//     )
//   }
// }

// Temporary disable the export functionality
export async function GET() {
  return NextResponse.json(
    { message: 'Export functionality is temporarily disabled.' },
    { status: 503 }
  )
}

