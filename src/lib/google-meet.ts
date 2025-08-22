import { google } from 'googleapis'

export class GoogleMeetService {
  private oauth2Client: any

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    )
  }

  async createMeetSpace(accessToken: string) {
    try {
      this.oauth2Client.setCredentials({
        access_token: accessToken
      })

      const meet = google.meet({ version: 'v1', auth: this.oauth2Client })
      
      const space = await meet.spaces.create({
        requestBody: {
          config: {
            accessType: 'OPEN',
            entryPointFeatures: {
              accessLevel: 'ALL'
            }
          }
        }
      })

      return space.data.meetingUri || space.data.name
    } catch (error) {
      console.error('Error creating Google Meet space:', error)
      // Fallback to generating a random Meet link
      return `https://meet.google.com/${this.generateRandomCode()}`
    }
  }

  private generateRandomCode() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  async createCalendarEvent(accessToken: string, eventData: {
    summary: string
    description: string
    startTime: string
    endTime: string
    attendees: string[]
  }) {
    try {
      this.oauth2Client.setCredentials({
        access_token: accessToken
      })

      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client })
      
      const event = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
          summary: eventData.summary,
          description: eventData.description,
          start: {
            dateTime: eventData.startTime,
            timeZone: 'UTC'
          },
          end: {
            dateTime: eventData.endTime,
            timeZone: 'UTC'
          },
          attendees: eventData.attendees.map(email => ({ email })),
          conferenceData: {
            createRequest: {
              requestId: `meet-${Date.now()}`,
              conferenceSolutionKey: {
                type: 'hangoutsMeet'
              }
            }
          }
        },
        conferenceDataVersion: 1
      })

      return event.data.hangoutLink || event.data.conferenceData?.entryPoints?.[0]?.uri
    } catch (error) {
      console.error('Error creating calendar event:', error)
      return null
    }
  }
}