export class EwayBillService {
  private static API_BASE = process.env.MASTERS_INDIA_API_BASE || 'https://sandb-api.mastersindia.co/api/v1';
  private static USERNAME = process.env.MASTERS_INDIA_USERNAME;
  private static PASSWORD = process.env.MASTERS_INDIA_PASSWORD;
  private static DEFAULT_GSTIN = process.env.MASTERS_INDIA_GSTIN;

  /**
   * Fetches the JWT Token from Masters India API
   */
  public static async getAuthToken(): Promise<string> {
    if (!this.USERNAME || !this.PASSWORD) {
      throw new Error("Masters India credentials are not configured in environment variables.");
    }

    try {
      // 1. Check if we already have a valid token from today (last 23 hours) in the database
      const dbConnect = (await import('@/lib/db')).default;
      const ApiLog = (await import('@/models/ApiLog')).default;
      await dbConnect();

      const twentyThreeHoursAgo = new Date(Date.now() - 23 * 60 * 60 * 1000);
      const cachedTokenLog = await ApiLog.findOne({
        apiType: 'MASTERS_INDIA_TOKEN',
        responseStatus: 'success',
        createdAt: { $gte: twentyThreeHoursAgo }
      }).sort({ createdAt: -1 });

      if (cachedTokenLog && cachedTokenLog.errorMessage) {
        // Return the token we saved in the database
        return cachedTokenLog.errorMessage;
      }

      // 2. If no token found or it's expired, fetch a new one
      const response = await fetch(`${this.API_BASE}/token-auth/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: this.USERNAME,
          password: this.PASSWORD,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to authenticate with Masters India API');
      }

      if (!data.token) {
        throw new Error('Token not found in authentication response');
      }

      // 3. Save the new token in the database for the rest of the day
      const User = (await import('@/models/User')).default;
      const adminUser = await User.findOne({ role: 'admin' });
      
      await ApiLog.create({
        userId: adminUser ? adminUser._id : null, 
        apiType: 'MASTERS_INDIA_TOKEN',
        requestData: 'JWT',
        responseStatus: 'success',
        errorMessage: data.token // Saving token here
      });

      return data.token;
    } catch (error: any) {
      console.error('Error fetching Auth Token:', error);
      throw new Error(`Auth Error: ${error.message}`);
    }
  }

  /**
   * Fetches E-Way Bill details by EWB Number
   * @param ewbNo The 12-digit E-Way Bill Number
   * @param gstin Optional GSTIN to use for fetching (defaults to MASTERS_INDIA_GSTIN)
   */
  public static async fetchEwayBillDetails(ewbNo: string, gstin?: string): Promise<any> {
    const fetchGstin = gstin || this.DEFAULT_GSTIN;

    if (!fetchGstin) {
      throw new Error("GSTIN is required to fetch E-Way Bill details. Check environment variables.");
    }

    try {
      const token = await this.getAuthToken();

      const url = `${this.API_BASE}/getEwayBillData/?action=GetEwayBill&gstin=${fetchGstin}&eway_bill_number=${ewbNo}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `JWT ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      // The API returns details inside results.message
      if (data?.results?.message && typeof data.results.message === 'object') {
        // Handle successful fetch
        return data.results.message;
      } else if (data?.results?.errorMessage) {
        // Handle API level error (e.g. 2148: Requested IRN data is not available)
        throw new Error(data.results.errorMessage);
      } else {
        throw new Error('Invalid response structure from E-Way Bill API');
      }
    } catch (error: any) {
      console.error('Error fetching EWB details:', error);
      throw error;
    }
  }

  /**
   * Generates a Consolidated E-Way Bill (CEWB)
   * @param payload JSON payload formatted exactly for Masters India API
   */
  public static async generateConsolidatedEwayBill(payload: any): Promise<any> {
    try {
      const token = await this.getAuthToken();
      const url = `${this.API_BASE}/consolidatedEwayBillsGenerate/`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `JWT ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data?.results?.message && typeof data.results.message === 'object') {
        // Return exactly what the API returns in message object
        return data.results.message;
      } else if (data?.results?.errorMessage || data?.results?.message) {
        throw new Error(data.results.errorMessage || data.results.message);
      } else if (data?.error) {
        throw new Error(data.error);
      } else {
        throw new Error('Invalid response structure from CEWB Generate API');
      }

    } catch (error: any) {
      console.error('Error generating CEWB:', error);
      throw error;
    }
  }
}
