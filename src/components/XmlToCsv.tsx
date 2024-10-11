import React, { useState } from 'react'

const XmlToCsv = () => {
  const [error, setError] = useState<string | null>(null)
  const [numColumns, setNumColumns] = useState<number>(0)
  const [columnNames, setColumnNames] = useState<string[]>([])
  const [csvFileName, setCsvFileName] = useState<string>('output.csv')

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()

      const regex = /<Record[^>]*>(.*?)<\/Record>/g
      let match

      // Prepare the output CSV
      const output: string[] = []
      const headers = columnNames.join(',') // Join specified column names
      output.push(headers)

      while ((match = regex.exec(text)) !== null) {
        const recordContent = match[1]

        // Extract the values for the specified column names
        const values: string[] = columnNames.map((column) => {
          const valueMatch = new RegExp(`${column}="([^"]*)"`).exec(
            recordContent
          )
          return valueMatch ? valueMatch[1] : '' // Fallback to empty string if not found
        })

        output.push(values.join(',')) // Join values for this record
      }

      // Generate CSV for download
      const blob = new Blob([output.join('\n')], {
        type: 'text/csv;charset=utf-8;',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.setAttribute('download', csvFileName)
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (err) {
      setError('Error processing the file: ' + (err as Error).message)
    }
  }

  const handleColumnCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = parseInt(e.target.value, 10)
    setNumColumns(count)
    setColumnNames(Array(count).fill('')) // Initialize column names array
  }

  const handleColumnNameChange = (index: number, value: string) => {
    const newNames = [...columnNames]
    newNames[index] = value
    setColumnNames(newNames)
  }

  return (
    <div>
      <h1>Generic XML to CSV Converter</h1>
      <input type="file" accept=".xml" onChange={handleFileChange} />
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div>
        <label>
          How many columns would you like to extract?
          <input
            type="number"
            value={numColumns}
            onChange={handleColumnCountChange}
            min="1"
          />
        </label>
      </div>

      {Array.from({ length: numColumns }, (_, index) => (
        <div key={index}>
          <label>
            Column {index + 1} name:
            <input
              type="text"
              value={columnNames[index] || ''}
              onChange={(e) => handleColumnNameChange(index, e.target.value)}
            />
          </label>
        </div>
      ))}

      <div>
        <label>
          CSV File Name:
          <input
            type="text"
            value={csvFileName}
            onChange={(e) => setCsvFileName(e.target.value)}
          />
        </label>
      </div>
    </div>
  )
}

export default XmlToCsv
