'use client'

import { useState, useTransition } from 'react'
import { Button, ButtonWithSpinner } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Upload, ArrowLeft, ArrowRight } from 'lucide-react'
import { CsvUpload } from '@/components/csv-upload'
import { processCSV } from '@/actions'
import { toast } from 'sonner'

type DataSourceMode = 'selection' | 'csv-upload'

type UploadedFile = {
  file: File
  id: string
  status: 'uploading' | 'processing' | 'completed' | 'error'
  preview?: string[][]
  errors?: string[]
}

export function DataSource({ handleNext }: { handleNext: () => void }) {
  const [mode, setMode] = useState<DataSourceMode>('selection')
  const [validFiles, setValidFiles] = useState<UploadedFile[]>([])
  const [pending, startTransition] = useTransition()

  async function handleCsvUploadComplete() {
    const fileName = validFiles.at(-1)?.file.name
    startTransition(async () => {
      const { records } = await processCSV(
        validFiles.flatMap(f => f.preview!),
        fileName!
      )
      if (!records) toast.error('Failed to process CSV')
      if (!pending && records) handleNext()
    })
  }

  function handleBackToSelection() {
    setMode('selection')
    setValidFiles([])
  }

  if (mode === 'csv-upload') {
    return (
      <Card>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='sm'
              onClick={handleBackToSelection}
              className='p-2'
            >
              <ArrowLeft className='size-4' />
            </Button>
            <div>
              <CardTitle>Upload CSV Files</CardTitle>
              <CardDescription>
                Upload your business data files for analysis and forecasting
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-6'>
          <CsvUpload
            onValidFilesChange={setValidFiles}
            maxFiles={3}
            showPreview={true}
          />

          {validFiles.length > 0 && (
            <div className='flex justify-between items-center pt-4 border-t'>
              <p className='text-sm text-muted-foreground'>
                {validFiles.length} file{validFiles.length > 1 ? 's' : ''} ready
                for processing
              </p>
              <ButtonWithSpinner
                onClick={handleCsvUploadComplete}
                className='flex items-center gap-2'
                pending={pending}
              >
                Continue
                <ArrowRight className='size-4' />
              </ButtonWithSpinner>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect Your Data Source</CardTitle>
        <CardDescription>
          Choose how you&apos;d like to import your business data
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid gap-4'>
          <Button
            variant='outline'
            className='h-auto p-6 justify-start bg-transparent'
            onClick={() => setMode('csv-upload')}
          >
            <Upload className='size-8 mr-4 text-primary' />
            <div className='text-left'>
              <div className='font-semibold'>Upload CSV Files</div>
              <div className='text-sm text-muted-foreground'>
                Upload sales, inventory, or customer data files
              </div>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
