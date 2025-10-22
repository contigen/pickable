'use client'

import { useState, useCallback, useEffect } from 'react'
import { parse } from 'csv-parse/browser/esm/sync'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type UploadedFile = {
  file: File
  id: string
  status: 'uploading' | 'processing' | 'completed' | 'error'
  preview?: string[][]
  errors?: string[]
}

type CsvUploadProps = {
  onValidFilesChange?: (validFiles: UploadedFile[]) => void
  maxFiles?: number
  showPreview?: boolean
  className?: string
}

export function CsvUpload({
  onValidFilesChange,
  maxFiles = 5,
  showPreview = true,
  className,
}: CsvUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)

  useEffect(() => {
    const validFiles = files.filter(f => f.status === 'completed')
    onValidFilesChange?.(validFiles)
  }, [files, onValidFilesChange])

  function validateCSV(file: File): Promise<{
    isValid: boolean
    preview?: string[][]
    errors?: string[]
  }> {
    return new Promise(resolve => {
      const reader = new FileReader()
      reader.onload = evt => {
        try {
          const text = evt.target?.result?.toString()
          if (!text) {
            return resolve({ isValid: false, errors: ['Invalid CSV format'] })
          }
          const records = parse(text, {
            skip_empty_lines: true,
            trim: true,
          })
          console.log('records: ', records)
          if (records.length < 2) {
            return resolve({
              isValid: false,
              errors: ['File must contain at least one data row with headers'],
            })
          }

          const headers = records[0]
          const preview = [headers, ...records.slice(1, 6)]

          console.log('preview: ', preview)

          const errors: string[] = []

          if (headers.length < 2) {
            errors.push('CSV must have at least 2 columns')
          }

          const hasDateColumn = headers.some(
            h =>
              h.toLowerCase().includes('date') ||
              h.toLowerCase().includes('time') ||
              h.toLowerCase().includes('month') ||
              h.toLowerCase().includes('year')
          )
          if (!hasDateColumn) {
            errors.push(
              'Consider including a date/time column for better forecasting'
            )
          }
          // Check for numeric columns (likely sales/revenue data)
          const hasNumericColumn = headers.some(
            h =>
              h.toLowerCase().includes('sales') ||
              h.toLowerCase().includes('revenue') ||
              h.toLowerCase().includes('amount') ||
              h.toLowerCase().includes('price') ||
              h.toLowerCase().includes('quantity')
          )
          if (!hasNumericColumn) {
            errors.push(
              'Consider including numeric columns (sales, revenue, quantity) for analysis'
            )
          }
          resolve({
            isValid: errors.length === 0,
            preview,
            errors,
          })
        } catch {
          resolve({ isValid: false, errors: ['Invalid CSV format'] })
        }
      }
      reader.readAsText(file)
    })
  }

  const MAX_FILE_SIZE = 10 * 1024 * 1024

  const handleFileUpload = useCallback(
    async (uploadedFiles: FileList) => {
      const newFiles: UploadedFile[] = []
      if (files.length + uploadedFiles.length > maxFiles) {
        toast.warning('Too many files', {
          description: `You can only upload up to ${maxFiles} files. Please remove some files first.`,
        })
        return
      }

      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i]

        if (!file.name.toLowerCase().endsWith('.csv')) {
          toast.warning('Invalid file type', {
            description: `${file.name} is not a CSV file. Please upload CSV files only.`,
          })
          continue
        }

        if (file.size > MAX_FILE_SIZE) {
          toast.warning('File too large', {
            description: `${file.name} is larger than ${MAX_FILE_SIZE}. Please upload a smaller file.`,
          })
          continue
        }

        const fileId = crypto.randomUUID()
        const uploadedFile: UploadedFile = {
          file,
          id: fileId,
          status: 'uploading',
        }

        newFiles.push(uploadedFile)
      }

      setFiles(prev => {
        const updated = [...prev, ...newFiles]
        return updated
      })

      for (const uploadedFile of newFiles) {
        const validation = await validateCSV(uploadedFile.file)

        setFiles(prev =>
          prev.map(f =>
            f.id === uploadedFile.id
              ? {
                  ...f,
                  status: validation.isValid
                    ? ('completed' as const)
                    : ('error' as const),
                  preview: validation.preview,
                  errors: validation.errors,
                }
              : f
          )
        )

        if (validation.isValid) {
          toast.success('File uploaded successfully', {
            description: `${uploadedFile.file.name} is ready for processing.`,
          })
        } else {
          toast.error('File validation failed', {
            description: `${uploadedFile.file.name} has validation errors.`,
          })
        }
      }
    },
    [MAX_FILE_SIZE, files.length, maxFiles]
  )

  function handleDrop(evt: React.DragEvent) {
    evt.preventDefault()
    setIsDragOver(false)
    const droppedFiles = evt.dataTransfer.files
    if (droppedFiles.length > 0) {
      handleFileUpload(droppedFiles)
    }
  }

  function handleDragOver(evt: React.DragEvent) {
    evt.preventDefault()
    setIsDragOver(true)
  }

  function handleDragLeave(evt: React.DragEvent) {
    evt.preventDefault()
    setIsDragOver(false)
  }

  function removeFile(fileId: string) {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const validFiles = files.filter(f => f.status === 'completed')

  return (
    <div className={cn('space-y-6', className)}>
      <Card className='relative'>
        <CardContent className='p-0'>
          <div
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300',
              isDragOver
                ? 'border-primary bg-primary/5 scale-[1.02]'
                : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5'
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className='space-y-4'>
              <div
                className={cn(
                  'mx-auto w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300',
                  isDragOver
                    ? 'bg-primary text-primary-foreground scale-110'
                    : 'bg-primary/10 text-primary'
                )}
              >
                <Upload className='size-6' />
              </div>
              <div className='space-y-2'>
                <h3 className='text-lg font-semibold'>
                  {isDragOver
                    ? 'Drop your files here'
                    : 'Drag & drop your CSV files'}
                </h3>
                <p className='text-muted-foreground text-sm'>
                  or click to browse your computer
                </p>
              </div>
              <div className='flex flex-wrap justify-center gap-2'>
                <Badge variant='outline'>CSV files only</Badge>
                <Badge variant='outline'>Max 10MB per file</Badge>
                <Badge variant='outline'>Up to {maxFiles} files</Badge>
              </div>
              <Button
                onClick={() =>
                  document.getElementById('csv-file-input')?.click()
                }
                className='mt-4'
                disabled={files.length >= maxFiles}
              >
                Choose Files
              </Button>
              <input
                id='csv-file-input'
                type='file'
                multiple
                accept='.csv'
                className='hidden'
                onChange={evt =>
                  evt.target.files && handleFileUpload(evt.target.files)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold'>Uploaded Files</h3>
          <div className='space-y-3'>
            {files.map(file => (
              <Card key={file.id} className='overflow-hidden'>
                <CardContent className='p-4'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3 flex-1'>
                      <div
                        className={cn(
                          'p-2 rounded-lg',
                          file.status === 'completed'
                            ? 'bg-green-100 text-green-600'
                            : file.status === 'error'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-blue-100 text-blue-600'
                        )}
                      >
                        <FileText className='size-4' />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2'>
                          <p className='font-medium truncate text-sm'>
                            {file.file.name}
                          </p>
                          {file.status === 'completed' && (
                            <CheckCircle className='size-4 text-green-600' />
                          )}
                          {file.status === 'error' && (
                            <AlertCircle className='size-4 text-red-600' />
                          )}
                        </div>
                        <p className='text-xs text-muted-foreground'>
                          {(file.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        {file.errors && (
                          <div className='mt-2 space-y-1'>
                            {file.errors.map((error, index) => (
                              <p key={index} className='text-xs text-red-600'>
                                {error}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => removeFile(file.id)}
                      >
                        <X className='size-4' />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {showPreview && validFiles.length > 0 && validFiles[0].preview && (
        <Card>
          <CardHeader>
            <CardTitle>Data Preview</CardTitle>
            <CardDescription>
              Preview of your uploaded data (showing first 5 rows)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='overflow-x-auto'>
              <table className='w-full border-collapse border border-border'>
                <thead>
                  <tr className='bg-muted/50'>
                    {validFiles[0].preview[0].map((header, index) => (
                      <th
                        key={index}
                        className='border border-border p-2 text-left font-medium text-sm'
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {validFiles[0].preview.slice(1).map((row, index) => (
                    <tr key={index} className='hover:bg-muted/25'>
                      {Object.values(row).map((value, cellIndex) => (
                        <td
                          key={cellIndex}
                          className='border border-border p-2 text-sm'
                        >
                          {String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
