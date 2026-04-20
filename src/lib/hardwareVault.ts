/**
 * hardwareVault.ts
 * Manages the Director's encrypted hardware export pipeline.
 */

export async function exportToHardwareVault(financialData: any[], filename = `Banquety_Vault_${new Date().toISOString().split('T')[0]}.csv`) {
  try {
    // 1. Array to CSV extraction
    if (!financialData || financialData.length === 0) {
      throw new Error("No data to export.");
    }
    
    // Dynamically grab headers
    const headers = Object.keys(financialData[0]);
    const csvContent = [
      headers.join(","), // header row
      ...financialData.map(row => headers.map(fieldName => JSON.stringify(row[fieldName] || "")).join(","))
    ].join("\n");

    // 2. Hardware File Picker Request
    // Note: requires modern HTTPS chromium browser or fallback
    if ('showSaveFilePicker' in window) {
      const opts = {
        suggestedName: filename,
        types: [{
          description: 'Secure Hardware Format (CSV)',
          accept: { 'text/csv': ['.csv'] },
        }],
      };
      
      const handle = await (window as any).showSaveFilePicker(opts);
      const writable = await handle.createWritable();
      await writable.write(csvContent);
      await writable.close();
      return true;
    } else {
      // Fallback for older browsers (standard download, but insecure pipeline)
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      return true;
    }
  } catch (err: any) {
    if (err.name !== 'AbortError') {
      console.error("Hardware Vault Export failed: ", err);
      throw err;
    }
    return false; // User cancelled
  }
}
