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
}
