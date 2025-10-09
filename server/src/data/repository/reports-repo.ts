// each repository is an exported class that contains all the sql queries/orm interactions required for that service

/**
 * Repository to handle database queries/communication related to reports
 */
export class ReportRepository {
  async getReportsForUser(name: string) {
    return [
      {
        example: 1,
        hello: name,
      },
      {
        example: 2,
        hello: `You are ${name}!`,
      },
      {
        example: 3,
        hello: `How are you, ${name}?`,
      },
    ];
  }
}
