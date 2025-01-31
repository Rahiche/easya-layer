export interface SupportedCurrency {
    name: string;
    symbol: string;
}

export  const DEFAULT_SUPPORTED_CURRENCIES: SupportedCurrency[] = [
    {
        name: "US Dollar",
        symbol: "USD",
    },
    {
        name: "Euro",
        symbol: "EUR",
    },
    {
        name: "British Pounds",
        symbol: "GBP",
    },
];