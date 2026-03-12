import { Request, Response } from 'express'
import { ActivityLogService } from '../services/ActivityLogService'
import { Role, UserPayload } from '../types'
import ExcelJS from 'exceljs'

export class ActivityLogController {
  private service = new ActivityLogService()

  getLogs = async (req: Request, res: Response) => {
    const requestor = req.user as UserPayload
    
    if (requestor.role !== Role.SUPER_ADMIN && requestor.role !== Role.MASTER_ADMIN) {
      return res.status(403).json({ success: false, message: 'Akses ditolak' })
    }

    const result = await this.service.getLogs(requestor)
    return res.status(result.success ? 200 : 500).json(result)
  }

  exportLogs = async (req: Request, res: Response) => {
    const requestor = req.user as UserPayload
    
    if (requestor.role !== Role.SUPER_ADMIN && requestor.role !== Role.MASTER_ADMIN) {
      return res.status(403).json({ success: false, message: 'Akses ditolak' })
    }

    try {
      const result = await this.service.getLogs(requestor)
      
      if (!result.success || !result.data) {
        return res.status(500).json({ success: false, message: 'Gagal mengambil data log' })
      }

      const logs = result.data

      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Log Aktivitas')

      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Tanggal & Waktu', key: 'createdAt', width: 25 },
        { header: 'Aktivitas', key: 'action', width: 15 },
        { header: 'Deskripsi', key: 'description', width: 50 },
        { header: 'Nama Pengguna', key: 'userName', width: 25 },
        { header: 'Instansi', key: 'agency', width: 20 },
      ]

      worksheet.getRow(1).font = { bold: true }
      worksheet.getRow(1).alignment = { horizontal: 'center' }

      logs.forEach((log: any) => {
        worksheet.addRow({
          id: log.id,
          createdAt: new Date(log.createdAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }), 
          action: log.action,
          description: log.description,
          userName: log.user?.name || 'Sistem',
          agency: log.user?.agency || '-',
        })
      })

      const prefix = requestor.role === Role.SUPER_ADMIN ? 'Semua' : requestor.agency
      const fileName = `Log_Aktivitas_${prefix}_${new Date().toISOString().slice(0, 10)}.xlsx`

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      )
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`)

      await workbook.xlsx.write(res)
      res.end()

    } catch (error) {
      console.error('Export Error:', error)
      return res.status(500).json({ success: false, message: 'Gagal mengekspor data ke Excel' })
    }
  }
}