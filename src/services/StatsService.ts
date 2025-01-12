export class StatsService {
  static formatNumber(num: string | number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }

  static formatDecimal(num: number, decimals: number = 2): string {
    return num.toFixed(decimals).replace(".", ",");
  }

  static getActionName(format: string): string {
    const actionMap: { [key: string]: string } = {
      "AdInsert Plus": "dodań do list zakupów",
      AdInsert: "przekierowań na landing page",
      AdDisplay: "przekierowań na landing page",
      "AdDisplay Plus": "dodań do list zakupów",
      SuperBanner: "przekierowań na landing page",
      AdVideo: "dodań do list zakupów/przekierowań na landing page",
    };
    return (
      actionMap[format] || "dodań do list zakupów/przekierowań na landing page"
    );
  }

  static calculateStats(
    stats: {
      totalImpressions: string;
      totalClicks: string;
    },
    benchmark: string
  ) {
    const ctr = (
      (Number(stats.totalClicks) / Number(stats.totalImpressions)) *
      100
    ).toFixed(2);
    const diff = Math.abs(Number(ctr) - Number(benchmark)).toFixed(2);
    const isLowerThanBenchmark = Number(ctr) < Number(benchmark);
    const ppDiff = isLowerThanBenchmark ? `-${diff} p.p.` : `+${diff} p.p.`;

    return {
      ctr,
      isLowerThanBenchmark,
      ppDiff,
    };
  }
}
