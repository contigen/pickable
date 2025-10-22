import JsxParser from 'react-jsx-parser'

export function GenerativeUI({ ui }: { ui: string }) {
  return (
    <JsxParser
      jsx={ui}
      allowUnknownElements={false}
      disableKeyGeneration={false}
      showWarnings={true}
      renderError={props => (
        <div className='p-4 border border-destructive rounded-md bg-destructive/10'>
          <p className='text-destructive text-sm'>Error rendering component</p>
          <pre className='text-xs mt-2 text-muted-foreground'>
            {props.error}
          </pre>
        </div>
      )}
    />
  )
}
