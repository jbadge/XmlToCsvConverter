import React, { useState } from 'react'

const XmlToCsv = () => {
  const [error, setError] = useState<string | null>(null)
  const [numColumns, setNumColumns] = useState<number>(0)
  const [columnNames, setColumnNames] = useState<string[]>([])
  const [csvFileName, setCsvFileName] = useState<string>('output.csv')
  const [fileContent, setFileContent] = useState<string | null>(null)

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      setFileContent(text)
      setError(null)
    } catch (err) {
      setError('Error reading the file: ' + (err as Error).message)
    }
  }

  const handleSubmit = () => {
    if (!fileContent) {
      setError('Please select an XML file.')
      return
    }

    // Normalize the column names
    const normalizedColumnNames = columnNames.map(
      (name) =>
        name
          .trim()
          .replace(/\s+/g, '') // Remove spaces
          .replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`) // Convert to snake_case
    )

    console.log(normalizedColumnNames)
    try {
      // Create a case-insensitive regex for record matching
      const regexPattern = `<Record[^>]*(${normalizedColumnNames.map((name) => `${name}="([^"]*)"`).join('[^>]*')})[^>]*\\/?>`
      const regex = new RegExp(regexPattern, 'gi') // Use 'gi' for global and case-insensitive

      console.log('Dynamic Regex for record matching:', regex)

      let match: RegExpExecArray | null
      const output: string[] = []
      const headers = normalizedColumnNames.join(',')
      output.push(headers)

      while ((match = regex.exec(fileContent)) !== null) {
        if (match) {
          const values: string[] = normalizedColumnNames.map((column) => {
            // Use a case-insensitive regex to match the attributes
            const valueMatch = new RegExp(`${column}="([^"]*)"`, 'i').exec(
              match![0]
            )
            return valueMatch && valueMatch[1] ? valueMatch[1] : ''
          })

          output.push(values.join(','))
        }
      }

      if (output.length === 1) {
        setError('No matching data found in the XML for the specified columns.')
        return
      }

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
    setColumnNames(Array(count).fill(''))
  }

  const handleColumnNameChange = (index: number, value: string) => {
    const newNames = [...columnNames]
    newNames[index] = value // Store as-is for now
    setColumnNames(newNames)
  }

  return (
    <div className="container">
      <h1>XML to CSV Converter</h1>
      <input type="file" accept=".xml" onChange={handleFileChange} />
      {error && <p className="error">{error}</p>}

      <div className="input-group">
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
        <div className="input-group" key={index}>
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

      <div className="input-group">
        <label>
          CSV File Name:
          <input
            type="text"
            value={csvFileName}
            onChange={(e) => setCsvFileName(e.target.value)}
          />
        </label>
      </div>

      <button className="submit-button" onClick={handleSubmit}>
        Convert to CSV
      </button>
    </div>
  )
}

export default XmlToCsv
