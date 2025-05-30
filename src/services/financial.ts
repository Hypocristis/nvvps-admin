export const uploadToGoogleDrive = async (file: File, fileName: string) => {
  try {
    // Mock Google Drive API call
    console.log(`Uploading ${fileName} to Google Drive...`)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const mockDriveUrl = `https://drive.google.com/file/${Math.random().toString(36).substr(2, 9)}`
    console.log(`File uploaded successfully: ${mockDriveUrl}`)

    return mockDriveUrl
  } catch (error) {
    console.error("Error uploading to Google Drive:", error)
    throw error
  }
}

export const sendReminderEmail = async (invoice: any, userInfo: any) => {
  try {
    const greeting = invoice.representativeGender === "female" ? "Szanowna Pani" : "Szanowny Panie"

    const emailData = {
      to: invoice.representativeEmail,
      subject: `Przypomnienie o płatności - Faktura ${invoice.id}`,
      html: `
        <h2>Przypomnienie o płatności</h2>
        <p>${greeting} ${invoice.representativeName},</p>
        
        <p>Uprzejmie przypominamy o zaległej płatności za fakturę <strong>${invoice.id}</strong> z dnia ${invoice.date}.</p>
        
        <h3>Szczegóły faktury:</h3>
        <ul>
          <li><strong>Numer:</strong> ${invoice.id}</li>
          <li><strong>Kwota:</strong> ${invoice.amount.toLocaleString()} zł</li>
          <li><strong>Termin płatności:</strong> ${invoice.dueDate}</li>
          <li><strong>Klient:</strong> ${invoice.client}</li>
        </ul>
        
        <p>Prosimy o jak najszybsze uregulowanie należności.</p>
        
        <p>Z poważaniem,<br>
        ${userInfo?.fullName || userInfo?.name || "Panel Finansowy"}<br>
        ${userInfo?.primaryEmailAddress?.emailAddress || userInfo?.email}</p>
      `,
    }

    // Mock Email API call (replace with actual service like SendGrid, Resend, etc.)
    console.log("Sending email via API:", emailData)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log("Email sent successfully!")
    return true
  } catch (error) {
    console.error("Error sending email:", error)
    throw error
  }
} 