// business logic

import { ReportRepository } from "../data/repository/reports-repo.js";

export class ReportService {
  private reportsRepo = new ReportRepository();

  async getHelloWorld(name: string) {
    const reports = await this.reportsRepo.getReportsForUser(name);

    return {
      id: 1,
      content: `Here are the reports, ${name}`,
      reports: reports.map((report, i) => ({
        name: `Report ${i}`,
        data: report,
      })),
    };
  }
}
